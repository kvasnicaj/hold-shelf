# Hold Shelf Deployment

This document describes how Hold Shelf is built, configured, and deployed to
Cloudflare Workers.

## Overview

Hold Shelf runs on:

- Cloudflare Workers for application hosting
- Cloudflare D1 for the database
- GitHub Actions for CI and automatic production deployment

Key files:

- `wrangler.jsonc`
- `.github/workflows/ci.yml`
- `src/server-entry.ts`
- `src/env.d.ts`

## Deploying your own instance

The checked-in Worker, database identifier, and custom domains target the original
Hold Shelf service. Before deploying a fork, create your own D1 database and update
`wrangler.jsonc` with your Worker name, database ID, domain routes, and
`BETTER_AUTH_URL`. Register a GitHub OAuth app with callback
`https://YOUR_DOMAIN/api/auth/callback/github` and configure its credentials as
Worker secrets. To enable automatic deployment for your fork, update the
`github.repository` condition in the CI deployment job to your repository name.
Do not point a fork at the original service's resources.

For local development, `.dev.vars` overrides the auth URL and OAuth credentials;
the D1 emulator keeps development data local. No Cloudflare API token is needed
for that setup.

## Public contribution safeguards

CI declares read-only repository permissions and does not persist checkout
credentials. Third-party actions are pinned to commit SHAs. The CI secret-scan job
verifies the Gitleaks download checksum and scans available Git history with
redacted output. Pull-request jobs receive no Cloudflare deployment token; the
deployment job runs only for pushes to `main`.

For a public repository, configure private vulnerability reporting,
secret scanning/push protection, and require the `check` and `secrets` jobs in a
branch ruleset. Require approval for workflows from outside contributors. These
are repository settings, not settings applied by the workflow files themselves.

## Runtime architecture

### Worker entrypoint

`src/server-entry.ts` wraps the TanStack Start server entry with Sentry.

Responsibilities:

- handles incoming Worker requests
- configures Sentry with `SENTRY_DSN`
- forwards requests into the TanStack Start server handler

### Wrangler configuration

`wrangler.jsonc` defines the Cloudflare deployment target.

Repository configuration:

- Worker name: `hold-shelf`
- compatibility date: `2026-04-03`
- compatibility flag: `nodejs_compat`
- main entry: `src/server-entry.ts`
- structured console logs enabled; automatic invocation logs and native traces disabled
- query strings redacted in Cloudflare observability

## Bindings and variables

### D1 database binding

Configured in `wrangler.jsonc`:

- binding: `DB`
- database name: `hold-shelf-db`
- migrations directory: `drizzle`

The app accesses D1 through:

- `getDb()` in `src/db/index.ts`

### Worker vars

Configured in `wrangler.jsonc`:

- `TRUST_PROXY_HEADERS=true`
- `BETTER_AUTH_URL=https://hold-shelf.com`

### Worker secrets

Declared for type safety in `src/env.d.ts`:

- `BETTER_AUTH_SECRET`
- `SENTRY_DSN`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Set secrets with:

```bash
pnpm wrangler secret put BETTER_AUTH_SECRET
pnpm wrangler secret put SENTRY_DSN
pnpm wrangler secret put GITHUB_CLIENT_ID
pnpm wrangler secret put GITHUB_CLIENT_SECRET
```

GitHub OAuth secrets are required for a valid deployment.

## Domains and routing

Production routes configured in `wrangler.jsonc`:

- `hold-shelf.com`
- `www.hold-shelf.com`

This means the Worker is deployed directly to those Cloudflare-managed routes.

## Build and deploy commands

Available package scripts:

```bash
pnpm dev
pnpm build
pnpm deploy
pnpm cf-typegen
pnpm db:generate
```

What they do:

- `pnpm dev`: starts local development on port 3000
- `pnpm build`: creates the production build
- `pnpm deploy`: runs build, then `wrangler deploy`
- `pnpm cf-typegen`: regenerates Cloudflare Worker type bindings
- `pnpm db:generate`: generates Drizzle migrations

## Local development setup

Recommended local flow:

```bash
pnpm install
pnpm cf-typegen
pnpm wrangler d1 migrations apply hold-shelf-db --local
pnpm dev
```

Notes:

- local dev uses the Cloudflare/Vite integration with a local D1 emulator
- if `wrangler.jsonc` changes, rerun `pnpm cf-typegen`
- request-time factories like `getDb()` and `getAuth()` must remain request-time
  because bindings only exist during request handling
- local and production environments both need the GitHub OAuth secrets configured

## Database migrations

Migration files live in:

- `drizzle/`

Generate migrations:

```bash
pnpm db:generate
```

Apply migrations locally:

```bash
pnpm wrangler d1 migrations apply hold-shelf-db --local
```

Apply migrations remotely:

```bash
pnpm wrangler d1 migrations apply hold-shelf-db --remote
```

Recommended production order:

1. generate the migration
2. review it in Git
3. apply it to the target database
4. deploy the app code that depends on it

Apply all pending migrations before running application code that depends on
them. Read both schema and data migrations: code rollback does not undo data
changes. Validate backup recovery and migrations against a disposable database
before release. Use migrations to preserve custom quota triggers; schema-push
tools do not represent them. A migration failure stops automatic deployment.
Manual `pnpm deploy` still requires applying the target migrations first.

## CI/CD pipeline

GitHub Actions workflow: `.github/workflows/ci.yml`

### CI triggers

- every pull request
- pushes to `main`

### Check job

Runs on `ubuntu-latest` and performs:

1. checkout
2. pnpm setup
3. Node setup from `.node-version` (24.22.1)
4. `pnpm install --frozen-lockfile`
5. `pnpm cf-typegen`
6. `pnpm check`
7. `pnpm typecheck`
8. `pnpm test`
9. `pnpm build` (web production compilation and CLI build/smoke check)

### Deploy job

Runs only when:

- event is a push
- branch is `main`
- both `check` and `secrets` jobs passed

Production deploy jobs share a non-cancelling concurrency group so migrations and
Worker uploads do not run in parallel. GitHub may replace an older pending deployment
with a newer one; migrations must remain forward-compatible. PR jobs never deploy.
Inside the serialized job, a GitHub API check compares the candidate SHA with
current `main` immediately before migrations. Stale runs skip both migration and
Worker upload; a failed freshness lookup fails closed. An older, slower CI run
cannot roll production back after a newer release.

Deployment steps:

1. checkout
2. pnpm setup
3. Node setup from `.node-version` (24.22.1)
4. `pnpm install --frozen-lockfile`
5. `pnpm build`
6. `pnpm wrangler d1 migrations apply hold-shelf-db --remote`
7. SHA-pinned `cloudflare/wrangler-action` with `command: deploy`

Required GitHub secret:

- `CLOUDFLARE_API_TOKEN`, with Worker deployment and D1 write permissions

## Release model

Current release model is straightforward:

- PRs run validation only
- pushes to `main` auto-deploy to production

Implication:

- `main` should be treated as production-ready at all times

## Observability

### Sentry

Sentry is wired in both client and server layers.

Server-side:

- configured in `src/server-entry.ts`

Client-side:

- initialized from the root app shell in `src/routes/__root.tsx`

### Cloudflare observability

Enabled in `wrangler.jsonc`:

- console logs retained with automatic invocation logs disabled
- query-string redaction enabled; native Cloudflare traces disabled
- use application-redacted Sentry errors/spans for diagnosis
- set observability access and retention policies for your own instance

## Deployment checklist

Before merging to `main`:

1. run `pnpm check`
2. run `pnpm typecheck`
3. run `pnpm test`
4. confirm migrations are included if schema changed
5. confirm new env vars or secrets are documented
6. confirm `pnpm cf-typegen` was run if Wrangler config changed

Before production deploys that include infra or auth changes:

1. confirm Worker secrets exist in Cloudflare
2. confirm `BETTER_AUTH_URL` matches the production origin
3. confirm D1 migrations were applied to the target DB
4. confirm GitHub OAuth settings still match the deployed domain
5. confirm both GitHub OAuth secrets are present in the target environment

## Common operational tasks

### Manual deploy

```bash
pnpm deploy
```

### Update Worker secret

```bash
pnpm wrangler secret put <NAME>
```

### Regenerate Worker environment types

```bash
pnpm cf-typegen
```

### Apply remote D1 migrations

```bash
pnpm wrangler d1 migrations apply hold-shelf-db --remote
```

## Failure points to watch

### Build succeeds but runtime fails

Usually worth checking:

- missing Worker secret
- mismatched `BETTER_AUTH_URL`
- missing D1 migration
- stale generated Cloudflare types after config changes

### CI passes but deploy fails

Usually worth checking:

- GitHub secret `CLOUDFLARE_API_TOKEN`
- Cloudflare permissions for Worker and D1 access
- route or zone configuration in `wrangler.jsonc`

### Auth works locally but not in production

Usually worth checking:

- deployed origin vs `BETTER_AUTH_URL`
- Worker secrets in the production environment
- cookie/session behavior on the configured domain

## Background maintenance and capture

The Worker keeps save-time article capture alive through `ExecutionContext.waitUntil`.
This is best-effort work within the Worker lifetime, not a durable queue. Opening a
reader retries missing/stale content, and Refresh saved content explicitly retries
capture. Failed refreshes retain an existing readable copy. No browser authentication
cookies are sent to the source website.

The hourly Cron Trigger (`0 * * * *`) removes rate-limit rows whose windows expired
more than 24 hours ago. Counter consumption uses an atomic D1 upsert. Regenerate
Worker types after editing `wrangler.jsonc`.

Local repository tests apply the actual migrations to Miniflare D1. The direct
Miniflare test dependency matches Wrangler's runtime version; its v4 option
converter preserves the existing local D1 configuration on Miniflare 5. The narrow
esbuild override in `pnpm-workspace.yaml` patches drizzle-kit's legacy loader chain;
recheck migration generation when updating it.
