// ==========================================
// APP SETTINGS & SIDE DRAWER MODULE
// ==========================================

function initSettings() {
  appSettings = loadSettings();
  applyBackgroundSettings();
  applyWorkspaceLayout();
}

function applyBackgroundSettings() {
  const instantStyle = document.getElementById("instantBgStyle");
  if (instantStyle) instantStyle.remove();

  const type = appSettings.bgType || "default";
  const val = appSettings.bgVal || "";
  const dim = appSettings.bgDim !== undefined ? appSettings.bgDim : 40;
  const blur = appSettings.bgBlur !== undefined ? appSettings.bgBlur : 0;

  if (type === "preset" && BG_PRESETS[val]) {
    if (val === "dark") {
      document.body.style.background = "#0d1117";
    } else {
      document.body.style.background = `#181c24 url("${BG_PRESETS[val]}") no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";
    }
  } else if ((type === "url" || type === "custom") && val) {
    document.body.style.background = `#181c24 url("${val}") no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
  } else {
    document.body.style.background = `#181c24 url("background/default.png") no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
  }

  const overlay = document.querySelector(".background-overlay");
  if (overlay) {
    const dimAlpha = (dim / 100).toFixed(2);
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${dimAlpha})`;
    overlay.style.backdropFilter = blur > 0 ? `blur(${blur}px)` : "none";
    overlay.style.webkitBackdropFilter = blur > 0 ? `blur(${blur}px)` : "none";
  }
}

function applyWorkspaceLayout() {
  const workspace = document.getElementById("workspaceLayout");
  if (!workspace) return;
  const leftCount = appSettings.widgetSlots?.left?.length || 0;
  const rightCount = appSettings.widgetSlots?.right?.length || 0;
  const hasWidgets = (leftCount + rightCount) > 0;
  workspace.classList.toggle("has-widgets", hasWidgets);
}

function openSettingsDrawer() {
  const drawer = document.getElementById("settingsDrawer");
  const backdrop = document.getElementById("settingsBackdrop");
  const fab = document.getElementById("toggleSettingsBtn");
  if (drawer) drawer.classList.add("open");
  if (backdrop) backdrop.classList.add("visible");
  if (fab) fab.classList.add("active");
  syncSettingsUI();
}

function closeSettingsDrawer() {
  const drawer = document.getElementById("settingsDrawer");
  const backdrop = document.getElementById("settingsBackdrop");
  const fab = document.getElementById("toggleSettingsBtn");
  if (drawer) drawer.classList.remove("open");
  if (backdrop) backdrop.classList.remove("visible");
  if (fab) fab.classList.remove("active");
}

function syncSettingsUI() {
  const nameInput = document.getElementById("settingName");
  if (nameInput) nameInput.value = appSettings.name || "";

  document.querySelectorAll("[data-clock]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.clock === appSettings.clockFormat);
  });

  const showSecondsEl = document.getElementById("settingShowSeconds");
  if (showSecondsEl) showSecondsEl.checked = !!appSettings.showSeconds;

  const showDateEl = document.getElementById("settingShowDate");
  if (showDateEl) showDateEl.checked = appSettings.showDate !== false;

  document.querySelectorAll("[data-bg]").forEach(btn => {
    const isSel = (appSettings.bgType === "preset" || appSettings.bgType === "default") && (appSettings.bgVal || "default") === btn.dataset.bg;
    btn.classList.toggle("active", isSel);
  });

  const bgUrlInput = document.getElementById("bgUrlInput");
  if (bgUrlInput) {
    bgUrlInput.value = appSettings.bgType === "url" ? appSettings.bgVal || "" : "";
  }

  const bgDimSlider = document.getElementById("bgDimSlider");
  const bgDimVal = document.getElementById("bgDimVal");
  if (bgDimSlider && bgDimVal) {
    bgDimSlider.value = appSettings.bgDim !== undefined ? appSettings.bgDim : 40;
    bgDimVal.textContent = `${bgDimSlider.value}%`;
  }

  const bgBlurSlider = document.getElementById("bgBlurSlider");
  const bgBlurVal = document.getElementById("bgBlurVal");
  if (bgBlurSlider && bgBlurVal) {
    bgBlurSlider.value = appSettings.bgBlur !== undefined ? appSettings.bgBlur : 0;
    bgBlurVal.textContent = `${bgBlurSlider.value}px`;
  }

  renderSettingsWidgetList();
}

function renderSettingsWidgetList() {
  const list = document.getElementById("settingsWidgetList");
  if (!list) return;

  const leftActive = appSettings?.widgetSlots?.left || [];
  const rightActive = appSettings?.widgetSlots?.right || [];
  const total = leftActive.length + rightActive.length;

  if (total === 0) {
    list.innerHTML = `<p class="settings-hint" style="margin:0;">No active widgets. Click the "+" button on the main screen to add one.</p>`;
    return;
  }

  let html = "";

  html += `<div style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.4); margin-bottom:6px;">LEFT COLUMN (${leftActive.length}/2)</div>`;
  if (leftActive.length === 0) {
    html += `<div class="settings-hint" style="margin-bottom:8px;">(Empty)</div>`;
  } else {
    leftActive.forEach(id => {
      const def = WIDGET_REGISTRY[id];
      if (!def) return;
      html += `
        <div class="settings-widget-item">
          <span class="settings-widget-item-icon">${def.icon}</span>
          <span class="settings-widget-item-name">${def.name}</span>
          <button class="settings-widget-item-remove" data-remove-widget="${id}" title="Remove widget">✕</button>
        </div>
      `;
    });
  }

  html += `<div style="font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.4); margin-top:12px; margin-bottom:6px;">RIGHT COLUMN (${rightActive.length}/2)</div>`;
  if (rightActive.length === 0) {
    html += `<div class="settings-hint" style="margin-bottom:8px;">(Empty)</div>`;
  } else {
    rightActive.forEach(id => {
      const def = WIDGET_REGISTRY[id];
      if (!def) return;
      html += `
        <div class="settings-widget-item">
          <span class="settings-widget-item-icon">${def.icon}</span>
          <span class="settings-widget-item-name">${def.name}</span>
          <button class="settings-widget-item-remove" data-remove-widget="${id}" title="Remove widget">✕</button>
        </div>
      `;
    });
  }

  list.innerHTML = html;

  list.querySelectorAll("[data-remove-widget]").forEach(btn => {
    btn.addEventListener("click", () => removeWidget(btn.dataset.removeWidget));
  });
}

function initSettingsDrawer() {
  try {
    bindSettingsControls();
  } catch (e) {
    console.error("Error binding settings controls:", e);
  }
  try {
    syncSettingsUI();
  } catch (e) {
    console.error("Error syncing settings UI:", e);
  }
  try {
    initWelcomeOnboarding();
  } catch (e) {
    console.error("Error initializing welcome onboarding:", e);
  }
}

function initWelcomeOnboarding() {
  const modal = document.getElementById("welcomeModal");
  const input = document.getElementById("welcomeNameInput");
  const saveBtn = document.getElementById("saveWelcomeNameBtn");
  const skipBtn = document.getElementById("skipWelcomeBtn");

  if (!modal) return;

  const hasSeenPrompt = localStorage.getItem("hasSeenWelcomePrompt");
  const hasName = appSettings && appSettings.name && appSettings.name.trim().length > 0;

  // Show onboarding prompt only on first run when name is not yet set
  if (!hasSeenPrompt && !hasName) {
    setTimeout(() => {
      modal.classList.remove("hidden");
      if (input) {
        input.value = "";
        input.focus();
      }
    }, 450);
  }

  const closeOnboarding = () => {
    modal.classList.add("hidden");
    localStorage.setItem("hasSeenWelcomePrompt", "true");
  };

  const handleSave = () => {
    const name = input ? input.value.trim() : "";
    if (name) {
      if (!appSettings) appSettings = loadSettings();
      appSettings.name = name;
      saveSettings();
      if (typeof updateTimeAndGreeting === "function") {
        updateTimeAndGreeting();
      }
      if (typeof syncSettingsUI === "function") {
        syncSettingsUI();
      }
      if (typeof showToast === "function") {
        showToast(`👋 Welcome, ${name}!`, "success", 3000);
      }
    }
    closeOnboarding();
  };

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSave);
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", closeOnboarding);
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        closeOnboarding();
      }
    });
  }
}

function bindSettingsControls() {
  const fab = document.getElementById("toggleSettingsBtn");
  if (fab) fab.addEventListener("click", () => {
    const drawer = document.getElementById("settingsDrawer");
    if (drawer && drawer.classList.contains("open")) {
      closeSettingsDrawer();
    } else {
      openSettingsDrawer();
    }
  });

  const closeBtn = document.getElementById("closeSettingsBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeSettingsDrawer);

  const backdrop = document.getElementById("settingsBackdrop");
  if (backdrop) backdrop.addEventListener("click", closeSettingsDrawer);

  document.querySelectorAll(".settings-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".settings-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".settings-tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const tab = document.getElementById(`settingsTab-${btn.dataset.tab}`);
      if (tab) tab.classList.add("active");
    });
  });

  const nameInput = document.getElementById("settingName");
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      appSettings.name = nameInput.value.trim();
      saveSettings();
    });
  }

  document.querySelectorAll("[data-clock]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-clock]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      appSettings.clockFormat = btn.dataset.clock;
      saveSettings();
    });
  });

  const showSecondsEl = document.getElementById("settingShowSeconds");
  if (showSecondsEl) {
    showSecondsEl.addEventListener("change", () => {
      appSettings.showSeconds = showSecondsEl.checked;
      saveSettings();
    });
  }

  const showDateEl = document.getElementById("settingShowDate");
  if (showDateEl) {
    showDateEl.addEventListener("change", () => {
      appSettings.showDate = showDateEl.checked;
      saveSettings();
    });
  }

  document.querySelectorAll("[data-bg]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-bg]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      appSettings.bgType = btn.dataset.bg === "default" ? "default" : "preset";
      appSettings.bgVal = btn.dataset.bg;
      saveSettings();
      applyBackgroundSettings();
    });
  });

  const bgApplyUrlBtn = document.getElementById("bgApplyUrlBtn");
  const bgUrlInput = document.getElementById("bgUrlInput");
  if (bgApplyUrlBtn && bgUrlInput) {
    bgApplyUrlBtn.addEventListener("click", () => {
      const url = bgUrlInput.value.trim();
      if (!url) return;
      document.querySelectorAll("[data-bg]").forEach(b => b.classList.remove("active"));
      appSettings.bgType = "url";
      appSettings.bgVal = url;
      saveSettings();
      applyBackgroundSettings();
      showToast("🖼️ Custom URL background applied!", "success", 2500);
    });
  }

  const bgUploadBtn = document.getElementById("bgUploadBtn");
  const bgFileInput = document.getElementById("bgFileInput");
  if (bgUploadBtn && bgFileInput) {
    bgUploadBtn.addEventListener("click", () => bgFileInput.click());
    bgFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        showToast("⚠️ Maximum file size is 10MB.", "warning", 3000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const max_size = 1920;
          if (width > height && width > max_size) {
            height = Math.round(height * (max_size / width));
            width = max_size;
          } else if (height > width && height > max_size) {
            width = Math.round(width * (max_size / height));
            height = max_size;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

          document.querySelectorAll("[data-bg]").forEach(b => b.classList.remove("active"));
          appSettings.bgType = "custom";
          appSettings.bgVal = dataUrl;
          try {
            saveSettings();
            applyBackgroundSettings();
            showToast("🖼️ Custom background image set!", "success", 2500);
          } catch (err) {
            showToast("⚠️ Image is still too large to save.", "warning", 3000);
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      bgFileInput.value = "";
    });
  }

  const bgDimSlider = document.getElementById("bgDimSlider");
  const bgDimVal = document.getElementById("bgDimVal");
  if (bgDimSlider && bgDimVal) {
    bgDimSlider.addEventListener("input", () => {
      const val = parseInt(bgDimSlider.value, 10);
      bgDimVal.textContent = `${val}%`;
      appSettings.bgDim = val;
      saveSettings();
      applyBackgroundSettings();
    });
  }

  const bgBlurSlider = document.getElementById("bgBlurSlider");
  const bgBlurVal = document.getElementById("bgBlurVal");
  if (bgBlurSlider && bgBlurVal) {
    bgBlurSlider.addEventListener("input", () => {
      const val = parseInt(bgBlurSlider.value, 10);
      bgBlurVal.textContent = `${val}px`;
      appSettings.bgBlur = val;
      saveSettings();
      applyBackgroundSettings();
    });
  }

  const addWidgetBtnLeft = document.getElementById("addWidgetBtnLeft");
  if (addWidgetBtnLeft) addWidgetBtnLeft.addEventListener("click", () => openWidgetPicker("left"));

  const addWidgetBtnRight = document.getElementById("addWidgetBtnRight");
  if (addWidgetBtnRight) addWidgetBtnRight.addEventListener("click", () => openWidgetPicker("right"));

  const closePickerBtn = document.getElementById("closeWidgetPickerBtn");
  if (closePickerBtn) closePickerBtn.addEventListener("click", closeWidgetPicker);

  const pickerModal = document.getElementById("widgetPickerModal");
  if (pickerModal) {
    pickerModal.addEventListener("click", (e) => {
      if (e.target === pickerModal) closeWidgetPicker();
    });
  }

  const exportBtn = document.getElementById("exportDataBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = {
        todos: JSON.parse(localStorage.getItem("todos") || "[]"),
        milestone: JSON.parse(localStorage.getItem("milestone") || "null"),
        appSettings: JSON.parse(localStorage.getItem("appSettings") || "{}"),
        quickNotes: localStorage.getItem("quickNotes") || "",
        somedayBoxTasks: JSON.parse(localStorage.getItem("somedayBoxTasks") || "[]"),
        somedayBoxTags: JSON.parse(localStorage.getItem("somedayBoxTags") || "[]"),
        isHidden: localStorage.getItem("isHidden") || "false",
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productive-tab-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("💾 Data exported successfully!", "success", 3000);
    });
  }

  const importBtn = document.getElementById("importDataBtn");
  const importFile = document.getElementById("importFileInput");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.todos) localStorage.setItem("todos", JSON.stringify(data.todos));
          if (data.milestone) localStorage.setItem("milestone", JSON.stringify(data.milestone));
          if (data.appSettings) localStorage.setItem("appSettings", JSON.stringify(data.appSettings));
          if (data.quickNotes !== undefined) localStorage.setItem("quickNotes", data.quickNotes);
          if (data.somedayBoxTasks) localStorage.setItem("somedayBoxTasks", JSON.stringify(data.somedayBoxTasks));
          if (data.somedayBoxTags) localStorage.setItem("somedayBoxTags", JSON.stringify(data.somedayBoxTags));
          if (data.isHidden !== undefined) localStorage.setItem("isHidden", data.isHidden);
          showToast("📥 Data imported successfully! Reloading page...", "success", 2000);
          setTimeout(() => location.reload(), 2200);
        } catch {
          showToast("❌ Invalid file format. Ensure valid JSON.", "danger", 4000);
        }
      };
      reader.readAsText(file);
      importFile.value = "";
    });
  }

  const resetBtn = document.getElementById("resetAllDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("⚠️ Are you sure you want to delete ALL data?\n\nTodos, milestone, settings, and notes will be permanently erased.")) return;
      localStorage.clear();
      sessionStorage.clear();
      showToast("🗑️ All data erased. Reloading...", "warning", 2000);
      setTimeout(() => location.reload(), 2200);
    });
  }

  initChangelog();
}

function initChangelog() {
  const openBtn = document.getElementById("openChangelogBtn");
  const modal = document.getElementById("changelogModal");
  const listEl = document.getElementById("changelogList");
  const currentVerEl = document.getElementById("changelogCurrentVersion");
  const STORAGE_KEY = "lastViewedChangelogVersion";

  if (!modal || !openBtn) return;

  const currentVersion = (typeof getLocalVersion === "function") ? getLocalVersion() : "1.9.1";
  if (currentVerEl) currentVerEl.textContent = `v${currentVersion}`;

  // Check and display unread update indicator dot on button & settings FAB
  const checkUnreadChangelog = () => {
    const lastViewed = localStorage.getItem(STORAGE_KEY);
    const hasUnread = !lastViewed || (typeof compareVersions === "function" ? compareVersions(lastViewed, currentVersion) : lastViewed !== currentVersion);
    openBtn.classList.toggle("has-unread-dot", hasUnread);

    const fab = document.getElementById("toggleSettingsBtn");
    if (fab && hasUnread) {
      fab.classList.add("has-update");
    }
  };

  const markChangelogAsRead = () => {
    localStorage.setItem(STORAGE_KEY, currentVersion);
    openBtn.classList.remove("has-unread-dot");

    // Clear settings FAB dot unless remote github update is pending
    const fab = document.getElementById("toggleSettingsBtn");
    const hasRemoteUpdate = localStorage.getItem("updater_hasUpdate") === "true";
    if (fab && !hasRemoteUpdate) {
      fab.classList.remove("has-update");
    }
  };

  checkUnreadChangelog();

  const renderChangelog = () => {
    if (!listEl) return;
    const entries = (typeof CHANGELOG_DATA !== "undefined" && Array.isArray(CHANGELOG_DATA)) ? CHANGELOG_DATA : [];
    if (entries.length === 0) {
      listEl.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align:center; padding: 20px;">No changelog records found.</div>';
      return;
    }

    const cardsHtml = entries.map((ver, idx) => {
      const isLatest = idx === 0;
      const itemsHtml = (ver.items || []).map(item => `
        <li class="changelog-item">
          <span class="changelog-pill ${escapeHtml(item.type || 'feat')}">${escapeHtml(item.type || 'feat')}</span>
          <span>${escapeHtml(item.text)}</span>
        </li>
      `).join("");

      const badgeHtml = isLatest
        ? '<span class="changelog-latest-tag" style="margin-left:8px;">✨ Latest</span>'
        : '';

      return `
        <div class="changelog-version-card ${isLatest ? 'is-latest' : ''}">
          <div class="changelog-version-title-row">
            <span class="changelog-ver-num">v${escapeHtml(ver.version)} ${badgeHtml}</span>
            <span class="changelog-ver-date">${escapeHtml(ver.date)}</span>
          </div>
          <ul class="changelog-items-list">
            ${itemsHtml}
          </ul>
        </div>
      `;
    }).join("");

    const archiveCardHtml = `
      <div class="changelog-archive-card">
        <div class="changelog-archive-text">
          <span class="changelog-archive-title">📜 Previous Versions Archive</span>
          <span class="changelog-archive-desc">Looking for earlier release notes? View the full changelog on GitHub.</span>
        </div>
        <a href="https://github.com/doltonsedward/productive-tab-extension/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer" class="changelog-archive-link" title="Open full CHANGELOG.md on GitHub">
          <span>Full History</span> ↗
        </a>
      </div>
    `;

    listEl.innerHTML = cardsHtml + archiveCardHtml;
  };

  openBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    markChangelogAsRead();
    renderChangelog();
    modal.classList.remove("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });
}
