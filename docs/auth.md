# Hold Shelf Authentication

This document describes how authentication works in Hold Shelf, from route
protection to Better Auth wiring and required secrets.

## Overview

Hold Shelf uses Better Auth with:

- GitHub OAuth authentication
- cookie-based session handling for TanStack Start

Authentication is split across:

- server config in `src/lib/auth.ts`
- client helpers in `src/lib/auth-client.ts`
- auth API route in `src/routes/api/auth/$.ts`
- session access helpers in `src/server/auth.ts` and `src/server/helpers.ts`

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
- Drizzle adapter backed by D1
- TanStack Start cookie plugin

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

## Database model

Better Auth stores data in these tables from `src/db/schema.ts`:

- `user`
- `session`
- `account`
- `verification`

App-owned content tables reference `user.id`, for example:

- `articles.userId`
- `tags.userId`

This is what makes user data isolation possible in server queries.

The `account` table stores OAuth provider data and no longer stores password
hashes.

## Security notes

- app data access is always scoped through `requireUserId()`
- article and tag mutations validate ownership before writes
- auth POST traffic is rate-limited
- auth state is server-checked before entering `/app`
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
