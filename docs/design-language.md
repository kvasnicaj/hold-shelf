# Hold Shelf design language

One set of colors, type, shapes and densities for every Hold Shelf surface: the
app, the reader, public pages, `/save` and the extension. It starts from the
Reading Shelf mark (see [branding.md](./branding.md)): flat solid shapes, teal
and ink, a single lean for character. shadcn components stay underneath and are
styled through the tokens below.

## Principles

- **Flat, like the mark.** Solid fills and hairlines. Depth comes from surfaces
  stepping in tone. Only floating layers (menus, dialogs, toasts, the bulk bar)
  cast a shadow (`shadow-float`).
- **Serif for reading, sans for doing.** Source Serif 4 sets page titles,
  headings, article titles in calm views and reader text. Manrope sets
  navigation, controls, metadata and dense lists.
- **One accent, used for state.** Teal means unread, active, focused or in
  progress. Article titles stay ink. Teal is never decoration.
- **Density follows intent.** Each screen picks one density level from its task.
- **A library, not a newspaper.** No broadsheet columns, ornamental rules or
  old-print textures. Library cues are structural: shelves, spines, labels.
- **Calm motion.** 120 ms for hover and press, 180 ms for menus and dialogs,
  ease-out. No entrance animations on page load. Respect reduced motion.

## Color

Role tokens in `src/styles.css` are the single source. shadcn variables point
at them, and every neutral is tinted toward the brand ink.

| Role | Tailwind | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| Paper | `bg-background`, `bg-sidebar` | `#f3f5f0` | `#0d1f23` | App ground, sidebar |
| Sheet | `bg-card`, `bg-popover` | `#fbfcf9` | `#122a2f` | Content, cards, menus |
| Raised | `bg-muted`, `bg-accent`, `bg-secondary` | `#e9eee8` | `#1a363c` | Hover, muted fills, tag labels |
| Select | `bg-select` | `#e1efea` | `#173a40` | Selected rows, active filters |
| Line | `border-border` | `#dbe2dc` | `#22424a` | Hairlines |
| Line strong | `border-input` | `#c3cec8` | `#2f565d` | Inputs, dividers that must be seen |
| Ink | `text-foreground` | `#173a40` | `#dcebe7` | Text |
| Ink soft | `text-muted-foreground` | `#526d71` | `#93b2ad` | Metadata |
| Ink faint | `text-faint-foreground` | `#8aa0a2` | `#5f7f80` | Placeholders and decorative icons only (below 4.5:1) |
| Mark | `text-mark`, `ring-ring` | `#328f97` | `#6cc3c4` | Unread spine, focus, progress, active icons |
| Action | `bg-primary`, `text-primary` | `#23767e` | `#6cc3c4` | Primary buttons, links |
| Favorite | `text-favorite`, `bg-favorite-fill` | `#8f6210` | `#e0ad55` | Favorite marker, the only warm color |
| Danger | `text-destructive`, `bg-destructive` | `#b03f2c` | `#e07a66` | Delete, errors |
| Inverse | `bg-inverse`, `text-inverse-foreground` | `#173a40` / `#d7ece8` | `#d7ece8` / `#173a40` | Floating bars and toasts |

Text tokens meet WCAG AA on paper, sheet and raised in both themes. Mark is for
non-text UI only (3:1). Dark mode is built on the brand ink, not black, and the
logo turns mint (`--logo-mark`, `--logo-word`).

## Typography

| Style | Family and weight | Size / line height | Use |
| --- | --- | --- | --- |
| Display | Serif 600 | 44/48 | Landing hero |
| Title 1 | Serif 600 | 28–30/36 | Page titles |
| Title 2 | Serif 600 | 22/28 | Section headings, reader h2 |
| Title 3 | Sans 600 | 15/22 | Row titles, dialog titles |
| Body | Sans 400 | 14/22 | Default UI text |
| Small | Sans 500 | 12.5/18 | Metadata |
| Label | Sans 600 | 12/16 | Group headings, sentence case |
| Reading | Serif 400 | 19/31, 64ch | Reader body, adjustable 16–24 |

Use `font-serif font-semibold` for serif headings. Use tabular numbers
(`tabular-nums`) for counts and dates. Labels are sentence case, not tracked
uppercase.

## Shape and space

| Radius | Tailwind | Use |
| --- | --- | --- |
| 4 px | `rounded-sm` | Tags, checkboxes, kbd |
| 6 px | `rounded-md` | Buttons, inputs, nav items |
| 8 px | `rounded-lg` | Menus, toasts, list frames |
| 12 px | `rounded-xl` | Content sheet, dialogs |

Spacing follows a 4 px grid. Control heights are 28 (small), 32 (default) and
40 (large, mobile).

## Density

| Level | Job | Screens |
| --- | --- | --- |
| Compact | Find, sort and act on many articles | Library, Trash, tag management |
| Comfortable | Choose what to read next | Unread, Favorites, tag pages, search, shared tags |
| Spacious | Come back, pick up, browse | Home, landing page, empty states |

The reader is its own mode: everything except the text steps back.

## App shell

- **Desktop:** the sidebar sits on the paper ground. Main content and the
  reader are sheets (`bg-card`, `rounded-xl`, border) set 8 px into the
  ground.
- **Sidebar:** logo, then Save a link as the only primary button, then Home,
  Unread, Favorites and Library, then Tags, then the account. The active item
  is a sheet with a hairline ring and a teal icon. Counts use tabular numbers;
  the unread count is teal.
- **Mobile bottom bar:** Home, Unread, Save, Favorites, Library on a flat paper
  bar with one hairline. Save is a filled button in the middle. The active tab
  has a teal icon and a short teal line under it, echoing the logo's shelf.
  Labels are always visible.
- **Mobile top bar:** brand symbol on the left, account avatar on the right.
  On mobile, tags are reached from Library's tag row.

## Article states

- **Unread:** an upright 3 px teal spine (`ReadStateSpine`) before the row.
  It is the one mark taken from the logo; read rows keep the space empty.
- **Read:** the title turns `text-muted-foreground` at regular weight.
- **Favorite:** a filled ochre bookmark after the title.
- **Selected:** a square checkbox and a `bg-select` row. Checkboxes in dense
  lists appear on hover, on focus, or once anything is selected.
- **Titles** are ink, never link-colored; teal is reserved for state.

## Library

- Compact density: one line per article, 44 px rows, no card frame. Columns
  line up without vertical rules.
- When sorted by date, rows sit under month headings (serif month, tabular
  count). Sorting by title shows one list.
- Row actions (tags, more) appear on hover or focus.
- Bulk actions float at the bottom as an inverse toolbar instead of moving
  the header.
- On mobile, rows show a two-line title and a meta line, and tags filter
  through a scrolling chip row ending in Manage.

## Unread and Favorites

- Comfortable density: one hairline-divided list, no per-article card frames.
- Each row: hover checkbox, unread spine, favicon, a 15 px semibold title, a
  two-line excerpt, then site, time and tag labels.
- Row actions (tags, bookmark, read, delete) appear on hover. On phones they
  stay visible under the title.
- Page header matches Library: serif title with the count beside it, search
  and sort on one line.

## Home

- Spacious density. The header is a serif line ("Make time for a good read"),
  a sentence about what is waiting, and the counts as one quiet line instead
  of tiles.
- Continue reading leads: a serif title, the site, a 3 px teal progress line,
  Continue as the primary action and Mark as read beside it. Other articles in
  progress follow as compact rows.
- Three shelves follow: Oldest unread, Recently saved, Favorites. Each heading
  sits on a 2 px ink line, the shelf from the logo, with a link to the full
  page. Items use serif titles.

## Quick save

- One panel for saving links, opened by Save a link, the mobile Save tab, the
  S key, or pasting a link anywhere outside a text field.
- The link is the whole form: one large field with no label row. The status
  line under it previews the site ("overreacted.io · Saves to Unread") or
  explains a problem in plain words.
- Tags are optional chips chosen before saving.
- Enter saves, Shift+Enter saves and opens the reader. The footer shows these
  as `kbd` hints on desktop.
- Desktop: a sheet-colored panel near the top with `shadow-float`. Phones: a
  bottom sheet with a serif title and Paste from clipboard.
- A plain save ends with the inverse toast "Saved to Unread" and a Read now
  action.

## shadcn components

Style through tokens first. Change `src/components/ui/` only for defaults and
variants used across the app, and record each change here so shadcn updates stay
easy to merge.

| Component | Change |
| --- | --- |
| `badge` | Square `rounded-sm` labels instead of pills; `secondary` uses the label colors (`bg-muted text-muted-foreground`) |
| `toggle-group` | A `bg-muted` track without a border; the active item is a sheet (`bg-card`) with a hairline ring |
