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

Use Node.js 22 or later and pnpm 10.32.1 (the version pinned in `package.json`).
Create a GitHub OAuth app for local development with homepage
`http://localhost:3000` and callback `http://localhost:3000/api/auth/callback/github`.
GitHub is the only enabled sign-in provider; local email/password login is not
available.

```bash
pnpm install --frozen-lockfile
cp .dev.vars.example .dev.vars     # fill in your secrets
pnpm cf-typegen                     # generate Cloudflare types
pnpm wrangler d1 migrations apply hold-shelf-db --local
pnpm dev
```

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`. Put it and your local
OAuth app credentials in `.dev.vars`, which Git ignores. Development uses an
emulated D1 database; production credentials are not needed for local development.

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

For your own deployment, first replace the production domain, Worker name, D1
database ID, and auth URL in `wrangler.jsonc` with your own resources. See the
[deployment guide](./docs/deployment.md). The checked-in identifiers describe the
Hold Shelf service; they do not grant access to its Cloudflare account.

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
- [CLI setup and usage](./docs/cli-guide.md)
- [Deployment](./docs/deployment.md)
- [Contributing](./CONTRIBUTING.md)
- [Security reporting](./SECURITY.md)
- [Third-party notices](./THIRD_PARTY_NOTICES.md)

## License

Hold Shelf's original code is licensed under the [MIT License](./LICENSE).
Third-party components and artwork retain their respective licenses; see
[third-party notices](./THIRD_PARTY_NOTICES.md).
