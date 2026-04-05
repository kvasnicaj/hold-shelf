# Hold Shelf Chrome Extension

This is a minimal Manifest V3 scaffold for saving pages into Hold Shelf.

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
