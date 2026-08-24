// ==========================================
// UPDATE CHECKER
// ==========================================

const UPDATER_CONFIG = {
  repoRawUrl: "https://raw.githubusercontent.com/doltonsedward/productive-tab-extension/main/manifest.json",
  checkIntervalMs: 12 * 60 * 60 * 1000, // 12 hours
  storageKeys: {
    lastCheck: "updater_lastCheck",
    remoteVersion: "updater_remoteVersion",
    hasUpdate: "updater_hasUpdate",
  },
};

function compareVersions(local, remote) {
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
    const res = await fetch(UPDATER_CONFIG.repoRawUrl + "?t=" + Date.now(), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.version || null;
  } catch {
    return null;
  }
}

async function checkForUpdates() {
  const keys = UPDATER_CONFIG.storageKeys;
  const now = Date.now();
  const lastCheck = parseInt(localStorage.getItem(keys.lastCheck) || "0", 10);

  if (now - lastCheck < UPDATER_CONFIG.checkIntervalMs) {
    // Use cached result
    const hasUpdate = localStorage.getItem(keys.hasUpdate) === "true";
    if (hasUpdate) {
      const remoteVersion = localStorage.getItem(keys.remoteVersion);
      showUpdateIndicator(remoteVersion);
    }
    return;
  }

  const remoteVersion = await fetchRemoteVersion();
  localStorage.setItem(keys.lastCheck, String(now));

  if (!remoteVersion) return;

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
  // Read from the version element in settings footer if available
  const el = document.getElementById("settingsVersionText");
  if (el && el.dataset.version) return el.dataset.version;
  return "1.0";
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
  if (fab) fab.classList.remove("has-update");

  const banner = document.getElementById("updateBanner");
  if (banner) banner.classList.add("hidden");
}

function initUpdater() {
  // Check for updates automatically in the background
  setTimeout(checkForUpdates, 3000);
}
