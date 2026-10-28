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
| Ink faint | `text-faint-foreground` | `#8aa0a2` | `#5f7f80` | Placeholders, counts (never body text) |
| Mark | `text-mark`, `ring-ring` | `#328f97` | `#6cc3c4` | Unread spine, focus, progress, active icons |
| Action | `bg-primary`, `text-primary` | `#23767e` | `#6cc3c4` | Primary buttons, links |
| Favorite | `text-favorite`, `bg-favorite-fill` | `#8f6210` | `#e0ad55` | Favorite marker, the only warm color |
| Danger | `text-destructive`, `bg-destructive` | `#b03f2c` | `#e07a66` | Delete, errors |

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

## shadcn components

Style through tokens first. Change `src/components/ui/` only for defaults and
variants used across the app, and record each change here so shadcn updates stay
easy to merge.

| Component | Change |
| --- | --- |
| `badge` | `secondary` uses the label colors (`bg-muted text-muted-foreground`) |
| `toggle-group` | The active item uses `bg-select` with a `ring-mark/45` edge |
