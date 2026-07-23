// ==========================================
// 1. TASK-LEVEL STOPWATCH TRACKING
// ==========================================
let activeTrackingTodoId = null;
let taskTimerInterval = null;
let taskElapsedSeconds = 0;

const taskTrackModal = document.getElementById("taskTrackModal");
const trackTaskTitle = document.getElementById("trackTaskTitle");
const trackTaskTime = document.getElementById("trackTaskTime");
const pauseTaskTrackBtn = document.getElementById("pauseTaskTrackBtn");
const stopTaskTrackBtn = document.getElementById("stopTaskTrackBtn");
const completeTaskTrackBtn = document.getElementById("completeTaskTrackBtn");
const restartTaskTrackBtn = document.getElementById("restartTaskTrackBtn");

function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// Fungsi ini dipanggil dari newtab.js saat tombol ⏱️ diklik
function startTaskTracking(id) {
  // Access variabel 'todos' global dari newtab.js
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  activeTrackingTodoId = id;
  taskElapsedSeconds = todo.elapsedTime || 0;
  trackTaskTitle.textContent = todo.text;
  trackTaskTime.textContent = formatTime(taskElapsedSeconds);

  taskTrackModal.classList.remove("hidden");
  runTaskTimer();
}

function runTaskTimer() {
  clearInterval(taskTimerInterval);
  pauseTaskTrackBtn.textContent = "Pause";
  taskTimerInterval = setInterval(() => {
    taskElapsedSeconds++;
    trackTaskTime.textContent = formatTime(taskElapsedSeconds);
  }, 1000);
}

if (pauseTaskTrackBtn) {
  pauseTaskTrackBtn.addEventListener("click", () => {
    if (taskTimerInterval) {
      clearInterval(taskTimerInterval);
      taskTimerInterval = null;
      pauseTaskTrackBtn.textContent = "Lanjut";
    } else {
      runTaskTimer();
    }
  });
}

function stopTracking(shouldComplete = false) {
  clearInterval(taskTimerInterval);
  taskTimerInterval = null;

  // Mengakses 'todos', 'saveTodos', dan 'renderTodos' global dari newtab.js
  const todo = todos.find((t) => t.id === activeTrackingTodoId);
  if (todo) {
    todo.elapsedTime = taskElapsedSeconds;
    if (shouldComplete) todo.completed = true;
    if (typeof saveTodos === "function") saveTodos();
    if (typeof renderTodos === "function") renderTodos();
  }

  taskTrackModal.classList.add("hidden");
  activeTrackingTodoId = null;
}

if (stopTaskTrackBtn)
  stopTaskTrackBtn.addEventListener("click", () => stopTracking(false));
if (completeTaskTrackBtn)
  completeTaskTrackBtn.addEventListener("click", () => stopTracking(true));
if (restartTaskTrackBtn) {
  restartTaskTrackBtn.addEventListener("click", () => {
    taskElapsedSeconds = 0;
    trackTaskTime.textContent = formatTime(taskElapsedSeconds);
  });
}

// ==========================================
// 2. GLOBAL TIMER & STOPWATCH WIDGET
// ==========================================
const toggleTimerPanelBtn = document.getElementById("toggleTimerPanelBtn");
const timerPanel = document.getElementById("timerPanel");
const tabStopwatch = document.getElementById("tabStopwatch");
const tabTimer = document.getElementById("tabTimer");
const displayGlobalTime = document.getElementById("displayGlobalTime");
const timerInputGroup = document.getElementById("timerInputGroup");
const timerMinutesInput = document.getElementById("timerMinutes");
const startGlobalTimerBtn = document.getElementById("startGlobalTimerBtn");
const resetGlobalTimerBtn = document.getElementById("resetGlobalTimerBtn");

let globalMode = "stopwatch";
let globalInterval = null;
let globalSeconds = 0;
let isGlobalRunning = false;

if (toggleTimerPanelBtn) {
  toggleTimerPanelBtn.addEventListener("click", () => {
    timerPanel.classList.toggle("hidden");
  });
}

if (tabStopwatch)
  tabStopwatch.addEventListener("click", () => switchGlobalMode("stopwatch"));
if (tabTimer)
  tabTimer.addEventListener("click", () => switchGlobalMode("timer"));

function switchGlobalMode(mode) {
  globalMode = mode;
  resetGlobalTimer();
  if (mode === "stopwatch") {
    tabStopwatch.classList.add("active");
    tabTimer.classList.remove("active");
    timerInputGroup.classList.add("hidden");
  } else {
    tabTimer.classList.add("active");
    tabStopwatch.classList.remove("active");
    timerInputGroup.classList.remove("hidden");
  }
}

if (startGlobalTimerBtn) {
  startGlobalTimerBtn.addEventListener("click", () => {
    if (isGlobalRunning) {
      clearInterval(globalInterval);
      isGlobalRunning = false;
      startGlobalTimerBtn.textContent = "Start";
      return;
    }

    if (globalMode === "timer" && globalSeconds === 0) {
      const mins = parseInt(timerMinutesInput.value);
      if (!mins || mins <= 0) return;
      globalSeconds = mins * 60;
    }

    isGlobalRunning = true;
    startGlobalTimerBtn.textContent = "Pause";

    globalInterval = setInterval(() => {
      if (globalMode === "stopwatch") {
        globalSeconds++;
      } else {
        globalSeconds--;
        if (globalSeconds <= 0) {
          clearInterval(globalInterval);
          isGlobalRunning = false;
          alert("⏰ Waktu habis!");
          resetGlobalTimer();
          return;
        }
      }
      displayGlobalTime.textContent = formatTime(globalSeconds);
    }, 1000);
  });
}

function resetGlobalTimer() {
  clearInterval(globalInterval);
  isGlobalRunning = false;
  globalSeconds = 0;
  displayGlobalTime.textContent = "00:00:00";
  if (startGlobalTimerBtn) startGlobalTimerBtn.textContent = "Start";
}

if (resetGlobalTimerBtn)
  resetGlobalTimerBtn.addEventListener("click", resetGlobalTimer);
