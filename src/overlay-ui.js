(() => {
  "use strict";

  if (globalThis.WebAppShortcutsOverlayUI) return;

  const STYLE_TEXT = `
    :host {
      all: initial;
      display: block !important;
      visibility: visible !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      inline-size: auto !important;
      block-size: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      opacity: 1 !important;
      transform: none !important;
    }
    *, *::before, *::after { box-sizing: border-box; }
    .waso-backdrop {
      --waso-bg: #ffffff; --waso-surface: #f6f7f9; --waso-text: #18212f;
      --waso-muted: #5b6574; --waso-border: #d4d9e1; --waso-accent: #0969da;
      position: fixed; z-index: 2147483647; inset: 0; display: grid; pointer-events: auto;
      place-items: center; padding: clamp(12px, 3vw, 32px); color: var(--waso-text);
      background: rgb(13 20 33 / 62%); font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 16px; line-height: 1.45; isolation: isolate;
    }
    .waso-panel { display: flex; flex-direction: column; inline-size: min(720px, 100%); max-block-size: min(760px, 100%); overflow: hidden; background: var(--waso-bg); border: 1px solid var(--waso-border); border-radius: 14px; box-shadow: 0 18px 60px rgb(0 0 0 / 35%); }
    .waso-header { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; padding: 20px 20px 14px; border-block-end: 1px solid var(--waso-border); }
    .waso-eyebrow { margin: 0 0 3px; color: var(--waso-muted); font-size: .83rem; font-weight: 650; letter-spacing: .025em; }
    .waso-title { margin: 0; font-size: clamp(1.22rem, 2.8vw, 1.6rem); line-height: 1.2; }
    .waso-close { appearance: none; border: 1px solid var(--waso-border); border-radius: 8px; min-inline-size: 2.45rem; min-block-size: 2.45rem; padding: 0 10px; color: var(--waso-text); background: var(--waso-bg); font: inherit; font-weight: 650; cursor: pointer; }
    .waso-close:hover { background: var(--waso-surface); }
    .waso-close:focus-visible, .waso-search:focus-visible, .waso-source:focus-visible { outline: 3px solid #5aa5ef; outline-offset: 2px; }
    .waso-tools { padding: 14px 20px; border-block-end: 1px solid var(--waso-border); }
    .waso-search { display: block; inline-size: 100%; min-block-size: 2.6rem; padding: .55rem .72rem; border: 1px solid var(--waso-border); border-radius: 8px; color: var(--waso-text); background: var(--waso-bg); font: inherit; }
    .waso-content { overflow: auto; overscroll-behavior: contain; padding: 8px 20px 20px; }
    .waso-group { padding-block: 14px; border-block-end: 1px solid var(--waso-border); }
    .waso-group:last-child { border-block-end: 0; }
    .waso-group-title { margin: 0 0 8px; font-size: 1rem; }
    .waso-list { list-style: none; margin: 0; padding: 0; }
    .waso-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px 18px; align-items: center; padding: 10px 0; }
    .waso-row + .waso-row { border-block-start: 1px solid color-mix(in srgb, var(--waso-border) 70%, transparent); }
    .waso-description { margin: 0; font-weight: 600; }
    .waso-availability { grid-column: 1 / -1; margin: -2px 0 0; color: var(--waso-muted); font-size: .86rem; }
    .waso-bindings { display: flex; flex-wrap: wrap; justify-content: end; gap: 6px; }
    .waso-binding { display: inline-flex; align-items: center; gap: 4px; color: var(--waso-muted); font-size: .9rem; }
    .waso-chord { display: inline-flex; gap: 3px; align-items: center; }
    kbd.waso-key { display: inline-block; min-inline-size: 1.6em; padding: .12em .38em; border: 1px solid #abb4c0; border-radius: 5px; color: var(--waso-text); background: #fff; box-shadow: inset 0 -1px 0 #d9dde3; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .86em; text-align: center; }
    .waso-separator { color: var(--waso-muted); }
    .waso-empty { margin: 24px 0; padding: 18px; border: 1px dashed var(--waso-border); border-radius: 8px; color: var(--waso-muted); text-align: center; }
    .waso-footer { padding: 12px 20px 18px; border-block-start: 1px solid var(--waso-border); color: var(--waso-muted); font-size: .88rem; }
    .waso-source { color: var(--waso-accent); }
    @media (max-width: 480px) { .waso-backdrop { padding: 8px; } .waso-header { padding: 16px 16px 12px; } .waso-tools, .waso-footer { padding-inline: 16px; } .waso-content { padding-inline: 16px; } .waso-row { grid-template-columns: 1fr; gap: 6px; } .waso-bindings { justify-content: start; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
    @media (forced-colors: active) { .waso-backdrop { background: Canvas; } .waso-panel, .waso-search, .waso-close, kbd.waso-key { border-color: CanvasText; } }
  `;

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function normalize(value) { return String(value || "").toLocaleLowerCase(); }

  function isFocusable(element) {
    return element && element.isConnected && !element.disabled && typeof element.focus === "function";
  }

  function safeHttpsUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url : null;
    } catch (_) {
      return null;
    }
  }

  function hardenHost(host) {
    const priority = "important";
    host.style.setProperty("display", "block", priority);
    host.style.setProperty("visibility", "visible", priority);
    host.style.setProperty("position", "fixed", priority);
    host.style.setProperty("inset", "0", priority);
    host.style.setProperty("z-index", "2147483647", priority);
    host.style.setProperty("pointer-events", "none", priority);
    host.style.setProperty("inline-size", "auto", priority);
    host.style.setProperty("block-size", "auto", priority);
    host.style.setProperty("margin", "0", priority);
    host.style.setProperty("padding", "0", priority);
    host.style.setProperty("border", "0", priority);
    host.style.setProperty("opacity", "1", priority);
    host.style.setProperty("transform", "none", priority);
  }

  function create() {
    let host = null;
    let shadow = null;
    let previousFocus = null;
    let keydownListener = null;
    let viewModel = null;

    function clearHost() {
      if (keydownListener) document.removeEventListener("keydown", keydownListener, true);
      keydownListener = null;
      if (host) host.remove();
      host = null;
      shadow = null;
      viewModel = null;
    }

    function restoreFocus() {
      if (isFocusable(previousFocus)) previousFocus.focus();
      else if (document.body && document.body.isConnected && typeof document.body.focus === "function") document.body.focus();
      previousFocus = null;
    }

    function isOpen() { return Boolean(host && host.isConnected); }

    function renderBinding(binding) {
      const bindingNode = createElement("span", "waso-binding");
      (binding.sequence || []).forEach((chord, chordIndex) => {
        if (chordIndex) bindingNode.append(createElement("span", "waso-separator", " then "));
        const chordNode = createElement("span", "waso-chord");
        (chord || []).forEach((token, tokenIndex) => {
          if (tokenIndex) chordNode.append(createElement("span", "waso-separator", "+"));
          chordNode.append(createElement("kbd", "waso-key", token));
        });
        bindingNode.append(chordNode);
      });
      return bindingNode;
    }

    function renderGroups(container, query) {
      const normalizedQuery = normalize(query);
      let matchCount = 0;
      for (const group of viewModel.groups || []) {
        const groupNode = createElement("section", "waso-group");
        const groupTitle = createElement("h2", "waso-group-title", group.label || "Shortcuts");
        groupNode.append(groupTitle);
        const list = createElement("ul", "waso-list");
        let groupMatches = 0;
        for (const shortcut of group.shortcuts || []) {
          const terms = [viewModel.app && viewModel.app.name, group.label, shortcut.description, shortcut.availability];
          for (const binding of shortcut.bindings || []) for (const chord of binding.sequence || []) terms.push(...chord);
          if (normalizedQuery && !terms.some((term) => normalize(term).includes(normalizedQuery))) continue;
          const row = createElement("li", "waso-row");
          row.append(createElement("p", "waso-description", shortcut.description || "Shortcut"));
          const bindings = createElement("div", "waso-bindings");
          bindings.setAttribute("aria-label", "Keyboard shortcut");
          for (const binding of shortcut.bindings || []) bindings.append(renderBinding(binding));
          row.append(bindings);
          if (shortcut.availability) row.append(createElement("p", "waso-availability", shortcut.availability));
          list.append(row); groupMatches += 1; matchCount += 1;
        }
        if (groupMatches) { groupNode.append(list); container.append(groupNode); }
      }
      if (!matchCount) container.append(createElement("p", "waso-empty", "No shortcuts match your search."));
    }

    function trapFocus(event) {
      if (event.key === "Escape") { event.preventDefault(); close("escape"); return; }
      if (event.key !== "Tab" || !shadow) return;
      const focusable = [...shadow.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')]
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && shadow.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && shadow.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    function open(nextViewModel) {
      if (!nextViewModel || !nextViewModel.app || !Array.isArray(nextViewModel.groups)) return;
      if (host && !host.isConnected) clearHost();
      if (isOpen()) clearHost();
      viewModel = nextViewModel;
      previousFocus = document.activeElement;
      host = document.createElement("webapp-shortcuts-overlay");
      host.setAttribute("data-webapp-shortcuts-overlay", "v1");
      hardenHost(host);
      shadow = host.attachShadow({ mode: "open" });
      shadow.append(createElement("style", "", STYLE_TEXT));
      const backdrop = createElement("div", "waso-backdrop");
      const panel = createElement("section", "waso-panel");
      panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true"); panel.setAttribute("aria-labelledby", "waso-title");
      const header = createElement("header", "waso-header");
      const headingWrap = createElement("div");
      headingWrap.append(createElement("p", "waso-eyebrow", viewModel.app.category || "Keyboard shortcuts"));
      const title = createElement("h1", "waso-title", viewModel.app.name || "App"); title.id = "waso-title"; headingWrap.append(title);
      const closeButton = createElement("button", "waso-close", "Close"); closeButton.type = "button"; closeButton.setAttribute("aria-label", "Close shortcuts overlay");
      closeButton.addEventListener("click", () => close("button")); header.append(headingWrap, closeButton);
      const tools = createElement("div", "waso-tools");
      const search = createElement("input", "waso-search"); search.type = "search"; search.placeholder = "Filter shortcuts"; search.setAttribute("aria-label", "Filter shortcuts");
      tools.append(search);
      const content = createElement("main", "waso-content"); renderGroups(content, "");
      search.addEventListener("input", () => { content.replaceChildren(); renderGroups(content, search.value); });
      const footer = createElement("footer", "waso-footer");
      const sourceUrl = viewModel.app.source && safeHttpsUrl(viewModel.app.source.url);
      if (sourceUrl) {
        const source = createElement("a", "waso-source", viewModel.app.source.label || "Shortcut documentation"); source.href = sourceUrl.href; source.target = "_blank"; source.rel = "noopener noreferrer";
        footer.append("Source: ", source);
      }
      panel.append(header, tools, content, footer); backdrop.append(panel);
      backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close("backdrop"); });
      shadow.append(backdrop); document.documentElement.append(host);
      keydownListener = trapFocus; document.addEventListener("keydown", keydownListener, true);
      search.focus();
    }

    function close() { if (!host) return; clearHost(); restoreFocus(); }
    function focus() { const target = shadow && shadow.querySelector(".waso-search, .waso-close"); if (target) target.focus(); }
    function destroy() { close("destroy"); }
    return Object.freeze({ open, close, isOpen, focus, destroy });
  }

  globalThis.WebAppShortcutsOverlayUI = Object.freeze({ create });
})();
