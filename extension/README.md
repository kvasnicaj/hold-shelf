# Hold Shelf Chrome Extension

This Manifest V3 extension saves pages into Hold Shelf.

## Load it locally

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose `Load unpacked`
4. Select the `extension/` directory in this repo

## Current behavior

- clicking the toolbar icon saves the current tab URL
- right-clicking a page saves that page
- right-clicking a link saves the link target
- if the user is not signed in on `hold-shelf.com`, the extension opens the
  website login handoff flow and the site finishes the save there
- repeat saves succeed only for `ARTICLE_EXISTS`; account-limit errors show
  the server's explanation instead of a misleading success notification
- notifications use the app's inverse, danger and floating-layer design tokens,
  announce their status to assistive technology, and respect reduced motion

## 0.1.2

- Align save notifications with the current Hold Shelf design.
- Correct feedback when an account's storage limit prevents a save.
- Use the current `/save` page for the sign-in fallback.

Version 0.1.1 is already published; changed extension code requires a higher
version for the next Chrome Web Store upload.

## Validation and store listing

Run the extension's save-response regression checks with
`node --test extension/background.test.js`.

Store copy and upload-ready artwork live in [`store/`](./store/listing.md).
The explicit distribution file list below excludes tests and listing assets.

## Permissions

- `activeTab`: read the current page URL when the toolbar button is clicked
- `contextMenus`: add "Save page" and "Save link" entries to the browser menu
- `scripting`: show lightweight in-page success and error feedback
- `https://hold-shelf.com/*`: call the Hold Shelf save API and open the login
  handoff page

The production extension does not request broad site access, history access, or
persistent tab-reading permissions.

## Local development

The checked-in extension targets production:

```js
const APP_ORIGIN = "https://hold-shelf.com";
```

To test locally, temporarily change `APP_ORIGIN` to `http://localhost:3000` in
`background.js` and add `http://localhost:3000/*` to `host_permissions` in
`manifest.json`, then reload the extension.

## Package for distribution

Build a fresh archive from source rather than committing generated ZIP files.
From the repository root on macOS or Linux (with `zip` installed):

```sh
mkdir -p dist
rm -f dist/hold-shelf-extension.zip
(cd extension && zip -X -r ../dist/hold-shelf-extension.zip manifest.json background.js icons)
zip -j dist/hold-shelf-extension.zip LICENSE
```

The explicit file list excludes local files and macOS metadata. Keep
`icons/LICENSE` in the archive: the original Reading Shelf symbol uses the MIT
license. See the [brand guide](../docs/branding.md) for artwork details.
The root `LICENSE` covers the extension's original code under MIT.
