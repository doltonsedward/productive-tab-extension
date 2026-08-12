// ==========================================
// 1. TASK-LEVEL STOPWATCH TRACKING
// ==========================================
let activeTrackingTodoId = null;
let taskTimerInterval = null;
let taskAccumulatedSeconds = 0;
let taskStartTime = null;

const taskTrackModal = document.getElementById("taskTrackModal");
const trackTaskTitle = document.getElementById("trackTaskTitle");
const trackTaskTime = document.getElementById("trackTaskTime");
const pauseTaskTrackBtn = document.getElementById("pauseTaskTrackBtn");
const stopTaskTrackBtn = document.getElementById("stopTaskTrackBtn");
const completeTaskTrackBtn = document.getElementById("completeTaskTrackBtn");
const restartTaskTrackBtn = document.getElementById("restartTaskTrackBtn");

function formatTime(sec) {
  const safeSec = Math.max(0, sec);
  const h = String(Math.floor(safeSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((safeSec % 3600) / 60)).padStart(2, "0");
  const s = String(safeSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function getTaskElapsedSeconds() {
  if (!taskStartTime) return taskAccumulatedSeconds;
  const currentSegmentSec = Math.floor((Date.now() - taskStartTime) / 1000);
  return taskAccumulatedSeconds + currentSegmentSec;
}

function updateTaskTimerDisplay() {
  if (trackTaskTime) {
    trackTaskTime.textContent = formatTime(getTaskElapsedSeconds());
  }
}

// Fungsi ini dipanggil dari newtab.js saat tombol ⏱️ diklik
function startTaskTracking(id) {
  // Access variabel 'todos' global dari newtab.js
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  activeTrackingTodoId = id;
  taskAccumulatedSeconds = todo.elapsedTime || 0;
  taskStartTime = Date.now();
  if (trackTaskTitle) trackTaskTitle.textContent = todo.text;
  updateTaskTimerDisplay();

  if (taskTrackModal) taskTrackModal.classList.remove("hidden");
  runTaskTimer();
}

function runTaskTimer() {
  clearInterval(taskTimerInterval);
  if (pauseTaskTrackBtn) pauseTaskTrackBtn.textContent = "Pause";
  if (!taskStartTime) {
    taskStartTime = Date.now();
  }
  updateTaskTimerDisplay();
  taskTimerInterval = setInterval(() => {
    updateTaskTimerDisplay();
  }, 1000);
}

if (pauseTaskTrackBtn) {
  pauseTaskTrackBtn.addEventListener("click", () => {
    if (taskTimerInterval) {
      taskAccumulatedSeconds = getTaskElapsedSeconds();
      taskStartTime = null;
      clearInterval(taskTimerInterval);
      taskTimerInterval = null;
      pauseTaskTrackBtn.textContent = "Resume";
      updateTaskTimerDisplay();
    } else {
      taskStartTime = Date.now();
      runTaskTimer();
    }
  });
}

function stopTracking(shouldComplete = false) {
  const finalSeconds = getTaskElapsedSeconds();

  clearInterval(taskTimerInterval);
  taskTimerInterval = null;
  taskStartTime = null;
  taskAccumulatedSeconds = 0;

  // Mengakses 'todos', 'saveTodos', dan 'renderTodos' global dari newtab.js
  const todo = todos.find((t) => t.id === activeTrackingTodoId);
  if (todo) {
    todo.elapsedTime = finalSeconds;
    if (shouldComplete) {
      todo.completed = true;
      if (typeof checkAllTodosCompleted === "function") checkAllTodosCompleted();
    }
    if (typeof saveTodos === "function") saveTodos();
    if (typeof renderTodos === "function") renderTodos();
  }

  if (taskTrackModal) taskTrackModal.classList.add("hidden");
  activeTrackingTodoId = null;
}

if (stopTaskTrackBtn)
  stopTaskTrackBtn.addEventListener("click", () => stopTracking(false));
if (completeTaskTrackBtn)
  completeTaskTrackBtn.addEventListener("click", () => stopTracking(true));
if (restartTaskTrackBtn) {
  restartTaskTrackBtn.addEventListener("click", () => {
    taskAccumulatedSeconds = 0;
    if (taskTimerInterval) {
      taskStartTime = Date.now();
    } else {
      taskStartTime = null;
    }
    updateTaskTimerDisplay();
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
let isGlobalRunning = false;

let globalAccumulatedSeconds = 0;
let globalStartTime = null;
let globalTargetEndTime = null;

if (toggleTimerPanelBtn) {
  toggleTimerPanelBtn.addEventListener("click", () => {
    if (timerPanel) timerPanel.classList.toggle("hidden");
  });
}

if (tabStopwatch)
  tabStopwatch.addEventListener("click", () => switchGlobalMode("stopwatch"));
if (tabTimer)
  tabTimer.addEventListener("click", () => switchGlobalMode("timer"));

function getGlobalStopwatchSeconds() {
  if (!globalStartTime) return globalAccumulatedSeconds;
  const currentSegmentSec = Math.floor((Date.now() - globalStartTime) / 1000);
  return globalAccumulatedSeconds + currentSegmentSec;
}

function getGlobalCountdownSeconds() {
  if (!isGlobalRunning || !globalTargetEndTime) return globalAccumulatedSeconds;
  const remainingSec = Math.ceil((globalTargetEndTime - Date.now()) / 1000);
  return Math.max(0, remainingSec);
}

function updateGlobalDisplay() {
  if (!displayGlobalTime) return;
  if (globalMode === "stopwatch") {
    displayGlobalTime.textContent = formatTime(getGlobalStopwatchSeconds());
  } else {
    displayGlobalTime.textContent = formatTime(getGlobalCountdownSeconds());
  }
}

function switchGlobalMode(mode) {
  globalMode = mode;
  resetGlobalTimer();
  if (mode === "stopwatch") {
    if (tabStopwatch) tabStopwatch.classList.add("active");
    if (tabTimer) tabTimer.classList.remove("active");
    if (timerInputGroup) timerInputGroup.classList.add("hidden");
  } else {
    if (tabTimer) tabTimer.classList.add("active");
    if (tabStopwatch) tabStopwatch.classList.remove("active");
    if (timerInputGroup) timerInputGroup.classList.remove("hidden");
  }
}

if (startGlobalTimerBtn) {
  startGlobalTimerBtn.addEventListener("click", () => {
    if (isGlobalRunning) {
      if (globalMode === "stopwatch") {
        globalAccumulatedSeconds = getGlobalStopwatchSeconds();
        globalStartTime = null;
      } else {
        globalAccumulatedSeconds = getGlobalCountdownSeconds();
        globalTargetEndTime = null;
      }
      clearInterval(globalInterval);
      globalInterval = null;
      isGlobalRunning = false;
      startGlobalTimerBtn.textContent = "Start";
      updateGlobalDisplay();
      return;
    }

    if (globalMode === "timer") {
      if (globalAccumulatedSeconds <= 0) {
        const mins = parseInt(timerMinutesInput ? timerMinutesInput.value : 0);
        if (!mins || mins <= 0) return;
        globalAccumulatedSeconds = mins * 60;
      }
      globalTargetEndTime = Date.now() + globalAccumulatedSeconds * 1000;
    } else {
      globalStartTime = Date.now();
    }

    isGlobalRunning = true;
    startGlobalTimerBtn.textContent = "Pause";
    updateGlobalDisplay();

    clearInterval(globalInterval);
    globalInterval = setInterval(() => {
      if (globalMode === "timer") {
        const remaining = getGlobalCountdownSeconds();
        if (remaining <= 0) {
          clearInterval(globalInterval);
          globalInterval = null;
          isGlobalRunning = false;
          globalAccumulatedSeconds = 0;
          globalTargetEndTime = null;
          updateGlobalDisplay();
          if (startGlobalTimerBtn) startGlobalTimerBtn.textContent = "Start";
          alert("⏰ Time's up!");
          resetGlobalTimer();
          return;
        }
      }
      updateGlobalDisplay();
    }, 1000);
  });
}

function resetGlobalTimer() {
  clearInterval(globalInterval);
  globalInterval = null;
  isGlobalRunning = false;
  globalAccumulatedSeconds = 0;
  globalStartTime = null;
  globalTargetEndTime = null;
  if (displayGlobalTime) displayGlobalTime.textContent = "00:00:00";
  if (startGlobalTimerBtn) startGlobalTimerBtn.textContent = "Start";
}

if (resetGlobalTimerBtn)
  resetGlobalTimerBtn.addEventListener("click", resetGlobalTimer);

// ==========================================
// 3. BACKGROUND TAB VISIBILITY SYNC
// ==========================================
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (taskTimerInterval) {
      updateTaskTimerDisplay();
    }
    if (isGlobalRunning) {
      updateGlobalDisplay();
    }
  }
});
