// ==========================================
// WIDGET REGISTRY & DUAL-SLOT WORKSPACE ENGINE
// ==========================================

const WIDGET_REGISTRY = {
  quicknotes: {
    id: "quicknotes",
    name: "Quick Notes",
    icon: "📝",
    desc: "Quick notes & scratchpad",
    render() {
      const saved = localStorage.getItem("quickNotes") || "";
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "quicknotes";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">📝</span>
            Quick Notes
          </div>
          <button class="widget-remove-btn" data-remove="quicknotes" title="Remove widget">✕</button>
        </div>
        <textarea
          id="quickNotesTextarea"
          class="quick-notes-textarea"
          placeholder="Quick ideas, temporary notes..."
          maxlength="1000"
        >${escapeHtml(saved)}</textarea>
        <div class="quick-notes-footer">
          <span class="quick-notes-autosave" id="quickNotesStatus">✓ Saved</span>
          <button class="quick-notes-clear-btn" id="quickNotesClearBtn">Clear all</button>
        </div>
      `;
      return card;
    },
    afterRender() {
      const textarea = document.getElementById("quickNotesTextarea");
      const status = document.getElementById("quickNotesStatus");
      const clearBtn = document.getElementById("quickNotesClearBtn");
      let saveTimer = null;

      if (textarea) {
        textarea.addEventListener("input", () => {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            localStorage.setItem("quickNotes", textarea.value);
            if (status) {
              status.classList.add("visible");
              setTimeout(() => status.classList.remove("visible"), 1800);
            }
          }, 600);
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          if (textarea && confirm("Clear all notes?")) {
            textarea.value = "";
            localStorage.removeItem("quickNotes");
            showToast("📝 Quick Notes cleared.", "info", 2000);
          }
        });
      }
    }
  },

  dailyquote: {
    id: "dailyquote",
    name: "Daily Quote",
    icon: "💡",
    desc: "Daily inspiration & quotes",
    quotes: [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
      { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
      { text: "Dream it. Wish it. Do it.", author: "Unknown" },
      { text: "Stay focused, go after your dreams and keep moving toward your goals.", author: "LL Cool J" },
      { text: "Great things never come from comfort zones.", author: "Unknown" },
      { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
      { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
      { text: "The harder the struggle, the more glorious the triumph.", author: "Unknown" },
      { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
      { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    ],
    getCurrentQuote() {
      const savedIdx = sessionStorage.getItem("dailyQuoteIdx");
      if (savedIdx !== null) return this.quotes[parseInt(savedIdx, 10) % this.quotes.length];
      const dayIdx = new Date().getDate() % this.quotes.length;
      return this.quotes[dayIdx];
    },
    render() {
      const q = this.getCurrentQuote();
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "dailyquote";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">💡</span>
            Daily Quote
          </div>
          <button class="widget-remove-btn" data-remove="dailyquote" title="Remove widget">✕</button>
        </div>
        <div class="quote-text" id="quoteText">${escapeHtml(q.text)}</div>
        <div class="quote-meta">
          <span class="quote-author" id="quoteAuthor">— ${escapeHtml(q.author)}</span>
          <button class="quote-refresh-btn" id="quoteRefreshBtn">↺ New</button>
        </div>
      `;
      return card;
    },
    afterRender() {
      const refreshBtn = document.getElementById("quoteRefreshBtn");
      const quoteText = document.getElementById("quoteText");
      const quoteAuthor = document.getElementById("quoteAuthor");
      if (refreshBtn && quoteText && quoteAuthor) {
        refreshBtn.addEventListener("click", () => {
          const currentIdx = parseInt(sessionStorage.getItem("dailyQuoteIdx") ?? new Date().getDate(), 10);
          const nextIdx = (currentIdx + 1) % this.quotes.length;
          sessionStorage.setItem("dailyQuoteIdx", nextIdx);
          const q = this.quotes[nextIdx];
          quoteText.style.opacity = '0';
          quoteAuthor.style.opacity = '0';
          setTimeout(() => {
            quoteText.textContent = q.text;
            quoteAuthor.textContent = `— ${q.author}`;
            quoteText.style.transition = 'opacity 0.3s ease';
            quoteAuthor.style.transition = 'opacity 0.3s ease';
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
          }, 200);
        });
      }
    }
  },

  focusstats: {
    id: "focusstats",
    name: "Focus Stats",
    icon: "📊",
    desc: "Daily productivity summary",
    render() {
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "focusstats";

      const totalTasks = (typeof todos !== 'undefined') ? todos.length : 0;
      const doneTasks = (typeof todos !== 'undefined') ? todos.filter(t => t.completed).length : 0;
      const totalTracked = (typeof todos !== 'undefined')
        ? todos.reduce((acc, t) => acc + (t.elapsedTime || 0), 0)
        : 0;

      const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
      };

      const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">📊</span>
            Focus Stats
          </div>
          <button class="widget-remove-btn" data-remove="focusstats" title="Remove widget">✕</button>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${doneTasks}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalTasks}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${percent}%</div>
            <div class="stat-label">Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalTracked > 0 ? formatTime(totalTracked) : '—'}</div>
            <div class="stat-label">Tracked</div>
          </div>
        </div>
      `;
      return card;
    },
    afterRender() {}
  },

  timer: {
    id: "timer",
    name: "Timer Panel",
    icon: "⏱️",
    desc: "Timer & Stopwatch next to todo",
    render() {
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "timer";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">⏱️</span>
            Timer
          </div>
          <button class="widget-remove-btn" data-remove="timer" title="Remove widget">✕</button>
        </div>
        <div style="text-align:center; padding: 8px 0;">
          <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-bottom:8px;">
            Use the ⏱️ button in the bottom right corner for full Timer & Stopwatch.
          </div>
          <div id="widgetTimerDisplay" style="font-size:1.6rem; font-weight:700; letter-spacing:1px; font-family:Arial,sans-serif;">00:00</div>
        </div>
      `;
      return card;
    },
    afterRender() {
      setInterval(() => {
        const globalDisplay = document.getElementById("displayGlobalTime");
        const widgetDisplay = document.getElementById("widgetTimerDisplay");
        if (globalDisplay && widgetDisplay) {
          widgetDisplay.textContent = globalDisplay.textContent.substring(0, 5);
        }
      }, 500);
    }
  }
};

const MAX_WIDGETS = 4;
const MAX_WIDGETS_PER_SIDE = 2;
let targetAddSide = "right";
let draggedWidgetInfo = null;

function renderWidgets() {
  const colLeft = document.getElementById("widgetColumnLeft");
  const colRight = document.getElementById("widgetColumnRight");
  const addBtnLeft = document.getElementById("addWidgetBtnLeft");
  const addBtnRight = document.getElementById("addWidgetBtnRight");

  if (!colLeft || !colRight) return;

  if (!appSettings) appSettings = loadSettings();
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  if (!Array.isArray(appSettings.widgetSlots.left)) appSettings.widgetSlots.left = [];
  if (!Array.isArray(appSettings.widgetSlots.right)) appSettings.widgetSlots.right = [];

  colLeft.querySelectorAll(".widget-card").forEach(el => el.remove());
  colRight.querySelectorAll(".widget-card").forEach(el => el.remove());

  appSettings.widgetSlots.left.forEach((widgetId, index) => {
    const card = renderCardForSlot(widgetId, "left", index);
    if (card && addBtnLeft) colLeft.insertBefore(card, addBtnLeft);
  });

  appSettings.widgetSlots.right.forEach((widgetId, index) => {
    const card = renderCardForSlot(widgetId, "right", index);
    if (card && addBtnRight) colRight.insertBefore(card, addBtnRight);
  });

  setupColumnDropTarget(colLeft, "left");
  setupColumnDropTarget(colRight, "right");

  [...appSettings.widgetSlots.left, ...appSettings.widgetSlots.right].forEach(widgetId => {
    const def = WIDGET_REGISTRY[widgetId];
    if (def && def.afterRender) def.afterRender();
  });

  if (addBtnLeft) {
    const isFull = appSettings.widgetSlots.left.length >= MAX_WIDGETS_PER_SIDE;
    const isEmpty = appSettings.widgetSlots.left.length === 0;
    addBtnLeft.classList.toggle("hidden", isFull);
    addBtnLeft.classList.toggle("empty-column-btn", isEmpty);
    const label = addBtnLeft.querySelector(".add-widget-label");
    if (label) label.textContent = isEmpty ? "Left Widget" : "More Widgets";
  }

  if (addBtnRight) {
    const isFull = appSettings.widgetSlots.right.length >= MAX_WIDGETS_PER_SIDE;
    const isEmpty = appSettings.widgetSlots.right.length === 0;
    addBtnRight.classList.toggle("hidden", isFull);
    addBtnRight.classList.toggle("empty-column-btn", isEmpty);
    const label = addBtnRight.querySelector(".add-widget-label");
    if (label) label.textContent = isEmpty ? "Right Widget" : "More Widgets";
  }

  if (typeof renderSettingsWidgetList === "function") {
    renderSettingsWidgetList();
  }
}

function renderCardForSlot(widgetId, side, index) {
  const def = WIDGET_REGISTRY[widgetId];
  if (!def) return null;
  const card = def.render();
  card.dataset.widgetId = widgetId;
  card.dataset.side = side;
  card.dataset.index = index;

  const header = card.querySelector(".widget-header");
  if (header) {
    const otherSide = side === "left" ? "right" : "left";
    const sameColCount = appSettings.widgetSlots[side].length;

    header.innerHTML = `
      <div class="widget-title">
        <span class="widget-drag-handle" title="Drag & Drop to move/swap position">⣿</span>
        <span class="widget-title-icon">${def.icon}</span>
        ${escapeHtml(def.name)}
      </div>
      <div class="widget-card-actions">
        ${sameColCount > 1 ? `<button class="widget-action-btn move-updown-btn" data-side="${side}" data-idx="${index}" title="Swap top/bottom position">⇅</button>` : ''}
        <button class="widget-action-btn move-side-btn" data-side="${side}" data-idx="${index}" title="Move to ${otherSide === 'left' ? 'left' : 'right'} side">⇄</button>
        <button class="widget-action-btn widget-remove-btn" data-side="${side}" data-widget-id="${widgetId}" title="Remove widget">✕</button>
      </div>
    `;

    const removeBtn = header.querySelector(".widget-remove-btn");
    if (removeBtn) removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeWidget(widgetId);
    });

    const moveSideBtn = header.querySelector(".move-side-btn");
    if (moveSideBtn) moveSideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveWidgetToOtherSide(side, index);
    });

    const moveUpDownBtn = header.querySelector(".move-updown-btn");
    if (moveUpDownBtn) moveUpDownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      swapWidgetUpDown(side, index);
    });
  }

  setupWidgetDragAndDrop(card, side, index, widgetId);

  return card;
}

function setupWidgetDragAndDrop(card, side, index, widgetId) {
  const dragHandle = card.querySelector(".widget-drag-handle");

  if (dragHandle) {
    dragHandle.setAttribute("draggable", "true");

    dragHandle.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      draggedWidgetInfo = { side, index, widgetId };
      card.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", widgetId);
    });

    dragHandle.addEventListener("dragend", (e) => {
      e.stopPropagation();
      card.classList.remove("is-dragging");
      document.querySelectorAll(".widget-card").forEach(c => c.classList.remove("drag-over"));
      document.querySelectorAll(".widget-column").forEach(c => c.classList.remove("drag-over-column"));
      draggedWidgetInfo = null;
    });
  }

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedWidgetInfo && (draggedWidgetInfo.side !== side || draggedWidgetInfo.index !== index)) {
      card.classList.add("drag-over");
    }
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-over");
  });

  card.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    card.classList.remove("drag-over");

    if (!draggedWidgetInfo) return;
    const { side: srcSide, index: srcIndex, widgetId: srcWidgetId } = draggedWidgetInfo;

    if (srcSide === side && srcIndex === index) return;

    const targetWidgetId = appSettings.widgetSlots[side][index];

    appSettings.widgetSlots[srcSide][srcIndex] = targetWidgetId;
    appSettings.widgetSlots[side][index] = srcWidgetId;

    saveSettings();
    renderWidgets();

    setTimeout(() => {
      document.querySelectorAll(`.widget-card[data-widget-id="${srcWidgetId}"], .widget-card[data-widget-id="${targetWidgetId}"]`).forEach(c => {
        c.classList.add("swapping");
        setTimeout(() => c.classList.remove("swapping"), 450);
      });
    }, 50);
  });
}

function setupColumnDropTarget(columnEl, side) {
  if (columnEl.dataset.dropTargetInit) return;
  columnEl.dataset.dropTargetInit = "true";

  columnEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (draggedWidgetInfo && draggedWidgetInfo.side !== side) {
      columnEl.classList.add("drag-over-column");
    }
  });

  columnEl.addEventListener("dragleave", () => {
    columnEl.classList.remove("drag-over-column");
  });

  columnEl.addEventListener("drop", (e) => {
    if (e.target.closest(".widget-card")) return;
    e.preventDefault();
    columnEl.classList.remove("drag-over-column");

    if (!draggedWidgetInfo) return;
    const { side: srcSide, index: srcIndex, widgetId: srcWidgetId } = draggedWidgetInfo;

    if (srcSide === side) return;

    const targetArray = appSettings.widgetSlots[side];
    if (targetArray.length >= MAX_WIDGETS_PER_SIDE) {
      showToast(`⚠️ ${side === 'left' ? 'Left' : 'Right'} side is full (max 2 widgets).`, "warning", 2500);
      return;
    }

    appSettings.widgetSlots[srcSide].splice(srcIndex, 1);
    targetArray.push(srcWidgetId);

    saveSettings();
    renderWidgets();
  });
}

function moveWidgetToOtherSide(currentSide, index) {
  const otherSide = currentSide === "left" ? "right" : "left";
  const srcArray = appSettings.widgetSlots[currentSide];
  const targetArray = appSettings.widgetSlots[otherSide];

  const widgetId = srcArray[index];

  if (targetArray.length >= MAX_WIDGETS_PER_SIDE) {
    const swappedId = targetArray[0];
    targetArray[0] = widgetId;
    srcArray[index] = swappedId;
  } else {
    srcArray.splice(index, 1);
    targetArray.push(widgetId);
  }

  saveSettings();
  renderWidgets();
}

function swapWidgetUpDown(side, index) {
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  const arr = appSettings.widgetSlots[side] || [];
  if (arr.length < 2) return;
  const otherIndex = index === 0 ? 1 : 0;
  const temp = arr[index];
  arr[index] = arr[otherIndex];
  arr[otherIndex] = temp;

  saveSettings();
  renderWidgets();
}

function addWidget(widgetId, side = "right") {
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  if (!Array.isArray(appSettings.widgetSlots.left)) appSettings.widgetSlots.left = [];
  if (!Array.isArray(appSettings.widgetSlots.right)) appSettings.widgetSlots.right = [];

  const targetArray = appSettings.widgetSlots[side];
  const allActive = [...appSettings.widgetSlots.left, ...appSettings.widgetSlots.right];

  if (allActive.includes(widgetId)) {
    showToast("This widget is already active.", "info", 2000);
    return;
  }

  if (targetArray.length >= MAX_WIDGETS_PER_SIDE) {
    showToast(`🧩 ${side === 'left' ? 'Left' : 'Right'} side is full (max 2 widgets).`, "warning", 2500);
    return;
  }

  targetArray.push(widgetId);
  saveSettings();
  renderWidgets();
  closeWidgetPicker();
  showToast(`🧩 Widget "${WIDGET_REGISTRY[widgetId]?.name}" added!`, "success", 2500);
}

function removeWidget(widgetId) {
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  appSettings.widgetSlots.left = (appSettings.widgetSlots.left || []).filter(id => id !== widgetId);
  appSettings.widgetSlots.right = (appSettings.widgetSlots.right || []).filter(id => id !== widgetId);
  saveSettings();
  renderWidgets();
  showToast("Widget removed.", "info", 2000);
}

function openWidgetPicker(side = "right") {
  targetAddSide = side;
  const modal = document.getElementById("widgetPickerModal");
  const list = document.getElementById("widgetPickerList");
  if (!modal || !list) return;

  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  const leftSlots = appSettings.widgetSlots.left || [];
  const rightSlots = appSettings.widgetSlots.right || [];
  const targetSlots = appSettings.widgetSlots[targetAddSide] || [];

  list.innerHTML = "";
  const allActive = [...leftSlots, ...rightSlots];

  Object.values(WIDGET_REGISTRY).forEach(def => {
    const isActive = allActive.includes(def.id);
    const isTargetFull = targetSlots.length >= MAX_WIDGETS_PER_SIDE;
    const item = document.createElement("button");
    item.className = `widget-picker-item${isActive || isTargetFull ? " disabled" : ""}`;
    item.innerHTML = `
      <span class="widget-picker-item-icon">${def.icon}</span>
      <span class="widget-picker-item-name">${def.name}</span>
      <span class="widget-picker-item-desc">${isActive ? "Active" : def.desc}</span>
    `;
    if (!isActive && !isTargetFull) {
      item.addEventListener("click", () => addWidget(def.id, targetAddSide));
    }
    list.appendChild(item);
  });

  modal.classList.remove("hidden");
}

function closeWidgetPicker() {
  const modal = document.getElementById("widgetPickerModal");
  if (modal) modal.classList.add("hidden");
}
