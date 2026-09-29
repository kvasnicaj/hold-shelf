# Hold Shelf project review — 28 September 2026

Reviewed `main` at `ec76505`, including the web app, server domains, D1 repositories,
authentication, public API, shared contracts, CLI, deployment configuration, tests,
and the signed-in live interface at desktop and mobile widths. The merge did not
change the source tree reviewed before it. Application code was not changed during the review. The follow-up implementation
is recorded below.

**Overall assessment:** the architecture is sound and the product already covers
the main save, organize, read, and share workflows. The next milestone should fix
reliability and accessibility before expanding features. Keep the existing visual
identity and improve navigation, reading layout, and feedback.

**Validation and limits**

- Biome passed across 293 files; TypeScript checks passed for web, contracts, and CLI.
- The existing suite passed: 248 tests across 74 files.
- The complete `pnpm build` passed, including production web compilation, CLI
  compilation, and the built CLI smoke test. An initial local package-manager
  launcher problem was resolved by using the already-installed pinned version.
- Separate local reproductions confirmed the rate-limit race, generated SQL
  parameter counts, extraction defects, invalid unread-count request, redirect
  behavior, and generated heading IDs.
- Live inspection confirmed the mobile Settings omission and empty-page
  pagination state. Destructive actions and concurrency attacks were not run
  against production. Findings identified as source analysis still need targeted
  integration tests when fixed.
- This review does not certify the absence of other defects. It did not measure
  production load, inspect production database contents, or exercise every OAuth
  provider failure and browser/operating-system combination.

**Bugs and actionable risks, in priority order**

P1 means fix promptly; P2 means a normal-priority correctness or usability fix.
Security hardening is distinguished from a demonstrated exploit.

1. **P1 — Rate limits can be bypassed by concurrent requests.**
   `src/server/rate-limit.ts:98–122` reads a count, makes its decision, and then
   writes a replacement count in separate operations. Requests can read the same
   value and all pass. A local reproduction called the actual limiter with an
   asynchronous memory store: all 20 simultaneous requests passed a limit of 2,
   and the stored count ended at 1. This demonstrates the algorithmic race, not a
   measured production attack. Use one atomic database operation to increment or
   reset the window and return the resulting count. Test simultaneous requests
   against D1, including an expired window.

2. **P1 — Reader extraction loses or changes article content.**
   `src/server/article-content.ts:91–111`, `128–144`, `164–168`, and `204–246`
   contain several independently reproducible defects:
   - Code blocks lose line breaks and indentation because they use the same
     whitespace normalization as ordinary text.
   - Relative links and fragment links are dropped because `new URL(href)` has no
     source-page base URL.
   - Prefix matching treats `<br>` as a bold tag and `<img>` as an italic tag.
   - Spaces between adjacent formatted runs disappear: a bold “Hello”, a space,
     and an italic “world” become “Helloworld”.
   - Content is silently limited to 120 blocks; the fallback is limited to 80
     paragraphs. The result can still be cached as ready.

   Multiline code flattening was also visible in the live reader. Short
   paragraphs are discarded, images and tables have no representation, and list
   numbering is not preserved. Replace regex-based structural parsing with a
   proper HTML parser and extraction pipeline. Preserve code and inline
   whitespace, resolve links against the final response URL, and explicitly
   represent unsupported or truncated content. Version or refresh cached content
   so fixing extraction also helps previously cached articles.

3. **P2 — The login return URL allows an external redirect.**
   `src/routes/login.tsx:10–20` accepts anything starting with `/`, including
   `//example.com`. For an already-signed-in user, the route sends this directly
   to TanStack's `redirect({ href })`. A local reproduction produced a 307 with a
   protocol-relative Location that resolves to another origin. This can make a
   trusted login link redirect to a phishing destination; it is not evidence of
   token theft. Parse and validate against the application origin, then retain
   only the internal path, query, and fragment. Cover protocol-relative and
   slash/backslash variants as well as normal internal destinations.

4. **P2 — The sidebar unread count always sends an invalid request.**
   `src/components/layout/app-sidebar.tsx:31–35` requests `limit: 0`, while
   `packages/api-contracts/src/index.ts:27` requires a minimum of 1 and is reused
   by the server validator. The real schema rejects the sidebar input. The live
   sidebar had no count despite unread articles being present. Use a dedicated
   count query or a permitted list request; avoid coupling a count-only call to
   an undocumented pagination exception. Existing mocks hide this mismatch.

5. **P2 — Valid bulk requests exceed D1's binding limit.**
   `src/server/input-schemas.ts:12` permits 100 article IDs, but
   `src/server/articles-repository.ts:163–166` binds those IDs plus the user ID.
   Tag ownership and removal queries have the same extra-parameter issue, and
   `src/server/tags-repository.ts:77–85` inserts two values per article.
   Capturing real Drizzle-generated bindings showed 101 parameters for a
   100-article delete and 102 for assigning one tag to 51 articles. D1 permits
   [100 bound parameters per statement](https://developers.cloudflare.com/d1/platform/limits/).
   Chunk operations according to their actual parameter budget, preserve
   ownership checks, and define partial-failure/transaction behavior. Verify with
   the local D1 runtime; a repository fake will not enforce this platform limit.

6. **P2 — Reader and dashboard state can disagree after a change.**
   `src/components/articles/use-article-mutations.ts:24–35` normally invalidates
   article lists and tags but not the reader query. The reader adds its own query
   key but disables router invalidation at
   `src/components/article-reader/article-reader-panel.tsx:34–36`, leaving the
   loader-backed home dashboard stale after reader actions. Auto-mark-read also
   omits reader invalidation. In `src/server/articles-service.ts:191–214`, the
   reader captures article flags before potentially slow content extraction,
   which makes the auto-read race especially plausible. These are source
   findings; refresh/focus may eventually hide the inconsistency. Centralize
   query keys and mutation invalidation, and have route loaders share query
   options with components. Test the state across list, reader, and home after
   the same action.

7. **P2 — An empty last page removes the way back to existing articles.**
   `src/components/articles/article-collection-page.tsx:99` and
   `src/components/archive/archive-page.tsx:71–108` hide pagination whenever the
   current page has no rows. The collection hooks do not reconcile the current
   URL page when the total shrinks. With 21 unread items, marking the sole item
   on page 2 as read can leave an empty page without Previous. The equivalent
   out-of-range URL was reproduced live: a nonzero total appeared alongside “No
   articles yet.” and no pager. Clamp/redirect invalid pages after data changes,
   preserve a route back, and distinguish an empty library from an empty result.

8. **P2 — Settings cannot be reached from mobile navigation.**
   `src/components/layout/nav-items.ts:33` excludes Settings, the desktop sidebar
   is hidden on mobile, and `src/components/layout/app-toolbar.tsx:24–38` offers
   only Sign out. This was verified at a 390px viewport. Mobile users cannot
   discover reading preferences, API-token management, or account deletion
   through the interface. Add Settings to the mobile account menu, reuse shared
   account actions across breakpoints, and label its icon-only trigger.

9. **P2 — A failed tag creation leaves the inline picker disabled.**
   `src/components/tags/tag-picker.tsx:105–111` sets `creating` before awaiting
   creation, but resets it only on success. A rejected request leaves the button
   disabled until the component is remounted. Assignment of the new tag is also
   not awaited. Use mutation pending/error state or `try/catch/finally`, await
   assignment, and provide an actionable error. More broadly, article mutations
   need consistent pending and failure feedback: a rejected member of bulk
   `Promise.all` currently skips invalidation even if other updates succeeded.

10. **P2 — The overlay reader lacks keyboard focus management.**
    `src/components/article-reader/article-reader-panel.tsx:54–65` uses a fixed
    `<aside>` for the overlay layout. It has no focus entry/return, focus trap,
    Escape handler, or inert background while open. Live opening left focus on
    the underlying article link. Use an accessible dialog/sheet for the overlay
    breakpoint and preserve non-modal behavior for the wide side-by-side layout.
    Also address keyboard visibility of hover-only row actions, accessible names
    for selection controls, and keyboard navigation of search results.

11. **P2 — Concurrent duplicate saves can return an unexpected server error.**
    `src/server/articles-service.ts:415–421` checks for a duplicate, fetches
    metadata, and then inserts. Two saves can pass the check; the unique database
    constraint rejects one with a generic error. The API's friendly “already
    exists” path handles `ArticleAlreadyExistsError`, not this database race.
    This is a source finding, relevant to simultaneous extension/web saves and
    retries. Use conflict-aware insertion and return the existing article in the
    duplicate case. Test concurrent saves with the real unique constraint.

12. **P2 — Heading IDs are added after sanitization.**
    `src/components/article-reader/markdown-rendering.ts:22–23` runs
    `rehype-sanitize` before `rehype-slug`. A local render of headings “location”
    and “name” produced those exact, unprefixed IDs, bypassing the sanitizer's
    normal clobbering protection. The
    [rehype-slug security documentation](https://github.com/rehypejs/rehype-slug#security)
    explicitly discusses this risk. Generate IDs before sanitizing, or apply an
    explicit safe prefix and verify the final output. This is a demonstrated
    hardening gap, not a demonstrated end-to-end XSS exploit.

**Code quality and architecture**

The separation between transport, services, and repositories is a good foundation.
Shared Zod contracts reduce API/CLI drift; request-scoped database and auth
factories suit Workers bindings; ownership checks are generally explicit. The
CLI's operating-system credential storage, hashed personal tokens on the server,
and guarded external HTML fetching are useful existing protections.

The main cleanup opportunities have practical consequences:

- Consolidate data loading and mutation lifecycle handling. Loader data plus
  separately initialized Query caches creates repeated fetching and divergent
  invalidation responsibilities. Share query options and use mutation state for
  pending, errors, retries, and successful cache updates. This fits TanStack's
  [mutation invalidation model](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations).
- Retire the hand-written structural HTML parser; this is the clearest place
  where custom implementation is costing correctness.
- Apply the repository's structure rules consistently. `src/routes/app.tsx`
  contains the layout and top-bar implementation rather than a thin route;
  component modules still contain helpers and shared types in several places.
  Move these while touching the relevant feature, without a broad rename-only
  refactor.
- Remove unused scaffolding: no application usage of `@tanstack/react-form` was
  found, and the empty exported query-provider component is unnecessary.
  Review dependency placement: migration/build tools such as `drizzle-kit`
  should not need to be production dependencies.
- Avoid premature architectural expansion. There is no demonstrated need for a
  new state library, different ORM, or different hosting stack.

**Library maintenance**

The production dependency audit reported 11 high and 9 moderate entries, with no
critical entries, across 649 resolved dependencies. These counts include repeated
advisories and transitive build/test tooling; they are not a count of exploitable
issues in the deployed Worker.

| Package or chain | Action and applicability |
| --- | --- |
| `better-auth` 1.6.18 | Upgrade to at least 1.6.22. The reported [account takeover advisory](https://github.com/advisories/GHSA-qq9h-g4jm-xgf3) concerns magic-link/email-OTP plugins; the current GitHub-only configuration does not enable those affected flows. |
| `nanoid` 5.1.11 | Upgrade to at least 5.1.16 and refresh affected transitive 3.x copies. The [negative-size advisory](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) concerns non-secure generators; current application calls use the secure generator with normal sizes. |
| Vitest / mocker 4.1.9 | Upgrade together, including coverage, to at least 4.1.11. The [reported issue](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) concerns the development mock server. |
| Build/test transitives | Refresh affected `js-yaml` (at least 4.3.2), `postcss` (8.5.23), `browserslist` (4.28.7), `baseline-browser-mapping` (2.11.0), and `undici` (7.29.0) chains. Remove the older `esbuild` chain through migration tooling where compatible. These versions are the audit's patched ranges, not a blanket instruction to override incompatible major versions. |

Upgrade in a focused change, inspect the resolved dependency tree, and repeat
audit, tests, typecheck, web build, and CLI smoke checks. Better Auth's request-time
setup and TanStack cookie integration look appropriate. Drizzle usage primarily
needs platform-aware batching and atomicity fixes. Radix is useful but should also
provide the reader's overlay behavior. The unified/rehype stack is reasonable
after the sanitizer-order correction.

**What the tests and delivery process are missing**

The test suite is substantial, but mocked transport and SQL implementations miss
important boundaries. The unread-count schema mismatch and D1 binding overflow
are examples of failures that can coexist with a green suite.

Prioritize a small number of meaningful integration and browser journeys:

- Real D1 migrations and repository operations, including ownership isolation,
  100-item requests, uniqueness conflicts, and concurrent rate limiting.
- Save → open → auto-mark-read → favorite/tag → verify home/list/reader agree.
- Delete or move the last item on the final page, with a recoverable navigation state.
- Mobile access to Settings and a complete keyboard-only reading journey.
- A network failure during tag creation or partially successful bulk updates.
- A corpus of realistic articles containing relative links, code, nested markup,
  images, tables, short paragraphs, and long documents.
- API/CLI behavior against a running local app, including expired/revoked tokens
  and idempotent duplicate saves.

CI currently builds only in the deployment job after a push to main. Add the
production build to PR checks. Migrations are documented as manual; add an
explicit deployment check or controlled migration step so schema changes cannot
silently outrun production. Keep tests focused on user behavior and integration
boundaries rather than mirroring implementation details.

**Missing product capabilities, ranked**

1. **Reliable saved content and recovery.** Extraction currently happens when an
   article is first read, so saving a URL does not preserve its content. Consider
   extraction at save time through background work, with visible status,
   retry/refresh, and a reliable original-page fallback. Set a clear expectation
   for pages that cannot be extracted.
2. **Undo or trash.** Article deletion is permanent. A recoverable delete would
   substantially improve confidence, especially for bulk actions and touch use.
3. **Export and import.** The API and CLI give technical users access, but the app
   lacks a complete, convenient backup/migration workflow that includes tags and
   reading state.
4. **Reading continuity.** Persist reading position, provide reader URLs that
   survive reload and browser Back, and offer text-size/line-width preferences.
5. **Search within saved content.** Useful once extraction is dependable; current
   metadata search does not replace it.

Offline reading and an additional sign-in method are potential later investments,
depending on the intended audience. A web manifest alone does not provide offline
reading. Additional feeds, recommendations, and AI features should follow the
core reliability work.

**Design recommendation**

Keep the muted mint palette, restrained surfaces, and serif/sans typography. The
app already has a coherent identity. A focused usability update would have more
value than replacing the design system:

- Make Home lead with “continue reading” and useful unread articles. Compress the
  large statistics cards and give article titles enough room to be recognized.
- Rename “Archive” to “Library” or “All articles” while it contains both read and
  unread items. Use “Archive” only if it becomes a distinct user action/state.
- Clarify the relationship between global search and the second search field on
  collection screens; avoid two controls that appear to do the same job.
- Constrain reader text to approximately 65–75 characters per line at intermediate
  desktop widths. The overlay currently spreads text across too much space.
  Remove duplicated title/date presentation and add reading controls.
- Make actions available on keyboard focus as well as hover. Add accessible
  names, reliable focus behavior, visible failure feedback, and pending states.
- Simplify mobile account navigation and expose Settings. Measure contrast and
  touch-target sizes as part of the pass; this review did not establish a full
  WCAG conformance result.

**Suggested implementation order**

First fix atomic limits, redirects, extraction correctness, and dependency
patches. Next fix count validation, D1 bulk operations, cache synchronization,
pagination, mobile Settings, mutation errors, and reader accessibility. Add
integration coverage alongside those fixes. Then introduce content preservation,
recovery/export, and reading continuity, followed by the focused layout changes.

## Implementation follow-up — 29 September 2026

All twelve findings have corresponding fixes and regression coverage where useful.
Atomic limits, ownership, 100-item batches, concurrent duplicate saves, and backup
imports now run against migrated local D1 rather than a permissive SQL fake.
The structural HTML parser has been replaced with a rehype/remark pipeline.
Shared query options, mutation feedback, thin app/login routes, and reusable account
menus address the identified cleanup work. Unused form/provider scaffolding was
removed and build/migration tooling moved to development dependencies.

The five recommended capabilities are implemented: save-time best-effort content
capture with refresh/fallback, Trash and Undo, JSON backup/import, reading progress
and reader URLs/preferences, and saved-content search. The design retains the
existing identity while improving Home hierarchy, title space, reader measure,
keyboard controls, mobile account access, and Library/search naming.

Dependencies and lockfile were refreshed, including Better Auth 1.7.6, Nano ID 6,
Vitest 5, and current Cloudflare tooling. The dependency audit reported zero known
advisories at verification time. This is not a security certification. CI now
builds on PRs and applies D1 migrations before deployment on main.

Migrations 0008/0009 must precede deployment. Only the local database has been
migrated during implementation; no production deployment or database change was
performed. See architecture/deployment documentation for capture, backup, Trash,
and reading-progress limits. Offline mode, another sign-in provider, and optional
feeds/AI features remain future ideas, as in the original review.

Final validation: Biome and TypeScript pass, 251 tests across 78 files pass (web,
contracts, and CLI), and the full production build plus built-CLI smoke check pass.
Browser checks used only a disposable local account: new-save background capture,
unread count/auto-read, empty-page recovery, Trash restoration, backup download,
reader URL/focus/Escape/position, and desktop/mobile layouts. Import validation,
partial-failure retry, and D1 writes are tested automatically; browser file selection
was blocked by the extension's file-access setting and was not changed. Temporary
local account data is removed after the checks. Production OAuth and production
migration execution were not rerun as part of this change.

Follow-up refinements: removed reader line-width controls, added a public CLI guide
and Settings link, aligned toast colors with the app theme, added confirmed permanent
Trash deletion/emptying, added Continue reading completion, and centered all app pages.

Follow-up validation: all 256 tests across 80 files, Biome, TypeScript, and the
production web/CLI build pass. New tests cover permanent-delete ownership and
cascades, 100-ID requests, Empty Trash isolation, completion of previously marked
read articles, confirmation cancellation, and deletion retry after failure.
