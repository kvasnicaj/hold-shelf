# Storybook

Run `pnpm storybook` and open <http://localhost:6006> to develop components in
isolation. The preview runs with synthetic data and an in-memory router and API.
No Worker secrets, database, or sign-in are needed.

The preview imports `src/styles.css`, including Tailwind, the app's fonts and
design tokens. The theme toolbar switches between Light and Dark using the app's
`.dark` class. The viewport toolbar includes Phone, Tablet, Desktop and Wide
desktop presets. Phone stories select the phone viewport automatically.

## Catalogue

Every component file under `src/components/` has a matching kebab-case
`*.stories.tsx` file in `src/stories/`. Compound UI components are demonstrated as
complete compositions: for example, Card includes its header, description, action,
content and footer; Sidebar includes its groups, menus, submenus, badges, skeleton,
rail and trigger. Provider stories include real consumer controls to open and
close their dialogs or reader.

| Group | Coverage |
| --- | --- |
| Brand and UI | Logos, buttons, badges, inputs, selection controls, cards, menus, tooltips, dialogs, sheets, pagination and all sidebar shells |
| Layout | Headings, search fields, navigation, account menus, avatars, toasts, app sidebar, mobile bars and the complete app shell |
| Articles and Reader | Cards and lists, metadata, sorting, selection, bulk actions, reading states, Markdown, reader preferences, frame, panel and provider |
| Library and Tags | Responsive tables, filters, month groups, tag labels and chips, pickers, create/rename/share dialogs, lists and deletion confirmation |
| Home, Search and Save | Shelves, continue reading, landing preview, search results and panels, save forms and dialogs, and providers |
| Settings, Shortcuts and Theme | Account, tokens, CLI, backup, account deletion, keyboard help and theme choices |
| Public and Documentation | Page layouts, headings, sections, footers, cookie consent, shared lists, extension link and API documentation components |
| Pages | Home, Unread, Favorites, Library, Tags, Trash, Settings, landing, sign-in, save, sharing, About, Privacy, API/CLI docs and unavailable pages |

Stories include relevant populated, empty, selected, disabled, pending, failure,
unavailable-content and mobile states. Controls edit component props, Docs shows
generated component documentation, and Actions records callback arguments.
Controlled examples use `useStoryState` to hold local React state and reset it
when Controls change. This also makes the demos interactive in portable tests.
Full pages and provider demos use the Canvas view. Modal compositions use separate
Docs iframes so their overlays stay within their own example.

## Sample data and requests

`src/stories/fixtures.ts` contains shared synthetic articles, tags, reader content
and account data. `src/stories/helpers.ts` contains reusable callback spies.
`.storybook/mocks/api.ts` supplies the sample API, including article and tag edits,
Trash, reading progress, sharing links, tokens and library backup. Each story
starts with a fresh copy of the data. Authentication uses a synthetic account;
GitHub sign-in displays a demo message.

Choose `parameters.mockScenario` when a story needs a different request state:

| Scenario | Behavior |
| --- | --- |
| `default` | Populated library with successful requests |
| `empty` | Empty articles, tags, continue reading and Trash |
| `error` | Requests fail so error messages and retry controls can be inspected |
| `loading` | Requests remain pending |
| `unavailable` | Reader text is unavailable |
| `duplicate` | Saving a link reports that it is already in the library |
| `signed-out` | Session data is absent |
| `token` | An existing sample API token and sharing link |

`.storybook/story-environment.tsx` supplies an independent QueryClient and memory
router. Set `parameters.routePath` for components that read a route's loader data,
search or hash, such as `/app/tags?tag=design` or
`/app/home#article=article-1`. The full app shell and provider demos set
`parameters.appShell: true` and supply their own app providers.

## Adding stories

Add a kebab-case `*.stories.tsx` file under `src/`; Storybook discovers it
automatically. Use `Meta` and `StoryObj` from `@storybook/react-vite` with
`satisfies Meta<typeof Component>`. Reuse the fixtures, callback helpers and actual
app components. Follow [the design language](./design-language.md) and use the
shared CSS tokens for example layouts.

Prefer props and callbacks for individual components. Route-aware pages can use
the sample environment above. Add any new server-function dependency to the
preview's explicit mock aliases and provide a matching sample implementation.

## Configuration and checks

`.storybook/main.ts` selects React with Vite, Docs, Themes, Accessibility and the
Vitest addon, and serves `public/`
assets. `.storybook/vite.config.ts` provides Tailwind, TypeScript aliases, and the
preview-only server-function and auth aliases. Storybook supplies the React
plugin. The application config's Cloudflare, TanStack Start and devtools plugins
are excluded so previews run entirely in the browser. Restart Storybook after
changing its Vite configuration.

`pnpm check` and `pnpm typecheck` include the stories and Storybook configuration.
Stories, sample data and preview helpers are excluded from application coverage.

Run `pnpm build-storybook` to create `storybook-static/`, which is ignored by Git.
CI builds the entire catalogue alongside the app to catch broken imports and
configuration. The output can be served by any static host; publishing is
separate from the Cloudflare Worker deployment.

## Browser tests

Install Chromium once after installing repository dependencies:

```bash
pnpm exec playwright install chromium
```

On Linux, use `pnpm exec playwright install --with-deps chromium` to install the
browser's system dependencies too. No running Storybook or app server is required
for command-line tests.

| Command | Behavior |
| --- | --- |
| `pnpm test:storybook` | Run all stories in headless Chromium in the light theme |
| `pnpm test:storybook:dark` | Run the same suite in the dark theme |
| `pnpm test:storybook:watch` | Watch browser tests while editing |
| `pnpm test:storybook:coverage` | Run browser tests with V8 coverage |
| `pnpm test` | Existing server, UI, API contract and CLI unit suites |
| `pnpm test:all` | Unit suites followed by both Storybook themes |

Use `STORYBOOK_THEME=dark pnpm test:storybook:coverage` for dark-theme coverage.
Pass a story file to run a smaller set, for example
`pnpm test:storybook src/stories/quick-save-form.stories.tsx`.

`.storybook/vitest.config.ts` reuses the preview's Vite configuration and the
official `storybookTest` plugin. The plugin discovers stories from `main.ts`,
loads preview annotations, and turns every story into a real-browser render test.
Story viewport globals resize Chromium, so Phone, Tablet and Wide examples also
exercise responsive behavior. The root Vitest configuration registers this as
the `storybook` project so Storybook's **Run tests** widget can discover it.
The widget's Coverage mode uses the same component/hook scope; unit-test coverage
continues to include server code. This keeps Cloudflare-only modules out of the
browser's coverage collection.

Stories with `play` functions additionally test user behavior using `expect`,
`userEvent`, `within` and `waitFor` from `storybook/test`. Open their
**Interactions** panel to replay assertions and inspect failed steps. The suite
covers URL validation, tag assignment and creation, failed-save recovery, search
results and retries, pagination boundaries, reader preferences, keyboard focus,
menu navigation, token generation/revocation, Trash restore/confirmation, and the
complete desktop and phone save-to-reader flows. Use `step` to group longer flows.
Query dialogs and menus through `canvasElement.ownerDocument.body` because they
render in portals. Prefer accessible roles and names over selectors.

The Accessibility addon runs axe after each story's interactions. Global
`a11y.test: "error"` makes violations fail the browser suite and CI. The
**Accessibility** panel also supports manual inspection of violations and items
that need human review. Keep the checks enabled when adding stories. The open
dropdown composition uses its supported non-modal mode for inspection; a separate
keyboard test exercises the modal menu's focus movement and Escape restoration.
All axe rules still run. Browser test reports use axe's `no-passes` reporter and
`resultTypes: ["violations"]` to keep complete failures without synchronizing
repeated passing-node data for every story.
The preview's Accessibility panel keeps full diagnostics for manual inspection.

Each run resets synthetic API data, authentication, query caches and callback
histories. Tests do not call the Worker, D1, GitHub OAuth or real account APIs.
These component tests complement the server/unit suites; they do not replace
integration tests against a deployed backend or manual accessibility review.

Coverage is written to `coverage/storybook/light/` or `coverage/storybook/dark/`
as HTML and LCOV, covering production components and hooks. JUnit reports live at
`test-results/storybook-light.xml` and `test-results/storybook-dark.xml`. Failed
tests save screenshots under the corresponding theme's attachments directory.
The local test API listens only on loopback and allows file writes for these
screenshots. Generated reports and screenshots are ignored by Git.

CI runs the browser suite with coverage in a light/dark matrix, installs Chromium
and its Linux dependencies, and uploads test reports, failure screenshots and
coverage for seven days. Production deployment waits for both themes to pass.
Screenshots are failure diagnostics; hosted visual comparison requires a
separately configured baseline service.
