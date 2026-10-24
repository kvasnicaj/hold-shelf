# Hold Shelf brand

The Reading Shelf symbol pairs two upright books and one leaning book with a
separate shelf. The wordmark uses Source Serif 4 Semibold (weight 600, optical
size 32), converted to vector outlines. Use the supplied artwork rather than
retyping the name: its spacing and proportions are part of the identity.

## Production files

The canonical artwork and layout measurements live in
`src/components/brand/artwork.json`. The shared `BrandLogo` component and
`scripts/generate-brand-assets.mjs` both read this master.

`public/brand/` contains SVG and transparent PNG exports:

| Layout | Use | PNG width |
| --- | --- | --- |
| `horizontal` | App headers, stationery, general use | 1600 px |
| `stacked` | Landing page, centered covers | 1024 px |
| `symbol` | Avatars, app icons, compact navigation | 512 px |
| `wordmark` | Name alone where the symbol appears separately | 1600 px |

Each layout has `light`, `dark`, `black`, and `white` treatments. `light` means
teal symbol and ink lettering for light backgrounds; `dark` means mint artwork
for dark backgrounds. Black and white are single-color production versions.
The SVGs contain paths only, with no font or external image dependencies.

`hold-shelf-symbol-small.svg` has adjusted upright stems for 16 px use and inherits
`currentColor`. Use the standard symbol at 24 px and above. App and browser icons
are generated in their required dimensions in `public/` and `extension/icons/`.
The maskable icon keeps all artwork within the central safe circle. The
1200 × 630 social card is available as SVG and PNG in `public/brand/`.

## Color and space

| Color | Value | Role |
| --- | --- | --- |
| Teal | `#328f97` | Symbol on light backgrounds |
| Ink | `#173a40` | Wordmark and dark brand backgrounds |
| Mint | `#d7ece8` | Reversed artwork on dark backgrounds |
| Pale green | `#e7f3ec` | App icon background |

Keep at least one upright book's width of clear space around the visible
artwork. Do not stretch, rotate, add outlines or shadows, or rearrange the
symbol's books. Use the supplied reversed version over a sufficiently dark,
quiet background. Favor the symbol alone when the full name would become too
small; the app uses the horizontal lockup at 28 px high and the mobile symbol
at 28 px.

## App use

```tsx
<BrandLogo />
<BrandLogo variant="stacked" className="w-80" />
<BrandLogo variant="symbol" />
<BrandLogo variant="symbol" compact className="size-4" />
```

The component adapts to the app theme and exposes the accessible name “Hold
Shelf.” Pass `decorative` only when nearby text already provides that name.
Interface typography remains Manrope, with Lora for existing display headings;
the Source Serif selection applies to the logo.

## Regeneration

```bash
pnpm install --frozen-lockfile
pnpm brand:generate
```

Commit the generated assets with changes to the master or generator. The
generator requires no network access or installed fonts. Review both themes
and the 16 px icons after changing the symbol. For printed material, start with
the vector SVGs and have the print supplier handle its output color profile.

Source Serif's license accompanies the exports and is retained in
`licenses/source-serif-4.txt`. The original symbol uses the repository's MIT
license; extension packages include that notice in `extension/icons/LICENSE`.
