// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE HELPERS
// ==========================================

let todos = [];
let isHidden = false;
let milestone = null;
let appSettings = null;

const DEFAULT_SETTINGS = {
  name: "",
  clockFormat: "24h",
  showSeconds: false,
  showDate: true,
  widgetSlots: {
    left: [],
    right: []
  },
  bgType: "default",
  bgVal: "background/default.png",
  bgDim: 40,
  bgBlur: 0,
};

const BG_PRESETS = {
  default: "background/default.png",
  aurora: "background/aurora.png",
  space: "background/space.png",
  mountain: "background/mountain.png",
  "dark-ribbon": "background/dark-ribbon.jpg",
  "dark-cubes": "background/dark-cubes.jpg",
  "teal-clouds": "background/teal-clouds.jpg",
  dark: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
};

// --- TODOS STORAGE ---
function loadTodos() {
  try {
    const raw = JSON.parse(localStorage.getItem("todos") || "[]");
    return raw.map((t) => ({
      ...t,
      subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
      isExpanded: Boolean(t.isExpanded),
    }));
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadIsHidden() {
  try {
    return localStorage.getItem("isHidden") === "true";
  } catch {
    return false;
  }
}

function saveIsHidden() {
  localStorage.setItem("isHidden", isHidden);
}

function loadWidgetsMinimized() {
  try {
    return localStorage.getItem("widgetsMinimized") === "true";
  } catch {
    return false;
  }
}

function saveWidgetsMinimized(val) {
  localStorage.setItem("widgetsMinimized", String(Boolean(val)));
}

// --- MILESTONE STORAGE ---
function loadMilestone() {
  try {
    const raw = localStorage.getItem("milestone");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.title ? data : null;
  } catch {
    return null;
  }
}

function saveMilestone() {
  if (milestone) {
    localStorage.setItem("milestone", JSON.stringify(milestone));
  } else {
    localStorage.removeItem("milestone");
  }
}

// --- SETTINGS STORAGE & MIGRATION ---
function loadSettings() {
  try {
    const raw = localStorage.getItem("appSettings");
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    const saved = JSON.parse(raw);

    let leftSlots = [];
    let rightSlots = [];

    if (saved.widgetSlots) {
      leftSlots = Array.isArray(saved.widgetSlots.left) ? saved.widgetSlots.left : [];
      rightSlots = Array.isArray(saved.widgetSlots.right) ? saved.widgetSlots.right : [];
    } else if (Array.isArray(saved.activeWidgets)) {
      leftSlots = saved.activeWidgets.slice(0, 2);
      rightSlots = saved.activeWidgets.slice(2, 4);
    } else if (saved.activeWidgets && typeof saved.activeWidgets === "object") {
      leftSlots = Array.isArray(saved.activeWidgets.left) ? saved.activeWidgets.left : [];
      rightSlots = Array.isArray(saved.activeWidgets.right) ? saved.activeWidgets.right : [];
    }

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      widgetSlots: {
        left: leftSlots,
        right: rightSlots
      }
    };
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
}

function saveSettings() {
  if (appSettings) {
    localStorage.setItem("appSettings", JSON.stringify(appSettings));
  }
}

// --- TOAST NOTIFICATION HELPER ---
function showToast(message, type = "success", duration = 4000) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// --- HTML ESCAPING HELPER ---
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
