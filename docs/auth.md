# Hold Shelf Authentication

This document describes how authentication works in Hold Shelf, from browser
route protection and Better Auth wiring to personal REST API credentials and
required secrets.

## Overview

Hold Shelf has two authenticated client surfaces:

- the web app uses Better Auth with GitHub OAuth and cookie-based sessions
- the personal REST API and CLI use app-owned personal access tokens in the
  `Authorization` header

Authentication is split across:

- server config in `src/lib/auth.ts`
- client helpers in `src/lib/auth-client.ts`
- auth API route in `src/routes/api/auth/$.ts`
- session access helpers in `src/server/auth.ts` and `src/server/helpers.ts`
- personal-access-token lifecycle code in `src/server/api-tokens*.ts`
- personal-access-token verification and shared REST request handling in
  `src/server/api-token-auth.ts` and `src/server/api-v1.ts`

## Core building blocks

### `src/lib/auth.ts`

`getAuth()` creates the Better Auth instance at request time.

Why request time matters:

- Cloudflare bindings and secrets are only available during request handling
- D1 access is request-scoped through `getDb()`
- auth config must be built from the current Worker environment

Configured features:

- email/password login disabled
- GitHub provider enabled as the required sign-in method
- Better Auth account deletion enabled for signed-in users
- Drizzle adapter backed by D1
- TanStack Start cookie plugin
- production-only HTTPS auth hosts and explicit Secure cookies, independent of
  runtime `NODE_ENV`
- no durable retention of GitHub provider credentials (account create/update
  hooks strip access, refresh and ID tokens after the identity exchange)

## Client-side auth

### `src/lib/auth-client.ts`

Exports a Better Auth React client used by UI components.

Used by:

- `LoginPage` for GitHub sign in
- `AppToolbar` for session display and sign out
- `AccountSummaryCard` for provider and profile details

## Auth API route

### `src/routes/api/auth/$.ts`

This route delegates GET and POST requests to Better Auth.

Responsibilities:

- receives Better Auth API traffic at `/api/auth/*`
- applies POST rate limiting before handing off to Better Auth
- uses `getClientRateLimitKey(request)` to rate limit by client identity

Current auth rate limit:

- name: `auth`
- window: 60 seconds
- max: 10 POST requests per client key

When the limit is exceeded, the route returns:

- status `429`
- `Retry-After` header

## Session access patterns

### Route-level checks

`src/routes/app.tsx` protects the authenticated app shell.

Flow:

1. `beforeLoad` calls `getSession()`
2. if no session exists, the route redirects to `/login`
3. authenticated users continue into the `/app/*` route tree

### Public route redirects

Signed-in users are redirected away from public auth screens:

- `/` redirects to `/app/home` when a session exists
- `/login` redirects to `/app/home` when a session exists

### Public tag-sharing exception

`/share/:token` is intentionally accessible without a session. The opaque token
is a bearer capability for exactly one tag; it does not grant access to `/app`
or to authenticated server functions.

The public loader returns only:

- the sharing account's first name, derived from `user.name`
- the shared tag name
- current public article metadata for that tag

Creating, inspecting, and revoking a share still require `requireUserId()` and
tag ownership. Invalid and revoked tokens reveal no account or tag information.

This sharing token is a narrow public capability and is unrelated to a personal
access token. It cannot authenticate an API request.

### Server function authorization

`requireUserId()` is the main server-side guard for user-owned data.

Used by server domains such as:

- `src/server/articles.ts`
- `src/server/tags.ts`
- `src/server/dashboard.ts`

Behavior:

1. reads the current request with `getRequest()`
2. asks Better Auth for the session using request headers
3. throws `Unauthorized` if no authenticated user exists
4. returns `session.user.id` for downstream queries

## Personal REST API authentication

`/api/v1/*` does not use the Better Auth browser session cookie. Every request
must send:

```text
Authorization: Bearer hs_...
```

The flow is:

1. the shared v1 request helper rate-limits the request by client IP before
   token lookup
2. `api-token-auth.ts` parses exactly one Bearer credential and validates the
   `hs_` token format
3. the token is SHA-256 hashed and looked up by hash; the raw token is never
   queried or stored
4. a successful lookup yields the owning user ID and updates `lastUsedAt`
5. the shared helper applies the authenticated per-user request limit
6. the endpoint delegates to a user-scoped application service

Missing or invalid credentials return `401`. Requests are limited to 60 per
minute per client IP at the authentication boundary and authenticated requests
to 120 per minute per user. Limit responses return `429` with `Retry-After`.
Missing and unowned singular resources both return `404`, so the API does not
disclose another account's resource IDs.

### Token lifecycle and current limitation

Users create, regenerate, and revoke a personal access token from Settings. A
token starts with `hs_` and contains 32 random bytes encoded with base64url. The
full token is returned only when generated; D1 stores its SHA-256 hash, a short
display prefix, creation time, and last-used time.

`api_tokens.user_id` is currently the table's primary key, so each account can
have only one active personal access token. Regeneration replaces the stored
hash immediately and therefore invalidates the CLI and every other integration
using the previous token. This is accepted for CLI v1 and is called out during
login; multiple named, scoped, expiring credentials require a later schema and
product change.

### CLI login decision

CLI v1 reuses this personal access token rather than exporting a Better Auth
cookie or treating a CLI as a browser session:

1. `hold-shelf auth login` points the user to Settings -> API access
2. the CLI reads the pasted token without echoing it
3. `GET /api/v1/me` validates both the credential and selected service URL
4. the CLI stores the token in the operating-system credential store

The token is never accepted as a normal command argument or written to the
non-secret CLI config file. `HOLD_SHELF_TOKEN` supports CI and headless use
without persistence. `auth logout` removes only the local credential; token
revocation and regeneration remain account-level Settings actions.

### Future browser-assisted login

If copy-and-paste login becomes a material usability problem, the intended
migration is the
[OAuth 2.0 Device Authorization Grant (RFC 8628)](https://www.rfc-editor.org/rfc/rfc8628),
using an external browser as recommended for native clients by
[RFC 8252](https://www.rfc-editor.org/rfc/rfc8252). Better Auth now documents a
[Device Authorization plugin](https://www.better-auth.com/docs/plugins/device-authorization)
and an OAuth-provider integration specifically for CLI clients.

The target is a registered public native client receiving short-lived,
audience-bound, scoped OAuth access tokens plus a rotating refresh token stored
in the OS credential store. Better Auth's standalone device flow can yield a
Better Auth session token; that browser-equivalent session token is not the
target API credential. The production design should combine device
authorization with the OAuth Provider/JWT resource-server path instead.

This is intentionally later work. It adds plugin/dependency and schema changes,
client registration, approval UI, polling limits, scope/resource design, JWT
verification, refresh/revocation behavior, and a compatibility period for
existing `hs_` tokens.

## UI flows

### GitHub sign in and registration

In `LoginPage`:

1. user clicks "Continue with GitHub"
2. `authClient.signIn.social()` is called with provider `github`
3. Better Auth handles the OAuth flow
4. first-time GitHub users are registered during the callback flow
5. returning GitHub users are signed back into the same account
6. success returns to `/app/home`
7. errors return to `/login`

GitHub OAuth requires both of these Worker secrets:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

### Sign out

In `AppToolbar`:

1. user opens the profile dropdown
2. `authClient.signOut()` is called
3. router navigates to `/login`

### Account summary

In `AccountSummaryCard`:

1. settings reads the current session with `authClient.useSession()`
2. UI shows the current GitHub-backed profile name, email, and avatar
3. UI states that GitHub is the only sign-in method for the account

### Delete account

In `DeleteAccountCard`:

1. settings opens a confirmation dialog from the danger zone card
2. the user must type `DELETE` before the destructive action is enabled
3. `authClient.deleteUser()` calls Better Auth's `/delete-user` endpoint
4. Better Auth deletes the auth user, clears sessions, and D1 cascades app data
5. the client routes the now-signed-out user back to `/login`

Important behavior:

- Better Auth account deletion must be enabled in `getAuth()`
- deletion can fail with `SESSION_EXPIRED` if the current session is no longer fresh
- app tables such as `articles`, `tags`, and `article_tags` are removed through foreign-key cascades from `user.id`

## Environment configuration

### Required secrets

Declared in `src/env.d.ts`:

- `BETTER_AUTH_SECRET`
- `SENTRY_DSN`

For auth specifically:

- `BETTER_AUTH_SECRET` is required
- `GITHUB_CLIENT_ID` is required
- `GITHUB_CLIENT_SECRET` is required

Important rule:

- both GitHub secrets must be present or `getAuth()` throws

### Required Worker vars

Defined in `wrangler.jsonc`:

- `BETTER_AUTH_URL`
- `TRUST_PROXY_HEADERS`

Current production base URL:

- `https://hold-shelf.com`

Production auth accepts only `hold-shelf.com` and `www.hold-shelf.com`, always
using HTTPS. `BETTER_AUTH_URL` must be an HTTPS origin on one of these domains;
credentials, nonstandard ports, paths, query strings and fragments are rejected.
Forwarded host/protocol headers do not expand that host allowlist.

The Vite development build (`import.meta.env.DEV`) is explicitly separate:
`.dev.vars` must set `BETTER_AUTH_URL=http://localhost:3000` (or another HTTP
loopback origin on `localhost`, `127.0.0.1` or `[::1]`). Development uses
non-Secure HTTP cookies and does not trust production origins. A production
build never enables local HTTP authentication merely because `NODE_ENV` is
missing or an attacker supplies a localhost Host header.

### Trusted client identity

Auth POST and personal REST API pre-auth limits share `client-key.ts`.
With `TRUST_PROXY_HEADERS=true`, only a valid single `CF-Connecting-IP` is
accepted. Arbitrary `X-Forwarded-For`, `X-Real-IP` and User-Agent values cannot
rotate the limiter bucket. Without a trusted identity, all requests share the
conservative `ip:unknown` bucket; this avoids an attacker-controlled fallback
but may cause shared throttling if ingress is misconfigured. Better Auth's
own IP resolver likewise uses only `CF-Connecting-IP` in production.

This trust is appropriate only for Cloudflare-managed ingress that supplies
the header, not a directly reachable Node origin accepting client-supplied
Cloudflare headers. Verify custom domains, alternate Worker hostnames and any
same-zone Worker subrequests; restrict untrusted Worker code with permission
to alter `X-Real-IP`/client identity. Never enable this trust flag on a public
origin that clients can reach without the trusted proxy. Keep coarse Cloudflare
edge rate limits as a separate deployment control; these application changes
do not configure them.

### Secure-cookie rollout

Production cookies now use Better Auth's `__Secure-better-auth.*` names with
`Secure; HttpOnly; SameSite=Lax; Path=/` and no cross-subdomain `Domain`.
Both OAuth state-cookie strategies inherit this policy.

Existing unprefixed session cookies are deliberately **not migrated or accepted**.
Users with those cookies must sign in with GitHub again; an in-flight OAuth flow
started before deployment must be restarted. Auth endpoint responses expire
known old unprefixed session/state/cache cookie names when present, including
cache chunks. The browser's existing cookies are not cleaned before it first
reaches an auth endpoint, so the HTTPS redirect and HSTS rollout still matter.

This does not delete sessions from D1 or revoke sessions in other clients. Old
session rows expire under Better Auth's normal expiry policy. Rejecting the old
cookie name is **not cryptographic revocation**: a previously stolen signed
session token could still be replayed under the new cookie name until revoked
or expired. Decide whether to revoke all existing sessions during the reviewed
rollout; if exposure is suspected, revoke affected sessions as an explicit
incident-response action. Neither revocation is done automatically by this
change. Rolling back to the insecure cookie policy is not a safe recovery plan.

### Provider-token cleanup migration

Migration `0011_clear_unused_oauth_tokens.sql` sets the GitHub account fields
`access_token`, `refresh_token`, `id_token`, `access_token_expires_at` and
`refresh_token_expires_at` to NULL. It preserves account/provider/user IDs,
profile metadata, web sessions and app-owned personal access tokens. New and
returning OAuth logins discard the same fields through Better Auth adapter
hooks; provider data is not placed in an account cookie.

This is intentional data minimization, **not** enabling encryption over legacy
plaintext in place. The app uses GitHub only to establish identity and does not
call GitHub on a user's behalf after sign-in. Future provider-API integration
requires an intentional retention, encryption and secret-rotation design;
Better Auth's provider access-token/refresh API is not supported by this app.

Apply the migration through the normal reviewed D1 migration process after
recording a Time Travel bookmark and validating backups. It has only been tested
against disposable local data; this change does not execute a remote migration.
Deleting these fields is irreversible through a code rollback and does not revoke
the provider grant or invalidate old backup copies. No token extraction or
plaintext copy is needed for this migration; restrict and age out old backups
under the deployment retention policy. GitHub sign-in can establish fresh
identity exchanges without restoring the removed tokens.

## Database model

Better Auth stores data in these tables from `src/db/schema.ts`:

- `user`
- `session`
- `account`
- `verification`

App-owned content tables reference `user.id`, for example:

- `articles.userId`
- `tags.userId`
- `api_tokens.userId`

This is what makes user data isolation possible in server queries.

The `account` table stores OAuth provider data and no longer stores password
hashes.

`api_tokens.userId` is both a foreign key and the primary key. This enforces the
current one-active-token-per-user model and cascades token deletion with account
deletion.

## Security notes

- app data access is always scoped through `requireUserId()`
- article and tag mutations validate ownership before writes
- auth POST traffic is rate-limited
- auth state is server-checked before entering `/app`
- personal access tokens are stored only as SHA-256 hashes and accepted only from
  the Bearer header
- token-auth attempts and authenticated v1 requests are rate-limited separately
- CLI credentials are kept in the operating-system credential store or supplied
  ephemerally through `HOLD_SHELF_TOKEN`
- public tag-share reads are scoped by a high-entropy token and explicit public
  data projection
- GitHub OAuth is the only enabled sign-in method

## Troubleshooting

### Redirect loop to `/login`

Check:

- `BETTER_AUTH_SECRET` is set
- `BETTER_AUTH_URL` matches the real deployed origin
- auth cookies are being set correctly on the deployed domain

### GitHub sign-in not available or failing

Check:

- both GitHub secrets are present
- the GitHub OAuth app callback URL matches the deployed auth URL
- production origin and Better Auth base URL are aligned

### Unauthorized server errors

Check:

- the request is authenticated
- the server function uses `requireUserId()` inside a valid request context
- the target article or tag belongs to the current user

### CLI or personal API returns `401`

Check:

- the header is exactly `Authorization: Bearer hs_...`
- the token was copied in full when Settings displayed it
- another integration has not regenerated the account's one active token
- the CLI is pointed at the same Hold Shelf service where the token was created

Use `GET /api/v1/me` or `hold-shelf auth status` as the smallest credential
health check. Do not put the token in a URL, shell history, or diagnostic output.
