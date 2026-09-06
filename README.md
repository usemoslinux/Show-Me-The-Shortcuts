# Show Me The Shortcuts (Firefox)

A Firefox Desktop 140+ Manifest V3 extension that shows a local, searchable keyboard-shortcut overlay for the supported web app in the active tab.

## Privacy and permissions

The extension requests only:

- `activeTab`, granted temporarily by a toolbar click or assigned extension command;
- `scripting`, used to inject the overlay into that user-selected tab.

It has no host permissions, static content scripts, storage, telemetry, remote code, or external-origin runtime requests. Shortcut data is packaged in `data/shortcuts.json`; the extension examines the active tab URL only long enough to select an exact-host guide and does not store or transmit it.

## Supported sites

| Site | Category | No. of shortcuts | Source |
|------|----------|------------------|--------|
| [ChatGPT](https://chatgpt.com) | AI assistants | 50 | [Community docs](https://fastshortcuts.com/shortcuts/chatgpt/) |
| [Claude](https://claude.ai) | AI assistants | 66 | [Community docs](https://support.anthropic.com/en/) |
| [Google Gemini](https://gemini.google.com) | AI assistants | 2 | [Community docs](https://fastshortcuts.com/shortcuts/gemini/) |
| [Gmail](https://mail.google.com) | Email & communication | 85 | [Official docs](https://support.google.com/mail/answer/6594?hl=en&co=GENIE.Platform%3DDesktop) |
| [Outlook on the web](https://outlook.live.com) | Email & communication | 92 | [Official docs](https://support.microsoft.com/en-us/accessibility/outlook/keyboard-shortcuts-for-outlook) |
| [Discord](https://discord.com) | Messaging | 30 | [Official docs](https://support.discord.com/hc/en-us/articles/31232432266647-Discord-Commands-Shortcuts-and-Navigation-Guide) |
| [Google Chat](https://chat.google.com) | Messaging | 44 | [Official docs](https://support.google.com/chat/answer/7649271?hl=en&co=GENIE.Platform%3DDesktop) |
| [Telegram](https://web.telegram.org) | Messaging | 24 | [Community docs](https://en.androidsis.com/telegram-shortcuts/) |
| [WhatsApp](https://web.whatsapp.com) | Messaging | 13 | [Official docs](https://faq.whatsapp.com/6204576529560565) |
| [Google Calendar](https://calendar.google.com) | Productivity & docs | 18 | [Official docs](https://support.google.com/calendar/answer/37034?hl=en&co=GENIE.Platform%3DDesktop) |
| [Google Docs](https://docs.google.com/document/) | Productivity & docs | 194 | [Official docs](https://support.google.com/docs/answer/179738?hl=en&co=GENIE.Platform%3DDesktop) |
| [Google Drive](https://drive.google.com) | Productivity & docs | 68 | [Official docs](https://support.google.com/drive/answer/2563044?hl=en&co=GENIE.Platform%3DDesktop) |
| [Google Sheets](https://docs.google.com/spreadsheets/) | Productivity & docs | 123 | [Official docs](https://support.google.com/docs/answer/181110?hl=en&co=GENIE.Platform%3DDesktop) |
| [Google Slides](https://docs.google.com/presentation/) | Productivity & docs | 167 | [Official docs](https://support.google.com/docs/answer/1696717?hl=en&co=GENIE.Platform%3DDesktop) |
| [Notion](https://notion.so) | Productivity & docs | 128 | [Official docs](https://www.notion.com/help/keyboard-shortcuts) |
| [Trello](https://trello.com) | Productivity & docs | 22 | [Official docs](https://support.atlassian.com/trello/docs/keyboard-shortcuts-in-trello/) |
| [Canva](https://canva.com) | Productivity & docs | 39 | [Official docs](https://www.canva.com/help/keyboard-shortcuts/) |
| [Figma](https://figma.com) | Productivity & docs | 57 | [Official docs](https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard) |
| [Toggl Track](https://track.toggl.com) | Productivity & docs | 8 | [Official docs](https://support.toggl.com/en-us/article/are-there-any-keyboard-shortcuts-1bcagm6/) |
| [WordPress](https://wordpress.com) | Productivity & docs | 30 | [Official docs](https://wordpress.com/support/wordpress-editor/keyboard-shortcuts/) |
| [Dropbox](https://dropbox.com) | Productivity & docs | 6 | [Official docs](https://help.dropbox.com/organize/keyboard-shortcuts) |
| [Feedly](https://feedly.com) | Productivity & docs | 25 | [Official docs](https://docs.feedly.com/article/81-what-are-the-keyboard-shortcuts) |
| [Wikipedia](https://en.wikipedia.org) | Productivity & docs | 26 | [Official docs](https://en.wikipedia.org/wiki/Help:Keyboard_shortcuts) |
| [Todoist](https://todoist.com) | Productivity & docs | 67 | [Official docs](https://www.todoist.com/help/articles/use-keyboard-shortcuts-in-todoist-Wyovn2) |
| [DuckDuckGo](https://duckduckgo.com) | Search engines | 8 | [Official docs](https://duckduckgo.com/duckduckgo-help-pages/features/keyboard-shortcuts) |
| [Google](https://google.com) | Search engines | 1 | [Community docs](https://www.seroundtable.com/google-search-keyboard-shortcut-31269.html) |
| [Facebook](https://facebook.com) | Social networks | 11 | [Official docs](https://www.facebook.com/help/156151771119453/) |
| [LinkedIn](https://linkedin.com) | Social networks | 17 | [Official docs](https://www.linkedin.com/help/linkedin/answer/a6246187) |
| [Reddit](https://reddit.com) | Social networks | 25 | [Official docs](https://support.reddithelp.com/hc/en-us/articles/38744650091412-How-to-use-keyboard-shortcuts-hotkeys) |
| [TikTok](https://tiktok.com) | Social networks | 4 | [Community docs](https://tutorialtactic.com/blog/tiktok-desktop-shortcuts/) |
| [X](https://x.com) | Social networks | 26 | [Official docs](https://help.x.com/en/using-x/how-to-post) |
| [Mastodon](https://mastodon.social) | Social networks | 36 | [Official docs](https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/features/keyboard_shortcuts/index.jsx) |
| [Twitch](https://twitch.tv) | Video | 18 | [Community docs](https://shortcuts.kstanchev.com/apps/twitch) |
| [Vimeo](https://vimeo.com) | Video | 18 | [Official docs](https://help.vimeo.com/hc/en-us/articles/12425998125073-What-are-player-keyboard-shortcuts) |
| [YouTube](https://youtube.com) | Video | 25 | [Official docs](https://support.google.com/youtube/answer/7631406?hl=en) |
| [Netflix](https://netflix.com) | Video | 9 | [Official docs](https://help.netflix.com/en/node/24855) |
| [Coursera](https://coursera.org) | Video | 14 | [Official docs](https://www.coursera.support/s/article/learner-000001247) |
| [SoundCloud](https://soundcloud.com) | Video | 22 | [Community docs](https://defkey.com/soundcloud-shortcuts) |
| [Google Meet](https://meet.google.com) | Video conferencing | 15 | [Official docs](https://support.google.com/a/users/answer/9896256?hl=en&co=GENIE.Platform%3DDesktop) |
| [Microsoft Teams](https://teams.microsoft.com) | Video conferencing | 120 | [Official docs](https://support.microsoft.com/en-us/accessibility/teams/keyboard-shortcuts-for-microsoft-teams) |
| [Airbnb](https://airbnb.com) | Travel | 6 | [Official docs](https://www.airbnb.com/help/article/3928) |

Matching is HTTPS-only and uses exact host names. The content adapter validates the live top-frame URL against the selected app's packaged site rules immediately before it renders, so a navigation in the action/injection interval fails closed. Generic web pages, lookalike domains, unsupported Google Docs paths, Firefox internal pages, PDFs, reader view, and protected pages are unavailable. On an ordinary unsupported page, the toolbar action shows an `N/A` badge and does not inject page DOM.

Because matching uses exact host names, a guide covers only the specific domains listed for each app. Many popular sites serve the same interface from multiple country- or language-specific domains (such as regional top-level domains or localized subdomains); those variants are only supported when their exact host is listed. This is the current state for now. For decentralized or self-hosted platforms, guides cover the flagship instance only: Mastodon matches `mastodon.social` (other servers have their own hostnames), WordPress matches `wordpress.com` (self-hosted WordPress sites run under arbitrary domains), and Wikipedia matches `en.wikipedia.org` (other language editions run on their own subdomains). Wikipedia's shortcuts are browser access keys, so their modifier varies by browser; the listed bindings use the Firefox/Edge convention (`Alt+Shift` on Windows and Linux, `Ctrl+Option` on Mac).

## Load temporarily in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Choose this directory's `manifest.json`.
4. Open a supported HTTPS site, then click the extension toolbar button.
5. Click again to close the overlay. The default shortcut is `Alt+Shift+K` when Firefox has assigned it.

Firefox may leave a suggested command unassigned when it conflicts with another shortcut. The toolbar action remains available. Change or assign it through `about:addons` → gear menu → **Manage Extension Shortcuts**; do not add a page-level keydown handler as a workaround.

## Structure

```text
manifest.json              Firefox MV3 declaration
src/background.js          URL resolution, data validation, action lifecycle
src/content.js             Versioned message adapter and overlay lifecycle
src/overlay-ui.js          Shadow-DOM dialog implementation
data/shortcuts.json        Packaged, validated shortcut guides
```

`src/overlay-ui.js` is injected before `src/content.js`. Its only public contract is `globalThis.WebAppShortcutsOverlayUI.create()`, which returns a controller with `open`, `close`, `isOpen`, `focus`, and `destroy` methods.

## Maintaining shortcut data

`background.js` validates the complete dataset before any injection. Invalid IDs, unsafe source URLs, duplicate identifiers, invalid platform bindings, malformed shortcut sequences, and ambiguous cross-app site rules fail closed. User-visible fields are rendered as text nodes by the Shadow-DOM UI; data must remain plain JSON and source links must use HTTPS.

If you would like an unsupported web app to be included, please open an issue or submit a pull request. Every shortcut entry must cite a source—official documentation is preferred. In some cases, well-backed community sources for very popular web apps may also be acceptable.
