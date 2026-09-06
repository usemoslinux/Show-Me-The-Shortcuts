(() => {
  "use strict";

  const PROTOCOL_VERSION = 1;
  const DATA_URL = "data/shortcuts.json";
  const DEFAULT_ACTION_TITLE = "Show shortcuts for this app";
  const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const PLATFORMS = new Set(["all", "windows", "mac", "linux"]);
  let datasetPromise = null;

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

  function hasUniqueIds(items) {
    const ids = new Set();
    return items.every((item) => {
      if (!isPlainObject(item) || !isId(item.id) || ids.has(item.id)) {
        return false;
      }
      ids.add(item.id);
      return true;
    });
  }

  function isValidBinding(binding) {
    if (!isPlainObject(binding) || !Array.isArray(binding.platforms) || binding.platforms.length === 0) {
      return false;
    }
    const platforms = new Set(binding.platforms);
    if (platforms.size !== binding.platforms.length || [...platforms].some((platform) => !PLATFORMS.has(platform))) {
      return false;
    }
    if (platforms.has("all") && platforms.size !== 1) {
      return false;
    }
    return Array.isArray(binding.sequence) && binding.sequence.length > 0 && binding.sequence.every(
      (chord) => Array.isArray(chord) && chord.length > 0 && chord.every(isNonEmptyString),
    );
  }

  function isValidShortcut(shortcut) {
    return isPlainObject(shortcut)
      && isId(shortcut.id)
      && isNonEmptyString(shortcut.description)
      && Array.isArray(shortcut.bindings)
      && shortcut.bindings.length > 0
      && shortcut.bindings.every(isValidBinding)
      && (shortcut.availability === undefined || isNonEmptyString(shortcut.availability));
  }

  function isValidGroup(group) {
    return isPlainObject(group)
      && isId(group.id)
      && isNonEmptyString(group.label)
      && Array.isArray(group.shortcuts)
      && group.shortcuts.length > 0
      && hasUniqueIds(group.shortcuts)
      && group.shortcuts.every(isValidShortcut);
  }

  function isValidSite(site) {
    return isPlainObject(site)
      && isNonEmptyString(site.hostname)
      && site.hostname === site.hostname.toLowerCase()
      && !site.hostname.includes("/")
      && Array.isArray(site.pathPrefixes)
      && site.pathPrefixes.every((prefix) => typeof prefix === "string" && prefix.startsWith("/"));
  }

  function pathRulesOverlap(first, second) {
    if (first.length === 0 || second.length === 0) {
      return true;
    }
    return first.some((firstPrefix) => second.some(
      (secondPrefix) => firstPrefix.startsWith(secondPrefix) || secondPrefix.startsWith(firstPrefix),
    ));
  }

  function hasAmbiguousSiteRules(apps) {
    for (let leftIndex = 0; leftIndex < apps.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < apps.length; rightIndex += 1) {
        for (const leftSite of apps[leftIndex].sites) {
          for (const rightSite of apps[rightIndex].sites) {
            if (leftSite.hostname === rightSite.hostname
              && pathRulesOverlap(leftSite.pathPrefixes, rightSite.pathPrefixes)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  function validateDataset(dataset) {
    if (!isPlainObject(dataset) || dataset.schemaVersion !== 1 || !Array.isArray(dataset.apps)
      || dataset.apps.length === 0 || !hasUniqueIds(dataset.apps)) {
      return null;
    }

    const valid = dataset.apps.every((app) => isPlainObject(app)
      && isId(app.id)
      && isNonEmptyString(app.name)
      && isNonEmptyString(app.category)
      && (app.triggerOnClick === undefined || typeof app.triggerOnClick === "boolean")
      && Array.isArray(app.sites)
      && app.sites.length > 0
      && app.sites.every(isValidSite)
      && isPlainObject(app.source)
      && isNonEmptyString(app.source.label)
      && isHttpsUrl(app.source.url)
      && typeof app.source.official === "boolean"
      && isNonEmptyString(app.source.verifiedOn)
      && Array.isArray(app.groups)
      && app.groups.length > 0
      && hasUniqueIds(app.groups)
      && app.groups.every(isValidGroup));

    return valid && !hasAmbiguousSiteRules(dataset.apps) ? dataset : null;
  }

  function resolveApp(urlString, dataset) {
    if (!isPlainObject(dataset) || !Array.isArray(dataset.apps)) {
      return null;
    }
    let url;
    try {
      url = new URL(urlString);
    } catch {
      return null;
    }
    if (url.protocol !== "https:") {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    const matchedIds = new Set();
    for (const app of dataset.apps) {
      if (!isPlainObject(app) || !isId(app.id) || !Array.isArray(app.sites)) {
        return null;
      }
      for (const site of app.sites) {
        if (!isValidSite(site) || site.hostname !== hostname) {
          continue;
        }
        if (site.pathPrefixes.length === 0 || site.pathPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
          matchedIds.add(app.id);
        }
      }
    }
    return matchedIds.size === 1 ? { appId: [...matchedIds][0] } : null;
  }

  function toViewModel(app) {
    return {
      app: {
        id: app.id,
        name: app.name,
        category: app.category,
        triggerOnClick: app.triggerOnClick !== false,
        source: {
          label: app.source.label,
          url: app.source.url,
          official: app.source.official,
        },
      },
      groups: app.groups.map((group) => ({
        id: group.id,
        label: group.label,
        shortcuts: group.shortcuts.map((shortcut) => ({
          id: shortcut.id,
          description: shortcut.description,
          bindings: shortcut.bindings.map((binding) => ({
            platforms: [...binding.platforms],
            sequence: binding.sequence.map((chord) => [...chord]),
          })),
          ...(shortcut.availability ? { availability: shortcut.availability } : {}),
        })),
      })),
    };
  }

  function loadDataset() {
    if (!datasetPromise) {
      datasetPromise = fetch(browser.runtime.getURL(DATA_URL))
        .then((response) => {
          if (!response.ok) {
            throw new Error("SHORTCUT_DATA_FETCH_FAILED");
          }
          return response.json();
        })
        .then((dataset) => {
          const validatedDataset = validateDataset(dataset);
          if (!validatedDataset) {
            throw new Error("SHORTCUT_DATA_INVALID");
          }
          return validatedDataset;
        });
    }
    return datasetPromise;
  }

  function requestId() {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  async function setActionFeedback(tabId, text, title) {
    if (!Number.isInteger(tabId)) {
      return;
    }
    await Promise.allSettled([
      browser.action.setBadgeText({ tabId, text }),
      browser.action.setTitle({ tabId, title }),
    ]);
  }

  function isMissingReceiverError(error) {
    return typeof error?.message === "string" && /Receiving end does not exist|Could not establish connection/i.test(error.message);
  }

  async function sendToTopFrame(tabId, message) {
    return browser.tabs.sendMessage(tabId, message, { frameId: 0 });
  }

  async function dismissStaleOverlay(tabId) {
    try {
      await sendToTopFrame(tabId, {
        type: "OVERLAY_DISMISS",
        version: PROTOCOL_VERSION,
        requestId: requestId(),
      });
    } catch {
      // No injected receiver is normal on unsupported or restricted documents.
    }
  }

  async function handleAction(tab) {
    const tabId = tab?.id;
    if (!Number.isInteger(tabId) || !tab?.url) {
      return;
    }

    let dataset;
    try {
      dataset = await loadDataset();
    } catch {
      await setActionFeedback(tabId, "ERR", "Shortcut data unavailable");
      return;
    }

    const appResolution = resolveApp(tab.url, dataset);
    if (!appResolution) {
      await dismissStaleOverlay(tabId);
      await setActionFeedback(tabId, "N/A", "No shortcut guide for this page");
      return;
    }

    let currentTab;
    try {
      currentTab = await browser.tabs.get(tabId);
    } catch {
      return;
    }
    const currentResolution = resolveApp(currentTab?.url, dataset);
    if (currentResolution?.appId !== appResolution.appId) {
      await dismissStaleOverlay(tabId);
      await setActionFeedback(tabId, "N/A", "No shortcut guide for this page");
      return;
    }

    const app = dataset.apps.find((candidate) => candidate.id === currentResolution.appId);
    if (!app) {
      await setActionFeedback(tabId, "ERR", "Shortcut data unavailable");
      return;
    }

    const message = {
      type: "OVERLAY_TOGGLE",
      version: PROTOCOL_VERSION,
      requestId: requestId(),
      siteRules: app.sites.map((site) => ({
        hostname: site.hostname,
        pathPrefixes: [...site.pathPrefixes],
      })),
      viewModel: toViewModel(app),
    };

    try {
      await browser.scripting.executeScript({
        target: { tabId, allFrames: false },
        files: ["src/overlay-ui.js", "src/content.js"],
      });
      const postInjectionTab = await browser.tabs.get(tabId);
      const postInjectionResolution = resolveApp(postInjectionTab?.url, dataset);
      if (postInjectionResolution?.appId !== appResolution.appId) {
        await dismissStaleOverlay(tabId);
        await setActionFeedback(tabId, "N/A", "No shortcut guide for this page");
        return;
      }
      const response = await sendToTopFrame(tabId, message);
      if (!response?.ok || response.requestId !== message.requestId) {
        await setActionFeedback(tabId, "ERR", "Unable to show shortcuts");
        return;
      }
      await setActionFeedback(tabId, "", DEFAULT_ACTION_TITLE);
    } catch (error) {
      if (isMissingReceiverError(error)) {
        try {
          await browser.scripting.executeScript({
            target: { tabId, allFrames: false },
            files: ["src/overlay-ui.js", "src/content.js"],
          });
          const retryPostInjectionTab = await browser.tabs.get(tabId);
          const retryPostInjectionResolution = resolveApp(retryPostInjectionTab?.url, dataset);
          if (retryPostInjectionResolution?.appId !== appResolution.appId) {
            await dismissStaleOverlay(tabId);
            await setActionFeedback(tabId, "N/A", "No shortcut guide for this page");
            return;
          }
          const response = await sendToTopFrame(tabId, message);
          if (response?.ok && response.requestId === message.requestId) {
            await setActionFeedback(tabId, "", DEFAULT_ACTION_TITLE);
            return;
          }
        } catch {
          // A navigation or protected-page race is intentionally silent.
        }
      }
      await setActionFeedback(tabId, "N/A", "Shortcut guide unavailable on this page");
    }
  }

  globalThis.WebAppShortcutsOverlayBackground = Object.freeze({
    resolveApp,
    validateDataset,
  });

  browser.action.onClicked.addListener(handleAction);
})();
