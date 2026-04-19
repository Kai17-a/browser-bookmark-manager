# Browser Extension

This directory contains the Manifest V3 extension used with Shiori Keeper.

## What it does

- Reads the current tab title and URL from the popup
- Sends bookmarks to a Shiori Keeper API server
- Stores the API server URL in `chrome.storage.local`
- Checks API connectivity from the popup
- Loads folders and tags for bookmark organization
- Updates existing bookmarks by URL and falls back to creation when needed

## Development

- `bun install`
- `bun run dev`
- `bun run build`

The extension is built with WXT, Vue 3, and PrimeVue.
