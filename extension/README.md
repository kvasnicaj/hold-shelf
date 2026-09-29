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
`icons/LICENSE` in the archive: the icons use Lucide artwork. See the repository's
[third-party notices](../THIRD_PARTY_NOTICES.md) for attribution.
The root `LICENSE` covers the extension's original code under MIT.
