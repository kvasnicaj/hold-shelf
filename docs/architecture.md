# Hold Shelf Architecture

This document is the canonical high-level reference for how Hold Shelf is
structured. It focuses on:

- component tree
- route ownership
- core user-facing functionality
- server/data flow behind each screen

## System overview

Hold Shelf is a read-it-later app built with TanStack Start and deployed to
Cloudflare Workers with D1. The repository also contains a TypeScript CLI that
uses the same application domains through the versioned REST API.

High-level web flow:

1. TanStack Router resolves a route and runs loaders/server functions.
2. Page components render from `src/components/*`.
3. Server functions in `src/server/*` validate input, require auth, and query D1
   through Drizzle.
4. React Query keeps route data fresh after mutations.

High-level CLI flow:

1. The Node.js CLI parses a command and reads a personal access token from the
   environment or operating-system credential store.
2. Its typed HTTP client calls `/api/v1` over HTTPS.
3. Shared API transport code authenticates, rate-limits, validates, and maps
   errors.
4. API handlers delegate to the same application services and repositories as
   the web app.

## Route tree

```text
/
|- __root.tsx
|  |- RootDocument
|  |- HeadContent / Scripts
|  |- TanStack Devtools
|
|- /                          -> LandingPage
|- /about                     -> AboutPage
|- /api-docs                  -> ApiDocsPage
|- /cli-docs                  -> CliDocsPage (user guide from docs/cli-guide.md)
|- /api-docs/agents           -> Agent-friendly Markdown API docs export
|- /login                     -> LoginPage
|- /privacy                   -> PrivacyPage
|- /share/:token              -> SharedTagPage
|- /save                      -> SavePage
|- /extension/save            -> compatibility redirect to /save
|- /api/extension/articles    -> Chrome extension save endpoint
|- /api/v1/me                 -> Personal-token credential check
|- /api/v1/articles           -> List and save articles
|- /api/v1/articles/:id       -> Read, update, or delete one article
|- /api/v1/articles/:id/tags/:tagId -> Assign or remove one article tag
|- /api/v1/tags               -> List tags and article counts
|- /api/v1/dashboard          -> Library and reading statistics
|- /app                       -> AppLayout (auth-gated)
   |- /app/home               -> HomePage
   |- /app/articles           -> ArticlesPage
   |- /app/favorites          -> FavoritesPage
   |- /app/tags               -> TagsPage
   |- /app/archive            -> ArchivePage
   |- /app/settings           -> SettingsPage
   |- /app/trash              -> TrashPage
```

## Global app shell

### `__root.tsx`

Responsibilities:

- defines the HTML shell
- injects the theme boot script to prevent flash
- initializes Sentry
- mounts router/query devtools

### `/app` layout

`src/routes/app.tsx` authenticates and loads the user; the shell lives in
`src/components/layout/app-layout.tsx` and `top-bar.tsx`.

Component tree:

```text
AppLayout
|- ToolbarActionsProvider
|  |- desktop sidebar column
|  |  |- AppSidebar
|  |
|  |- main content
|  |  |- TopBar
|  |  |  |- ColumnNavbar
|  |  |  |  |- mobile brand mark
|  |  |  |  |- global article search
|  |  |  |  |- route-provided toolbar center/actions
|  |  |  |  |- add article and account actions
|  |  |
|  |  |- Outlet
|  |
|  |- article reader column
|  |  |- ColumnNavbar
|  |  |- article content
|  |
|  |- MobileNavigation
```

Responsibilities:

- blocks unauthenticated access with `getSession()`
- provides shared desktop/mobile navigation
- keeps the brand mark in the mobile top bar while the mobile navigation stays route-focused
- renders a full-width mobile bottom navigation strip styled from the sidebar primitives
- keeps Add article as a persistent one-tap mobile action above the bottom navigation
- provides a dynamic toolbar channel via `ToolbarActionsProvider`
- renders column-owned navbars through `ColumnNavbar`, which accepts left,
  center, and right action arrays and collapses side tools into a mobile
  overflow menu

### Toolbar action system

`src/components/layout/toolbar-actions.tsx` lets page components push content
into the shared top bar without putting page-specific UI into the layout.

Used by:

- `ArticlesPage`, `FavoritesPage`, and `ArchivePage` for page-scoped search
- `TagsPage` for `CreateTagDialog`
- `BulkActionsPanel` for centered bulk actions
- `TagsPage` for tag filtering search

## Public routes

### Landing page

Route: `/`

Component tree:

```text
LandingPage
|- hero icon
|- app title / tagline
|- CTA button -> /login
|- secondary extension link -> Chrome Web Store
|- footer links -> /about, /privacy
```

Purpose:

- marketing-style entry screen for signed-out users
- highlights that the Chrome extension is available from the Chrome Web Store
- provides public about and privacy links for the website and extension listing

### About page

Route: `/about`

Component tree:

```text
AboutPage
|- page header / branding
|- back link
|- description cards
|- contact email
```

Purpose:

- provides a public description of Hold Shelf
- offers a simple contact address for questions and support

### Privacy page

Route: `/privacy`

Component tree:

```text
PrivacyPage
|- page header / branding
|- back link
|- privacy policy cards
```

Purpose:

- provides a public privacy policy for Hold Shelf and the Chrome extension

### API documentation page

Route: `/api-docs`

Component tree:

```text
ApiDocsPage
|- DocumentationLayout (shared with CliDocsPage: header, navigation, width, theme)
|- DocumentationSection (shared section typography and spacing)
|- API overview panel
|- agent Markdown export link -> /api-docs/agents
|- Personal REST API endpoint cards for articles, tags, stats, and auth checks
|- Browser extension API endpoint cards
```

Purpose:

- documents the complete personal-access-token REST API available to users and
  the CLI
- exposes the same API docs as downloadable Markdown for AI agents and other
  tooling
- clarifies which app API routes are intended for the Chrome extension or
  scripts and third-party clients
- provides request examples, response shapes, validation rules, and rate-limit
  notes for API clients

### Login page

Route: `/login`

Component tree:

```text
LoginPage
|- Card
|  |- app branding
|  |- GitHub sign-in button
|  |- GitHub-only auth copy
```

Core functionality:

- starts GitHub OAuth via `authClient.signIn.social`
- creates the user account on first successful GitHub sign-in
- signs returning GitHub users back into the app
- redirects authenticated users to `/app/home`
- accepts an optional `redirectTo` search param so article-save handoff flows can
  return users to a save page after login

### Article save handoff

Route: `/save`

Component tree:

```text
SavePage
|- status icon
|- save result copy
|- saved URL
|- CTA -> /app/articles
|- CTA -> /app/home
```

Core functionality:

- accepts a `url` search param from integrations such as The Digest and the
  Chrome extension
- redirects signed-out users to `/login?redirectTo=...`
- calls `createArticle()` once the user has an authenticated session
- treats duplicate URLs as a successful handoff state
- saves only article metadata; article body caching starts when the user opens the
  article in the reader
- keeps `/extension/save` as a compatibility redirect for existing extension
  installations

### Shared tag page

Route: `/share/:token`

Component tree:

```text
SharedTagPage
|- Hold Shelf branding
|- owner first-name heading / shared tag summary
|- SharedArticleList
|  |- SharedArticleCard*
|- pagination
```

Purpose:

- gives anyone holding an active sharing URL read-only access to one tag
- shows the sharing account's first name, the shared tag name, and current
  article metadata
- never exposes other tags, account details, read/favorite state, or reader
  content
- uses a generic unavailable state for invalid, revoked, and deleted links

### Extension save API

Route: `/api/extension/articles`

Responsibilities:

- accepts extension POST requests with `{ url }`
- authenticates the request from the Hold Shelf session cookie
- returns `401` with a `loginUrl` when the user needs to sign in on the site
- saves the article with the same metadata extraction flow as the web app
- returns `409` for duplicates so the extension can treat repeat saves as
  success

### Personal REST API

Routes:

- `GET /api/v1/me`
- `GET|POST /api/v1/articles`
- `GET|PATCH|DELETE /api/v1/articles/:id`
- `PUT|DELETE /api/v1/articles/:id/tags/:tagId`
- `GET /api/v1/tags`
- `GET /api/v1/dashboard`

Responsibilities:

- authenticates every route with
  `Authorization: Bearer <personal-access-token>`
- validates a credential without exposing profile data through `GET /me`
- lists, searches, filters, sorts, and paginates articles
- saves URLs and returns the existing article ID for retry-safe duplicates
- loads cached or freshly extracted reader text for one owned article
- updates read/favorite state and deletes one owned article
- assigns and removes existing tags idempotently
- returns tag summaries and normalized dashboard counters
- maps malformed input, invalid credentials, missing or unowned resources, and
  rate limits to the shared v1 JSON error shape
- rate limits auth attempts by client IP and authenticated requests by user

### Command-line client

Package: `packages/cli`

The CLI is a Node.js TypeScript client rather than another Worker entry point.
It owns command parsing, secure credential access, HTTP calls, and terminal/JSON
output. It never imports D1 repositories, Cloudflare bindings, React code, or
browser-session helpers.

Its command groups cover:

- token login, logout, and status
- article list, search, favorites, reader text, save, state changes, tagging,
  and deletion
- tag listing
- dashboard statistics

The package centralizes service URL resolution, the typed v1 HTTP client,
credential-store access, error-to-exit-code mapping, and human/JSON rendering so
commands do not repeat transport or output logic. See
[CLI architecture](./cli.md) for the command contract, authentication decision,
and delivery plan.

The sibling `packages/api-contracts` workspace contains the environment-neutral
Zod schemas and inferred TypeScript types for the v1 wire format. Both REST
transport code and the CLI consume this package, keeping validation and response
shapes independent of D1 records while avoiding duplicate client/server
contracts.

## Authenticated routes

### Home

Route: `/app/home`

Loader dependencies:

- `getDashboardStats()`
- `getRecentArticles()`
- `getTags()`

Component tree:

```text
HomePage
|- page header
|- ContinueReadingSection
|- recent content grid
|  |- recently saved card
|  |  |- ArticleLink* + TagPicker*
|  |- favorites card
|  |  |- ArticleLink*
|  |- oldest unread card
|     |- ArticleLink*
|- compact reading statistics
|- empty state CTA -> /app/articles
```

Purpose:

- dashboard and entry point after login
- surfaces reading volume and quick links into saved content
- dashboard article links use the shared open handler, so unread items can auto-mark
  as read when the user preference is enabled
- recently saved articles reuse `TagPicker` and the shared article mutation hook
  for tag creation, assignment, and removal

### Unread articles

Route: `/app/articles`

Loader dependencies:

- `getArticles({ isRead: false, search, sort, limit, offset })`
- `getTags()`

Component tree:

```text
ArticlesPage
|- ToolbarSlot
|  |- AddArticleDialog
|- BulkActionsPanel? (when rows selected)
|- page title
|- sort control
|- empty state
|- ArticleList
|  |- ArticleCard*
|     |- Checkbox
|     |- article link / favicon / metadata
|     |- tag badges
|     |- TagPicker
|     |- mark read/unread button
|     |- delete button
|- pagination
```

Core functionality:

- save a new URL with `createArticle()`
- article creation stores URL metadata only, not the full article body
- fetch unread articles with search/sort/pagination
- mark one or many articles read/unread with `updateArticle()`
- delete one or many articles with `deleteArticles()`
- assign/remove tags with `addTagToArticles()` and
  `removeTagFromArticles()`
- create tags inline from `TagPicker`

### Favorites

Route: `/app/favorites`

Loader dependencies:

- `getArticles({ isFavorite: true, search, sort, limit, offset })`
- `getTags()`

Component tree:

```text
FavoritesPage
|- ToolbarSlot
|  |- AddArticleDialog
|- BulkActionsPanel? (when rows selected)
|- page title
|- sort control
|- empty state
|- ArticleList
|  |- ArticleCard*
|     |- Checkbox
|     |- article link / favicon / metadata
|     |- tag badges
|     |- TagPicker
|     |- favorite toggle button
|     |- mark read/unread button
|     |- delete button
|- pagination
```

Core functionality:

- fetch favorite articles with search/sort/pagination
- remove or add one article to favorites with `updateArticle()`
- supports the same tag, delete, and read/unread controls as the unread page

### Tags

Route: `/app/tags`

Loader dependencies:

- `getTags()`
- optional `getArticles({ tagId, limit, offset })` when a tag is selected

Component tree:

```text
TagsPage
|- ToolbarSlot
|  |- CreateTagDialog
|- ToolbarSearch? (tag list mode)
|- page title
|- list mode
|  |- TagItem*
|     |- select tag
|     |- rename action
|     |- delete action
|- selected tag mode
|  |- back button
|  |- selected tag title / count
|  |- visible Shared status / share action / ShareTagDialog
|  |- ArticleList
|  |- pagination
```

Core functionality:

- create tags with `createTag()`
- rename tags with `updateTag()`
- delete tags with `deleteTag()`
- browse articles scoped to a single tag
- create, copy, and revoke one public sharing link per tag
- show active sharing state in the selected tag header without opening the
  sharing dialog
- reuse `ArticleList` to manage article state and tag assignment

### Library

Route: `/app/archive`

Loader dependencies:

- `getArticles({ isRead, search, sort, tagId, limit, offset })`
- `getTags()`

Component tree:

```text
ArchivePage
|- ToolbarSlot
|  |- AddArticleDialog
|- page title
|- filter bar
|  |- active tag badge?
|  |- tag filter
|  |- read status filter
|  |- sort filter
|- BulkActionsPanel? (when rows selected)
|- table wrapper
|  |- TanStack Table
|  |  |- selection column
|  |  |- status column
|  |  |- title column
|  |  |- tags column
|  |  |- saved date column
|  |  |- row actions
|  |     |- TagPicker
|  |     |- toggle read button
|  |     |- delete button
|- pagination
```

Purpose:

- full library view for read and unread content
- optimized for scanning, filtering, and bulk management

Core functionality:

- global library search from the top toolbar routes users here
- filters by tag, read state, sort order, and page
- supports the same article mutations as the unread page
- keeps tag-picker portal interactions inside the picker so assigning one or
  several tags never opens the article reader
- uses a table instead of cards for denser browsing

### Settings

Route: `/app/settings`

Component tree:

```text
SettingsPage
|- Appearance card
|  |- ThemeToggle
|- ReadingSettingsCard
|- Browser extension card
|  |- CTA button -> Chrome Web Store
|- LibraryBackupCard
|- AccountSummaryCard
|- CliCard -> /cli-docs
|- ApiTokenCard
|  |- API documentation link -> /api-docs
|- DeleteAccountCard
```

Core functionality:

- cycles theme between light, dark, and auto
- persists theme to `localStorage`
- stores the auto-mark-read-on-open preference in the database per user
- links signed-in users to the Chrome Web Store extension install
- shows the signed-in GitHub account details and provider summary
- lets users generate, replace, and revoke one personal access token
- links API token users to the public API documentation page
- provides a guarded account-deletion flow that removes the auth user and cascades app data

## Shared components

### Layout

- `AppSidebar`: desktop navigation, unread counter, favorites link, dynamic tag links
- `MobileNavigation`: mobile navigation
- `ColumnNavbar`: shared column header chrome for left, center, and right controls
- `AppSearch`: global article search with preview results
- `AppToolbar`: compact account menu and sign out
- `ToolBox`: shared chrome for toolbar controls

### Articles

- `AddArticleDialog`: add URL flow
- `ArticleList`: maps article arrays to cards
- `ArticleCard`: compact article presentation and actions
- `BulkActionsPanel`: multi-select actions in the shared toolbar center

### Tags route

- `CreateTagDialog`: dedicated tag creation flow
- `TagPicker`: attach/detach tags and create new ones inline
- `ShareTagDialog`: creates, copies, and revokes a selected tag's public link

### Shared tags

- `SharedTagPage`: standalone anonymous page for an active tag link
- `SharedArticleList` and `SharedArticleCard`: read-only public article
  presentation with no authenticated article actions or tag badges

### Home route

- `StatCard`: dashboard metric display
- `ArticleLink`: lightweight recent-article row

## Core server functionality

### Authentication

Files:

- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/server/auth.ts`
- `src/server/helpers.ts`

Responsibilities:

- Better Auth setup with GitHub OAuth as the only sign-in method
- request-time auth creation because Cloudflare bindings only exist at request
  time
- `requireUserId()` guards server functions that operate on user data
- `/app` layout redirects to `/login` when no session exists

### Articles domain

Files:

- `src/server/articles.ts`
- `src/server/articles-runtime.ts`
- `src/server/articles-service.ts`
- `src/server/articles-repository.ts`

Responsibilities:

- query articles with filters, sorting, pagination, and tag joins
- create articles from a URL
- prevent duplicate URLs per user
- enforce create-article rate limiting
- load reader content from the Markdown cache or extract and cache it on
  first open
- update read/favorite state
- move articles to Trash in bulk, preserving tags, saved content, and progress

The route-facing runtime validates input and obtains the current web-session
user, the service owns user-scoped behavior, and the repository is the only
layer that queries D1. REST handlers reuse the service/repository layers without
reusing the browser-session boundary.

### Personal API transport

Files:

- `packages/api-contracts/src/index.ts`
- `src/server/api-v1.ts`
- `src/server/api-v1-articles.ts`
- `src/routes/api/v1/-*-handlers.ts`

Responsibilities:

- authenticate `hs_` personal access tokens through one request helper
- apply the shared unauthenticated-client and authenticated-user limits
- parse JSON and return a consistent `{ code, message }` error shape
- serialize article records into a stable API projection with ISO 8601 dates
- keep route files thin while delegating domain work to shared services and
  repositories
- return `404` for both missing and unowned singular resources so ownership is
  not disclosed

### API tokens domain

Files:

- `src/server/api-tokens.ts`
- `src/server/api-token-auth.ts`
- `src/server/api-tokens-service.ts`
- `src/server/api-tokens-repository.ts`

Responsibilities:

- expose one personal access token per authenticated user
- show the raw token only immediately after generation
- store only the token hash and display prefix in D1
- revoke or replace the token from settings

### Metadata extraction

Files:

- `src/server/metadata.ts`
- `src/server/html-parsing.ts`
- `src/server/url-validation.ts`
- `src/server/config.ts`

Flow when saving an article:

1. validate the submitted URL as a safe external target
2. fetch HTML with redirect, timeout, and size guards
3. extract title, description, favicon, and hostname
4. fall back to hostname-based metadata if extraction fails
5. persist the article row in D1

X seed posts that point to an X Article use a dedicated parser for the public
article entity embedded in the post HTML. This preserves the real article title
and preview without requiring X API credentials. X does not expose the complete
article body in that public response, so lazy reader extraction can still fall
back to the original X link.

Flow when opening an article in the reader:

1. verify the article belongs to the current user
2. load tags and check `article_content_cache`
3. return cached Markdown immediately when it is current
4. otherwise fetch the source URL with the same external HTML guards
5. parse HTML with rehype, resolve relative URLs against the final source URL,
   preserve code/whitespace/images/tables/lists, convert to Markdown/plain text,
   and upsert the `markdown-v3` cache
6. cache temporary extraction failures as `unavailable` and retry stale failures
   later

Chrome extension flow:

1. extension background script POSTs `{ url }` to `/api/extension/articles`
2. the API checks the current session from request headers
3. if authenticated, the server saves the article immediately
4. if not authenticated, the API returns a `loginUrl` pointing at
   `/save?url=...`
5. the site redirects through `/login` and returns to `/save`
6. the extension handoff page saves the article in the normal web session

### Tags domain

Files:

- `src/server/tags.ts`
- `src/server/tags-runtime.ts`
- `src/server/tags-service.ts`
- `src/server/tags-repository.ts`

Responsibilities:

- list tags with article counts
- create, rename, and delete tags
- attach tags to many articles
- remove tags from many articles
- verify tag ownership and article ownership before mutations

### Tag shares domain

Files:

- `src/server/tag-shares.ts`
- `src/server/tag-shares-repository.ts`
- `src/server/tag-shares-runtime.ts`
- `src/server/tag-shares-service.ts`

Responsibilities:

- create at most one active opaque sharing token per owned tag
- return an existing active token idempotently to the owner
- revoke a sharing token and ensure a later share receives a new token
- resolve an active token without requiring a Hold Shelf session
- return only the owner's derived first name, the selected tag name, and an
  explicit public article metadata projection

### Dashboard domain

Files:

- `src/server/dashboard.ts`
- `src/server/dashboard-runtime.ts`
- `src/server/dashboard-repository.ts`

Responsibilities:

- aggregate counts for total, read, unread, saved in the rolling previous seven
  days, and read in the rolling previous seven days
- fetch recently saved, favorite, and oldest unread article slices for the home screen
- include assigned tags for recently saved articles so the dashboard can manage them
- include article read state in home link payloads so shared open behavior stays
  consistent across app surfaces

### Rate limiting

File: `src/server/rate-limit.ts`

Responsibilities:

- stores per-user rate-limit counters in D1
- atomically consume or reset a window in one D1 statement
- protect article creation, personal API requests, and content refresh
- remove long-expired counters through the hourly Worker scheduled handler

## Data model

Core tables in `src/db/schema.ts`:

- `user`, `session`, `account`, `verification`: Better Auth tables
- `articles`: saved URLs and extracted metadata
- `article_content_cache`: captured reader Markdown and plain text
- `article_trash`: deletion markers; articles remain recoverable until account deletion
- `reading_progress`: reading position (0–10,000) and last-read time per article
- `tags`: user-defined labels
- `tag_shares`: one optional active public sharing token per tag
- `article_tags`: many-to-many join between articles and tags
- `api_tokens`: one hashed personal access token per user
- `rate_limits`: persistent rate-limit counters

Important relationships:

- one user has many articles
- one user has many tags
- one tag can have one active sharing link
- one article can have many tags through `article_tags`
- one user can have one active personal access token
- article URLs are unique per user
- tag names are unique per user
- tag-share tokens are globally unique and deleting a tag cascades its share

## Data flow by page

### Read path

```text
Route loader
-> server function in src/server/*
-> getDb()
-> D1 via Drizzle
-> loader data
-> page component
-> React Query hydration / reuse
```

### Mutation path

```text
UI action
-> server function mutation
-> D1 write
-> invalidate React Query keys
-> router.invalidate()
-> refreshed page state
```

### CLI path

```text
hold-shelf command
-> shared CLI configuration / credential store
-> typed HTTP client
-> /api/v1 handler
-> shared application service
-> repository
-> D1
-> serialized JSON response
-> human table/text or JSON-only stdout
```

## Library recovery, continuity, and capture

`src/server/library.ts` exposes authenticated server functions for Trash restoration,
reading progress, continuing recently read articles, saved-content refresh, and
paginated backup export/import. Import validation lives in `library-schemas.ts`;
`library-import.ts` writes each article and its related state in one D1 batch.
Bulk SQL statements are chunked to stay within D1's 100-binding limit.

Every successful new URL save (web, extension, or API) starts best-effort background
capture through the request's Worker execution context. The reader still handles
missing content on demand. Capture follows the existing guarded external-fetch
limits; sites requiring login or client-side rendering may remain unavailable.
Refresh saved content keeps the previous ready copy if fetching fails. Legacy cache
versions are regenerated on access. Rendering generates heading IDs before
sanitization to retain DOM-clobbering protection.

Delete moves articles into Trash and offers Undo. `/app/trash` lists removed articles
and restores them with tags/content/progress intact. Trash is excluded from lists,
counts, public tag shares, and reader access. Re-saving a trashed URL restores it.
Trash offers per-article permanent deletion and Empty Trash, each behind a
confirmation dialog. Permanent deletion checks both ownership and current Trash
membership in the database and cascades content, progress, and tag assignments.
There is no automatic purge; deleting the account also removes all its data. REST/CLI DELETE has the same recoverable behavior.

The reader uses `#article=<id>` in the current app URL for reload and browser history.
Below 1536px it is a Radix modal with focus trapping, Escape, and focus return; wider
screens use a non-modal side column. The reader saves scroll position after an
800ms pause and flushes on close/page hide, then updates Continue reading. A page
shutdown can still interrupt an in-flight request. Text size is a local browser preference; line width is fixed at 70ch, bounded by
the reader viewport; progress is stored with the user's article in D1.

Settings includes a JSON backup workflow with articles, tags, flags, saved content,
reading progress, and Trash. Import accepts version 1 Hold Shelf backups up to
10,000 articles / 50 MB, validates the whole file before writing, skips existing
URLs, and can safely resume by importing the same file again after a failure.
Credentials, API tokens, and public sharing links are excluded. Export reads in
25-article pages; avoid editing the library while a large export is running.

Library keeps the existing `/app/archive` URL. Search includes cached article text
as well as metadata, with owner and status filters applied. This uses SQLite text
matching, not a relevance-ranked full-text index. Global search is hidden when the
current page supplies its own search. Mobile account navigation directly exposes
Settings and Trash; desktop/mobile menus share `AccountMenuItems`.

Collection loaders and components share React Query options. Mutation settlement
refreshes article lists, tags, reader, Trash, Continue reading, and router-backed
Home data, including after partially failed bulk work. Collection pages reconcile
out-of-range pagination after their result totals shrink.

The app shell centers every authenticated page in a shared `max-w-6xl` content
container, with consistent padding. Reader and navigation columns remain separate.
Toasts inherit app CSS theme colors, including a contrasting Undo button; mobile
toasts sit above bottom navigation. Continue reading's Mark as read action atomically
marks the article read and completes its progress, removing it from that section.
The public CLI guide is linked from Settings and documents source installation for
collaborators with private-repository access, authentication, commands, recovery,
and automation. It explicitly explains that public installation is not available.
`CliDocsPage` uses the same `DocumentationLayout` and `DocumentationSection` as the
API page, with matching cards and code blocks. Its content comes from
`docs/cli-guide.md`; Markdown heading positions define sections without treating
headings inside command examples as new sections. Both pages link to each other
and back to Settings.
