# AGENTS.md

## Commands

```bash
pnpm dev              # Dev server on http://localhost:3000 (local D1 emulator)
pnpm build            # Production build
pnpm deploy           # Build + deploy to Cloudflare Workers
pnpm test             # Run tests (Vitest)
pnpm lint             # Lint with Biome
pnpm format           # Format with Biome
pnpm check            # Full Biome check
pnpm typecheck        # TypeScript type checking
pnpm cf-typegen       # Regenerate worker-configuration.d.ts after wrangler.jsonc changes
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema directly to DB
```

```bash
# Apply migrations to D1
pnpm wrangler d1 migrations apply hold-shelf-db --local   # local dev
pnpm wrangler d1 migrations apply hold-shelf-db --remote  # production

# Manage worker secrets
pnpm wrangler secret put <NAME>
```

Install shadcn components: `pnpm dlx shadcn@latest add <component>`

## Architecture

**Hold Shelf** — a read-it-later web app built with TanStack Start (SSR, file-based routing, server functions), deployed to Cloudflare Workers with D1 (edge SQLite).

### Hosting & deployment

- **Runtime**: Cloudflare Workers with D1 database
- **Domain**: hold-shelf.com (DNS + redirects managed by Cloudflare)
- **CI/CD**: GitHub Actions — lint, typecheck, test on PRs; auto-deploy on push to `main`
- **Error tracking**: Sentry (client via `@sentry/react`, server via `@sentry/cloudflare`)
- **Auth**: better-auth with email/password + GitHub OAuth

### Cloudflare bindings & env

- D1 binding `DB` accessed via `import { env } from "cloudflare:workers"`
- `getDb()` and `getAuth()` are **request-time factories** (not singletons) because D1 bindings and secrets are only available during request handling
- Worker secrets (set via `wrangler secret put`): `BETTER_AUTH_SECRET`, `SENTRY_DSN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Worker vars (in `wrangler.jsonc`): `TRUST_PROXY_HEADERS`, `BETTER_AUTH_URL`
- Secret types are declared in `src/env.d.ts` (augments `Cloudflare.Env`)

## Validation, formatting and linting

- always run biome and typecheck after modification
- run biome or typecheck via pnpm commands
- Autological tests considered harmful.

### Conventiosn

- Import alias: `#/*` maps to `src/*` (preferred over `@/*`)
- Strict TypeScript (ES2022 target, bundler resolution)
- Biome excludes `routeTree.gen.ts`, `styles.css`, and `src/components/ui/` from linting
- Theme: dark/light via CSS variables + localStorage, init script in `__root.tsx` prevents flash
- Server functions that need auth use a shared `requireUserId()` helper that calls `getRequest()` + `getAuth().api.getSession()`

### Code structure rules

- **Filenames**: always kebab-case (e.g. `articles-page.tsx`, not `ArticlesPage.tsx`)
- **Component files**: only contain the component and its prop types. No helpers, no unrelated types.
- **`helpers.ts`**: helper/utility functions go here, scoped per feature directory (e.g. `src/components/articles/helpers.ts`)
- **`types.ts`**: shared types go here, scoped per feature directory (e.g. `src/components/articles/types.ts`)
- **Route files**: thin — only route definition (loader, search validation, component import). Page components live in `src/components/`.
- **DRY**: never repeat yourself. Extract repeated patterns into small reusable components. If the same JSX structure appears more than once, it should be a component.

## Maintenance guidance

Update documentation in `docs/` if:

- a route is added, removed, or repurposed
- a page gets a new major child component
- the app shell or toolbar contract changes
- a server domain gains a new responsibility
- the article save flow changes materially
