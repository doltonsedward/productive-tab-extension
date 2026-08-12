// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE HELPERS
// ==========================================

let todos = [];
let isHidden = false;
let milestone = null;
let appSettings = null;

const DEFAULT_SETTINGS = {
  name: "dollong",           // Greeting name
  clockFormat: "24h",        // "24h" | "12h"
  showSeconds: false,        // bool
  showDate: true,            // bool
  activeWidgets: {
    left: [],    // max 2 widgets
    right: []    // max 2 widgets
  },
  bgType: "default",         // "default" | "preset" | "url" | "custom"
  bgVal: "background/default.png", // URL, base64 data string, or preset key
  bgDim: 40,                 // 0 to 85 percent overlay darkness
  bgBlur: 0,                 // 0 to 25 px blur
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
    if (!raw) return { ...DEFAULT_SETTINGS };
    const saved = JSON.parse(raw);

    // Auto-migrate old activeWidgets array format to dual slots
    if (Array.isArray(saved.activeWidgets)) {
      const oldArr = saved.activeWidgets;
      saved.activeWidgets = {
        left: oldArr.slice(0, 2),
        right: oldArr.slice(2, 4)
      };
    }

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      activeWidgets: {
        left: Array.isArray(saved.activeWidgets?.left) ? saved.activeWidgets.left : [],
        right: Array.isArray(saved.activeWidgets?.right) ? saved.activeWidgets.right : []
      }
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
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
