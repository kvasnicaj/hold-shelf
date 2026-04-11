# Hold Shelf Architecture

This document is the canonical high-level reference for how Hold Shelf is
structured. It focuses on:

- component tree
- route ownership
- core user-facing functionality
- server/data flow behind each screen

## System overview

Hold Shelf is a read-it-later app built with TanStack Start and deployed to
Cloudflare Workers with D1.

High-level flow:

1. TanStack Router resolves a route and runs loaders/server functions.
2. Page components render from `src/components/*`.
3. Server functions in `src/server/*` validate input, require auth, and query D1
   through Drizzle.
4. React Query keeps route data fresh after mutations.

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
|- /login                     -> LoginPage
|- /privacy                   -> PrivacyPage
|- /extension/save            -> ExtensionSavePage
|- /api/extension/articles    -> Chrome extension save endpoint
|- /app                       -> AppLayout (auth-gated)
   |- /app/home               -> HomePage
   |- /app/articles           -> ArticlesPage
   |- /app/tags               -> TagsPage
   |- /app/archive            -> ArchivePage
   |- /app/settings           -> SettingsPage
```

## Global app shell

### `__root.tsx`

Responsibilities:

- defines the HTML shell
- injects the theme boot script to prevent flash
- initializes Sentry
- mounts router/query devtools

### `/app` layout

`src/routes/app.tsx` is the authenticated shell.

Component tree:

```text
AppLayout
|- ToolbarActionsProvider
|  |- desktop sidebar column
|  |  |- AppSidebar
|  |
|  |- main content
|  |  |- TopBar
|  |  |  |- AppToolbar
|  |  |  |- route-provided toolbar center/actions
|  |  |
|  |  |- Outlet
|  |
|  |- MobileBottomBar
```

Responsibilities:

- blocks unauthenticated access with `getSession()`
- provides shared desktop/mobile navigation
- keeps the brand mark in the mobile top bar while the bottom bar stays navigation-only
- renders a full-width mobile bottom bar styled from the sidebar primitives
- provides a dynamic toolbar channel via `ToolbarActionsProvider`

### Toolbar action system

`src/components/layout/toolbar-actions.tsx` lets page components push content
into the shared top bar without putting page-specific UI into the layout.

Used by:

- `ArticlesPage` and `ArchivePage` for `AddArticleDialog`
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
- accepts an optional `redirectTo` search param so extension handoff flows can
  return users to a save page after login

### Extension save handoff

Route: `/extension/save`

Component tree:

```text
ExtensionSavePage
|- status icon
|- save result copy
|- saved URL
|- CTA -> /app/articles
|- CTA -> /app/home
```

Core functionality:

- accepts a `url` search param from the extension or login handoff
- redirects signed-out users to `/login?redirectTo=...`
- calls `createArticle()` once the user has an authenticated session
- treats duplicate URLs as a successful handoff state

### Extension save API

Route: `/api/extension/articles`

Responsibilities:

- accepts extension POST requests with `{ url }`
- authenticates the request from the Hold Shelf session cookie
- returns `401` with a `loginUrl` when the user needs to sign in on the site
- saves the article with the same metadata extraction flow as the web app
- returns `409` for duplicates so the extension can treat repeat saves as
  success

## Authenticated routes

### Home

Route: `/app/home`

Loader dependencies:

- `getDashboardStats()`
- `getRecentArticles()`

Component tree:

```text
HomePage
|- page header
|- archive search bar -> /app/archive?q=...
|- mobile stats card
|- desktop stat card grid
|  |- StatCard x4
|- recent content grid
|  |- recently saved card
|  |  |- ArticleLink*
|  |- favorites card
|  |  |- ArticleLink*
|  |- oldest unread card
|     |- ArticleLink*
|- empty state CTA -> /app/articles
```

Purpose:

- dashboard and entry point after login
- quick archive search shortcut that deep-links into full archive results
- surfaces reading volume and quick links into saved content
- dashboard article links use the shared open handler, so unread items can auto-mark
  as read when the user preference is enabled

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
|  |- ArticleList
|  |- pagination
```

Core functionality:

- create tags with `createTag()`
- rename tags with `updateTag()`
- delete tags with `deleteTag()`
- browse articles scoped to a single tag
- reuse `ArticleList` to manage article state and tag assignment

### Archive

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
|- AccountSummaryCard
|- DeleteAccountCard
```

Core functionality:

- cycles theme between light, dark, and auto
- persists theme to `localStorage`
- stores the auto-mark-read-on-open preference in the database per user
- links signed-in users to the Chrome Web Store extension install
- shows the signed-in GitHub account details and provider summary
- provides a guarded account-deletion flow that removes the auth user and cascades app data

## Shared components

### Layout

- `AppSidebar`: desktop navigation, unread counter, favorites link, dynamic tag links
- `MobileBottomBar`: mobile navigation
- `AppToolbar`: search, page actions, theme toggle, user menu, sign out
- `ToolBox`: shared chrome for toolbar controls

### Articles

- `AddArticleDialog`: add URL flow
- `ArticleList`: maps article arrays to cards
- `ArticleCard`: compact article presentation and actions
- `BulkActionsPanel`: multi-select actions in the shared toolbar center

### Tags route

- `CreateTagDialog`: dedicated tag creation flow
- `TagPicker`: attach/detach tags and create new ones inline

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

File: `src/server/articles.ts`

Responsibilities:

- query articles with filters, sorting, pagination, and tag joins
- create articles from a URL
- prevent duplicate URLs per user
- enforce create-article rate limiting
- update read/favorite state
- delete articles in bulk

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

Chrome extension flow:

1. extension background script POSTs `{ url }` to `/api/extension/articles`
2. the API checks the current session from request headers
3. if authenticated, the server saves the article immediately
4. if not authenticated, the API returns a `loginUrl` pointing at
   `/extension/save?url=...`
5. the site redirects through `/login` and returns to `/extension/save`
6. the extension handoff page saves the article in the normal web session

### Tags domain

File: `src/server/tags.ts`

Responsibilities:

- list tags with article counts
- create, rename, and delete tags
- attach tags to many articles
- remove tags from many articles
- verify tag ownership and article ownership before mutations

### Dashboard domain

File: `src/server/dashboard.ts`

Responsibilities:

- aggregate counts for total, unread, saved this week, and read this week
- fetch recently saved, favorite, and oldest unread article slices for the home screen
- include article read state in home link payloads so shared open behavior stays
  consistent across app surfaces

### Rate limiting

File: `src/server/rate-limit.ts`

Responsibilities:

- stores per-user rate-limit counters in D1
- currently used on article creation to protect metadata fetches

## Data model

Core tables in `src/db/schema.ts`:

- `user`, `session`, `account`, `verification`: Better Auth tables
- `articles`: saved URLs and extracted metadata
- `tags`: user-defined labels
- `article_tags`: many-to-many join between articles and tags
- `rate_limits`: persistent rate-limit counters

Important relationships:

- one user has many articles
- one user has many tags
- one article can have many tags through `article_tags`
- article URLs are unique per user
- tag names are unique per user

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
