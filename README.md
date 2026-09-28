# Hold Shelf

A read-it-later web app. Save articles, organize with tags, read when you're ready.

## Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19, SSR, file-based routing)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (edge SQLite) via [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://www.better-auth.com/) (GitHub OAuth web sessions) + hashed personal access tokens for the REST API
- **Hosting**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Error tracking**: [Sentry](https://sentry.io/)

## Getting started

```bash
pnpm install
cp .dev.vars.example .dev.vars     # fill in your secrets
pnpm cf-typegen                     # generate Cloudflare types
pnpm wrangler d1 migrations apply hold-shelf-db --local
pnpm dev
```

## Scripts

```bash
pnpm dev          # Start dev server (local D1 emulator)
pnpm build        # Production build
pnpm deploy       # Build + deploy to Cloudflare Workers
pnpm test         # Run tests
pnpm check        # Lint + format (Biome)
pnpm typecheck    # TypeScript checks
```

## Deployment

Pushes to `main` trigger CI/CD via GitHub Actions: lint, typecheck, test, then deploy to Cloudflare Workers.

Worker secrets are managed via `pnpm wrangler secret put <NAME>`.

## CLI

The repository includes a private TypeScript CLI workspace that calls the same
application domains through `/api/v1`. It supports article browsing, search,
reader text, save and management actions, tags, favorites, and dashboard stats.

For local development:

```bash
pnpm --filter @hold-shelf/cli build
node packages/cli/dist/bin.js --help
```

CLI login uses the account's personal access token from Settings -> API access.
The token is validated through `GET /api/v1/me` and stored in the operating
system credential store; CI can provide `HOLD_SHELF_TOKEN` without persistence.
The package remains private until an installation and release workflow is
chosen.

## Documentation

- [Architecture and component tree](./docs/architecture.md)
- [Authentication](./docs/auth.md)
- [CLI architecture and command contract](./docs/cli.md)
- [Deployment](./docs/deployment.md)
