// ==========================================
// UPDATE CHECKER
// ==========================================

const UPDATER_CONFIG = {
  repoRawUrl: "https://raw.githubusercontent.com/doltonsedward/productive-tab-extension/main/manifest.json",
  checkIntervalMs: 15 * 60 * 1000, // 15 minutes (fast & responsive)
  storageKeys: {
    lastCheck: "updater_lastCheck",
    remoteVersion: "updater_remoteVersion",
    hasUpdate: "updater_hasUpdate",
  },
};

function compareVersions(local, remote) {
  if (!local || !remote) return false;
  const parse = (v) => String(v).split(".").map(Number);
  const [lParts, rParts] = [parse(local), parse(remote)];
  const len = Math.max(lParts.length, rParts.length);
  for (let i = 0; i < len; i++) {
    const l = lParts[i] || 0;
    const r = rParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

async function fetchRemoteVersion() {
  try {
    const cacheBuster = `?t=${Date.now()}&_r=${Math.random().toString(36).substring(7)}`;
    const res = await fetch(UPDATER_CONFIG.repoRawUrl + cacheBuster, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.version || null;
  } catch {
    return null;
  }
}

async function checkForUpdates(force = false) {
  const keys = UPDATER_CONFIG.storageKeys;
  const now = Date.now();
  const lastCheck = parseInt(localStorage.getItem(keys.lastCheck) || "0", 10);

  if (!force && now - lastCheck < UPDATER_CONFIG.checkIntervalMs) {
    // Use cached result
    const hasUpdate = localStorage.getItem(keys.hasUpdate) === "true";
    if (hasUpdate) {
      const remoteVersion = localStorage.getItem(keys.remoteVersion);
      showUpdateIndicator(remoteVersion);
    }
    return;
  }

  const remoteVersion = await fetchRemoteVersion();
  if (!remoteVersion) return;

  // Only record lastCheck timestamp if fetch succeeded
  localStorage.setItem(keys.lastCheck, String(now));

  const localVersion = getLocalVersion();
  const hasUpdate = compareVersions(localVersion, remoteVersion);

  localStorage.setItem(keys.remoteVersion, remoteVersion);
  localStorage.setItem(keys.hasUpdate, String(hasUpdate));

  if (hasUpdate) {
    showUpdateIndicator(remoteVersion);
  } else {
    clearUpdateIndicator();
  }
}

function getLocalVersion() {
  // Check changelog dataset or DOM attribute for immediate sync
  if (typeof CHANGELOG_DATA !== "undefined" && Array.isArray(CHANGELOG_DATA) && CHANGELOG_DATA.length > 0 && CHANGELOG_DATA[0].version) {
    return CHANGELOG_DATA[0].version;
  }
  const el = document.getElementById("settingsVersionText");
  if (el && el.dataset.version) return el.dataset.version;
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) {
    const m = chrome.runtime.getManifest();
    if (m && m.version) return m.version;
  }
  return "1.15.0";
}

function renderVersionText() {
  const el = document.getElementById("settingsVersionText");
  if (el) {
    const version = getLocalVersion();
    el.textContent = `Productive Tab · v${version}`;
    el.dataset.version = version;
  }
}

function showUpdateIndicator(remoteVersion) {
  const fab = document.getElementById("toggleSettingsBtn");
  if (fab) fab.classList.add("has-update");

  const banner = document.getElementById("updateBanner");
  if (banner) {
    banner.classList.remove("hidden");
    const versionEl = banner.querySelector(".update-banner-version");
    if (versionEl && remoteVersion) versionEl.textContent = `v${remoteVersion}`;
  }
}

function clearUpdateIndicator() {
  const fab = document.getElementById("toggleSettingsBtn");
  const openChangelogBtn = document.getElementById("openChangelogBtn");
  const hasUnreadChangelog = openChangelogBtn && openChangelogBtn.classList.contains("has-unread-dot");
  if (fab && !hasUnreadChangelog) fab.classList.remove("has-update");

  const banner = document.getElementById("updateBanner");
  if (banner) banner.classList.add("hidden");
}

function initUpdater() {
  // Render current local version on settings footer
  renderVersionText();

  // Instant cached check if previous update was already detected
  const cachedHasUpdate = localStorage.getItem(UPDATER_CONFIG.storageKeys.hasUpdate) === "true";
  if (cachedHasUpdate) {
    showUpdateIndicator(localStorage.getItem(UPDATER_CONFIG.storageKeys.remoteVersion));
  }

  // Check for updates in the background shortly after load
  setTimeout(() => checkForUpdates(), 500);
}
