# Hold Shelf

A read-it-later web app. Save articles, organize with tags, read when you're ready.

## Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19, SSR, file-based routing)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (edge SQLite) via [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Better Auth](https://www.better-auth.com/) (email/password + GitHub OAuth)
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

## Documentation

- [Architecture and component tree](./docs/architecture.md)
- [Authentication](./docs/auth.md)
- [Deployment](./docs/deployment.md)
