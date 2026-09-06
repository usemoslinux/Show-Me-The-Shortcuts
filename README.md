# WebApp Shortcuts Overlay (Firefox)

A Firefox Desktop 140+ Manifest V3 extension that shows a local, searchable keyboard-shortcut overlay for the supported web app in the active tab.

## Privacy and permissions

The extension requests only:

- `activeTab`, granted temporarily by a toolbar click or assigned extension command;
- `scripting`, used to inject the overlay into that user-selected tab.

It has no host permissions, static content scripts, storage, telemetry, remote code, or external-origin runtime requests. Shortcut data is packaged in `data/shortcuts.json`; the extension examines the active tab URL only long enough to select an exact-host guide and does not store or transmit it.

## Supported sites

- Gmail: `mail.google.com`
- Outlook on the web: `outlook.live.com`, `outlook.office.com`, `outlook.office365.com`
- ChatGPT: `chatgpt.com`, `chat.openai.com`
- Claude: `claude.ai`
- Notion: `notion.so`, `www.notion.so`
- Google Docs document editor only: `docs.google.com/document/...`
- Facebook: `facebook.com`, `www.facebook.com`
- TikTok: `tiktok.com`, `www.tiktok.com`
- LinkedIn: `linkedin.com`, `www.linkedin.com`
- X: `x.com`, `twitter.com`
- WhatsApp Web: `web.whatsapp.com`
- Discord: `discord.com`, `www.discord.com`
- YouTube: `youtube.com`, `www.youtube.com`
- Telegram Web: `web.telegram.org`
- Twitch: `twitch.tv`, `www.twitch.tv`
- Vimeo: `vimeo.com`, `www.vimeo.com`
- Reddit: `reddit.com`, `www.reddit.com`
- Microsoft Teams Web: `teams.microsoft.com`, `teams.live.com`
- Google Meet: `meet.google.com`

Matching is HTTPS-only and uses exact host names. The content adapter validates the live top-frame URL against the selected app's packaged site rules immediately before it renders, so a navigation in the action/injection interval fails closed. Generic web pages, lookalike domains, Google Sheets/Slides URLs, Firefox internal pages, PDFs, reader view, and protected pages are unavailable. On an ordinary unsupported page, the toolbar action shows an `N/A` badge and does not inject page DOM.

## Load temporarily in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Choose this directory's `manifest.json`.
4. Open a supported HTTPS site, then click the extension toolbar button.
5. Click again to close the overlay. The default shortcut is `Alt+Shift+K` when Firefox has assigned it.

Firefox may leave a suggested command unassigned when it conflicts with another shortcut. The toolbar action remains available. Change or assign it through `about:addons` → gear menu → **Manage Extension Shortcuts**; do not add a page-level keydown handler as a workaround.

To package a development XPI after validation:

```sh
zip -r webapp-shortcuts-overlay.xpi manifest.json src data README.md -x '*__pycache__*'
```

A production AMO submission needs a project-owned Gecko extension ID in place of the example ID and AMO signing.

## Structure

```text
manifest.json              Firefox MV3 declaration
src/background.js          URL resolution, data validation, action lifecycle
src/content.js             Versioned message adapter and overlay lifecycle
src/overlay-ui.js          Shadow-DOM dialog implementation
data/shortcuts.json        Packaged, validated shortcut guides
tests/test_extension_foundation.py
```

`src/overlay-ui.js` is injected before `src/content.js`. Its only public contract is `globalThis.WebAppShortcutsOverlayUI.create()`, which returns a controller with `open`, `close`, `isOpen`, `focus`, and `destroy` methods.

## Automated checks

This execution environment has no JavaScript runtime or `web-ext`. Run the package-contract tests here with:

```sh
python3 -m unittest -v tests.test_extension_foundation
python3 -m json.tool manifest.json >/dev/null
python3 -m json.tool data/shortcuts.json >/dev/null
```

Before release, run `web-ext lint` in an environment with Node.js/web-ext installed, then load the add-on in Firefox and exercise:

- toolbar and assigned `Alt+Shift+K` activation;
- each supported site, an unsupported Docs path, and a lookalike host;
- repeated/rapid toggles, Escape, close button, backdrop click, filtering, focus cycling, and focus restoration;
- an unsupported HTTPS page plus `about:addons`, reader view, PDF, `view-source:`, and AMO/protected pages;
- a narrow viewport, 200% zoom, reduced motion, and forced-colors mode.

## Maintaining shortcut data

`background.js` validates the complete dataset before any injection. Invalid IDs, unsafe source URLs, duplicate identifiers, invalid platform bindings, malformed shortcut sequences, and ambiguous cross-app site rules fail closed. User-visible fields are rendered as text nodes by the Shadow-DOM UI; data must remain plain JSON and source links must use HTTPS.
