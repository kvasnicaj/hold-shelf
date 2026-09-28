# Hold Shelf CLI architecture

This document defines the architecture and delivery plan for the Hold Shelf
command-line client. It is the canonical reference for the CLI package, its
public commands, its API boundary, and its authentication model.

## Goals

The CLI must let a user:

- list, filter, search, and sort their articles
- list favorite articles
- list tags and filter articles by tag
- read extracted article text
- save an article and optionally assign existing tags
- mark an article read or unread, favorite or unfavorite, and delete it
- add or remove article tags
- inspect library and weekly reading statistics
- use stable JSON output in scripts as well as readable terminal output

The first release is intentionally a non-interactive command CLI, not a
terminal UI. It operates against the deployed Hold Shelf service and does not
open D1 directly.

## System boundary

```text
terminal
  -> @hold-shelf/cli (Node.js)
    -> HTTPS + Authorization: Bearer hs_...
      -> /api/v1 transport handlers (Cloudflare Worker)
        -> existing application services
          -> existing D1 repositories / metadata and reader extraction
```

The package boundary is deliberate:

- the CLI owns argument parsing, credential access, HTTP calls, and output
- `/api/v1` owns HTTP authentication, validation, rate limits, and error mapping
- `@hold-shelf/api-contracts` owns the shared JSON request/response schemas and
  TypeScript wire types used by both sides
- application services own user-scoped behavior and are shared with the web app
- repositories remain the only code that queries D1

The CLI must not import `cloudflare:workers`, D1 repositories, TanStack server
functions, React components, or browser-session helpers. Those modules require a
request-scoped Worker or browser environment and cannot run reliably in Node.

## Repository layout

The CLI is a separate pnpm workspace package:

```text
packages/cli/
|- package.json
|- tsconfig.json
|- src/
   |- bin.ts                 executable entry point
   |- cli.ts                 root command and global options
   |- api/                   typed HTTP client and response types
   |- auth/                  login, logout, status, credential-store port
   |- commands/              articles, tags, search, and dashboard commands
   |- config/                service URL and environment resolution
   |- output/                table, text, JSON, and error rendering
   |- helpers.ts             package-wide CLI-only helpers
   |- types.ts               package-wide CLI-only shared types
```

The sibling `packages/api-contracts/` workspace is the single source for the v1
wire contract. It contains environment-neutral Zod schemas and inferred types;
the Worker uses them at the HTTP boundary and the CLI uses them to build queries
and validate responses. D1 record types and `Date` objects stay in the server
domain and never become CLI dependencies.

Feature directories may add their own `helpers.ts` and `types.ts`. Command files
contain command registration and execution only. Shared API calls, output, tag
resolution, pagination, and error handling must be centralized rather than
repeated between commands.

The package targets supported Node.js LTS releases, uses built-in `fetch`, and
builds to ESM JavaScript for installation as `hold-shelf` with the short `hs`
alias. It remains private until the install and release workflow is decided.

## Command surface

```text
hold-shelf auth login [--token-stdin]
hold-shelf auth logout
hold-shelf auth status

hold-shelf articles list [--tag <name>] [--sort newest|oldest|title]
                         [--read|--unread] [--favorite]
                         [--limit <count>] [--page <number>]
hold-shelf articles search <query> [list options]
hold-shelf articles favorites [list options]
hold-shelf articles show <article-id> [--format text|markdown]
hold-shelf articles add <url> [--tag <name>...]
hold-shelf articles mark <article-id> --read|--unread
hold-shelf articles favorite <article-id>
hold-shelf articles unfavorite <article-id>
hold-shelf articles tag add <article-id> <tag-name>
hold-shelf articles tag remove <article-id> <tag-name>
hold-shelf articles delete <article-id> [--yes]

hold-shelf tags list
hold-shelf dashboard
```

Global options are `--json`, `--server <url>`, `--timeout <milliseconds>`, and
`--no-color`. `--token-stdin` is the explicit non-interactive login path; a
normal interactive login uses a masked password prompt so the token is not
echoed.

Every command supports `--json`. Human output is the default; scripts can opt
into stable JSON explicitly. JSON output contains only JSON on stdout so it can
be piped safely. Diagnostics go to stderr. Destructive commands require
confirmation unless `--yes` is supplied. Non-interactive callers must be
explicit.

`articles add --tag` accepts existing tag names. The CLI resolves all tag names
before saving, then saves the URL and assigns tags through idempotent API calls.
If the URL was already saved, the create response includes its article ID, so a
retry can finish tag assignment without creating a duplicate. Creating new tags
from the CLI is outside the first release.

## REST API surface

The CLI uses the existing versioned personal-access-token API and adds only the
missing transport adapters:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/me` | validate the current credential |
| `GET` | `/api/v1/articles` | list, filter, search, sort, and paginate |
| `POST` | `/api/v1/articles` | save an article URL |
| `GET` | `/api/v1/articles/:id` | fetch metadata and cached/extracted text |
| `PATCH` | `/api/v1/articles/:id` | change read or favorite state |
| `DELETE` | `/api/v1/articles/:id` | delete one article |
| `PUT` | `/api/v1/articles/:id/tags/:tagId` | assign a tag idempotently |
| `DELETE` | `/api/v1/articles/:id/tags/:tagId` | remove a tag idempotently |
| `GET` | `/api/v1/tags` | list tags and article counts |
| `GET` | `/api/v1/dashboard` | return normalized dashboard statistics |

Handlers authenticate and rate-limit through one shared v1 request helper. They
delegate to the same article, tag, reader, and dashboard services as the web app.
Missing or unowned singular resources return `404`; malformed input returns
`400`; an invalid token returns `401`; throttling returns `429` with
`Retry-After`. Errors keep the v1 JSON shape `{ "code": string, "message":
string }`.

Dates cross the HTTP boundary as ISO 8601 strings. The shared API contract
describes the serialized wire format rather than reusing D1 record types
containing `Date` objects.

## Authentication decision

CLI v1 uses the existing personal access token, not a Better Auth browser
session. This keeps the first release on the already-deployed, versioned API
boundary without exporting a browser cookie or adding a second credential
system before the commands prove useful.
The repository already provides the required security properties:

- a token has an `hs_` prefix and 32 random bytes
- only its SHA-256 hash and a display prefix are stored in D1
- the full value is shown once in Settings
- `/api/v1` accepts it only in the `Authorization: Bearer` header
- authentication attempts and authenticated API requests are rate-limited

Login works as follows:

1. `auth login` directs the user to the API access card in web Settings.
2. The command reads the pasted token without echoing it.
3. The CLI calls `GET /api/v1/me` to validate the token and service URL.
4. On success, the token is stored in the operating system credential store.

Tokens must never be accepted as a normal command argument because arguments can
appear in shell history and process listings. They must never be written to the
ordinary CLI config file, query strings, logs, or error output. In CI or a
headless environment, `HOLD_SHELF_TOKEN` supplies a token without persistence.
`HOLD_SHELF_URL` selects another server; credentialed requests use HTTPS except
for explicit localhost development and must not follow redirects to another
origin.

`auth logout` removes the local credential only. Regeneration and revocation
remain account-level actions in web Settings.

### Current limitation

The database currently allows one personal access token per user. Regenerating it
invalidates the CLI and any other integration using the same token. This is
acceptable for the first release but must be visible in login help. Multiple
named, scoped, expiring credentials are a later authentication migration, not a
prerequisite for the CLI.

### Future browser-assisted login

If copy-and-paste login becomes a product problem, migrate to the
[OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628).
The target design is a registered public native client with short-lived,
audience-bound access tokens, explicit API scopes, and a rotating refresh token
stored in the OS credential store. This also follows the external-browser model
for native clients in
[RFC 8252](https://www.rfc-editor.org/rfc/rfc8252).

Better Auth documents both a
[Device Authorization plugin](https://www.better-auth.com/docs/plugins/device-authorization)
and its composition with an OAuth Provider for CLI API access. The target is
that scoped OAuth access-token path. A standalone device flow that returns a
browser-equivalent Better Auth session token is not the target design.

That work requires plugin/dependency and database changes, an approval page,
device-code polling limits, OAuth public-client registration, scope and resource
design, API JWT verification, refresh/revocation behavior, and a compatibility
period in which existing `hs_` tokens continue to work.

## Configuration and credential precedence

The client resolves values in this order:

1. command-level service URL option, when provided
2. `HOLD_SHELF_URL` and `HOLD_SHELF_TOKEN`
3. saved non-secret configuration and OS credential store
4. production URL `https://hold-shelf.com`

An environment token is never persisted automatically. Credential storage sits
behind an interface so keychain implementations and tests are replaceable. If a
secure store is unavailable, login fails with guidance to use the environment
variable for that invocation; it does not silently downgrade to plaintext.

## Output and automation contract

- successful commands exit `0`
- validation or usage errors exit `2`
- authentication failures exit `3`
- not-found errors exit `4`
- rate limits or temporary network/service failures exit `5`
- other failures exit `1`
- Ctrl-C exits `130`
- `NO_COLOR` is honored
- tokens and authorization headers are always redacted

The HTTP client sets a versioned user agent, has a finite timeout, parses the
standard API error shape, and exposes one typed error class to commands. It may
retry safe reads after transient failures or `429` responses, but it does not
blindly retry destructive mutations.

## Verification strategy

- application-service tests remain the source of truth for domain behavior
- shared-contract tests cover accepted request values and every serialized
  response shape
- API handler tests cover authentication, validation, status/error mapping, and
  delegation to existing services
- CLI unit tests use injected HTTP and credential-store ports
- command tests cover argument mapping, human output, JSON-only stdout, exit
  codes, confirmation, pagination, and token redaction
- an integration smoke test runs the built CLI against the local Worker and D1
  emulator with a disposable account/token
- repository `check`, `typecheck`, tests, and production build must pass before
  release

## Delivery slices

1. Expand `/api/v1`, extract reusable repositories/request plumbing, and add
   handler tests.
2. Add the workspace package, HTTP client, secure token login, output contract,
   and read-only list/search/tags/dashboard commands.
3. Add show/save/mutation/tag commands and retry-safe save-with-tags behavior.
4. Add local integration coverage, install documentation, shell completions,
   and the release workflow.
5. Revisit multiple tokens and OAuth Device Authorization based on real usage.
