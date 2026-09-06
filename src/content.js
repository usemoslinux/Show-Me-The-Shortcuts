(() => {
  "use strict";

  const STATE_KEY = "__WEBAPP_SHORTCUTS_CONTENT_V1__";
  const PROTOCOL_VERSION = 1;
  const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const PLATFORMS = new Set(["all", "windows", "mac", "linux"]);

  if (globalThis[STATE_KEY]) {
    return;
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function isId(value) {
    return typeof value === "string" && ID_PATTERN.test(value);
  }

  function isHttpsUrl(value) {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }

  function isValidBinding(binding) {
    if (!isPlainObject(binding) || !Array.isArray(binding.platforms) || binding.platforms.length === 0
      || !Array.isArray(binding.sequence) || binding.sequence.length === 0) {
      return false;
    }
    const platforms = new Set(binding.platforms);
    return platforms.size === binding.platforms.length
      && [...platforms].every((platform) => PLATFORMS.has(platform))
      && !(platforms.has("all") && platforms.size > 1)
      && binding.sequence.every((chord) => Array.isArray(chord) && chord.length > 0
        && chord.every(isNonEmptyString));
  }

  function isValidViewModel(viewModel) {
    if (!isPlainObject(viewModel) || !isPlainObject(viewModel.app) || !Array.isArray(viewModel.groups)) {
      return false;
    }
    const { app } = viewModel;
    if (!isId(app.id) || !isNonEmptyString(app.name) || !isNonEmptyString(app.category)
      || (app.triggerOnClick !== undefined && typeof app.triggerOnClick !== "boolean")
      || !isPlainObject(app.source) || !isNonEmptyString(app.source.label)
      || !isHttpsUrl(app.source.url) || typeof app.source.official !== "boolean") {
      return false;
    }
    return viewModel.groups.length > 0 && viewModel.groups.every((group) => isPlainObject(group)
      && isId(group.id)
      && isNonEmptyString(group.label)
      && Array.isArray(group.shortcuts)
      && group.shortcuts.length > 0
      && group.shortcuts.every((shortcut) => isPlainObject(shortcut)
        && isId(shortcut.id)
        && isNonEmptyString(shortcut.description)
        && Array.isArray(shortcut.bindings)
        && shortcut.bindings.length > 0
        && shortcut.bindings.every(isValidBinding)
        && (shortcut.availability === undefined || isNonEmptyString(shortcut.availability))));
  }

  function isValidSiteRule(siteRule) {
    return isPlainObject(siteRule)
      && isNonEmptyString(siteRule.hostname)
      && siteRule.hostname === siteRule.hostname.toLowerCase()
      && !siteRule.hostname.includes("/")
      && Array.isArray(siteRule.pathPrefixes)
      && siteRule.pathPrefixes.every((prefix) => typeof prefix === "string" && prefix.startsWith("/"));
  }

  function isCurrentDocumentForRules(siteRules) {
    if (!Array.isArray(siteRules) || siteRules.length === 0 || !siteRules.every(isValidSiteRule)) {
      return false;
    }
    let currentUrl;
    try {
      currentUrl = new URL(location.href);
    } catch {
      return false;
    }
    if (currentUrl.protocol !== "https:") {
      return false;
    }
    const hostname = currentUrl.hostname.toLowerCase();
    return siteRules.some((siteRule) => siteRule.hostname === hostname
      && (siteRule.pathPrefixes.length === 0
        || siteRule.pathPrefixes.some((prefix) => currentUrl.pathname.startsWith(prefix))));
  }

  function validEnvelope(message) {
    return isPlainObject(message)
      && message.version === PROTOCOL_VERSION
      && isNonEmptyString(message.requestId)
      && (message.type === "OVERLAY_TOGGLE" || message.type === "OVERLAY_DISMISS" || message.type === "OVERLAY_PING");
  }

  const state = { controller: null };
  globalThis[STATE_KEY] = state;

  function response(requestId, stateName) {
    return { ok: true, requestId, state: stateName };
  }

  function error(requestId, code) {
    return { ok: false, requestId, code };
  }

  // Firefox delivers a runtime message response only when the listener returns
  // a Promise or calls sendResponse(). Every branch below returns its typed
  // result through this async listener's Promise.
  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (sender.id !== browser.runtime.id || !validEnvelope(message)) {
      return error(message?.requestId, "INVALID_MESSAGE");
    }

    if (message.type === "OVERLAY_PING") {
      return response(message.requestId, "ready");
    }

    if (message.type === "OVERLAY_DISMISS") {
      if (!state.controller || !state.controller.isOpen()) {
        return response(message.requestId, "already-closed");
      }
      try {
        state.controller.close("dismiss");
        return response(message.requestId, "closed");
      } catch {
        return error(message.requestId, "UI_ERROR");
      }
    }

    if (!isValidViewModel(message.viewModel)) {
      return error(message.requestId, "INVALID_DATA");
    }

    // Read location.href synchronously before creating or opening the UI. This
    // closes the remaining race if a same-document route change follows the
    // background's post-injection tab check.
    if (!isCurrentDocumentForRules(message.siteRules)) {
      if (state.controller?.isOpen()) {
        try {
          state.controller.close("dismiss");
        } catch {
          return error(message.requestId, "UI_ERROR");
        }
      }
      return error(message.requestId, "INVALID_DATA");
    }

    try {
      if (!state.controller) {
        const factory = globalThis.WebAppShortcutsOverlayUI;
        if (!factory || typeof factory.create !== "function") {
          return error(message.requestId, "UI_ERROR");
        }
        state.controller = factory.create();
      }
      if (state.controller.isOpen()) {
        state.controller.close("toggle");
        return response(message.requestId, "closed");
      }
      state.controller.open(message.viewModel);
      return response(message.requestId, "opened");
    } catch {
      return error(message.requestId, "UI_ERROR");
    }
  });
})();
