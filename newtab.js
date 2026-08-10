let todos = [];
let isHidden = false;

// State Milestone Habit Tracker
let milestone = null;

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem("todos") || "[]");
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

// 15 Short, Mind-Bending Random Reflection Questions for Day N
const RANDOM_QUESTIONS = [
  "What assumption did you make today that might be wrong?",
  "If today was a chapter in your book, what would its title be?",
  "What habit today will your future self thank you for?",
  "Are you reacting to your day, or actively shaping it?",
  "What is something you learned today that shifted your perspective?",
  "What's one thing you did today purely for your own joy?",
  "What unspoken rule are you following that you never agreed to?",
  "If you had 1 extra hour with zero obligations, how would you spend it?",
  "What's the smallest change that would give you the biggest peace of mind?",
  "Are you spending your energy on what truly matters to you?",
  "What's one belief you held last year that you've outgrown?",
  "What would you attempt today if failure was impossible?",
  "What hard truth did you embrace recently that made you stronger?",
  "What's one noise in your life you need to turn down?",
  "What made you feel genuinely grateful or smile today?"
];

function getDayCheckinQuote(streak, targetDays, title) {
  if (streak >= targetDays) {
    return `🏆 CONGRATULATIONS! You completed all ${targetDays} days of '${title}'! 🎉`;
  }
  if (streak === 1) {
    return `🚀 Great start! Day 1 completed. Consistency begins now!`;
  }
  if (streak === 2) {
    return `🔥 Momentum building! Day 2 completed. Keep it going!`;
  }
  if (streak === 3) {
    return `⚡ Day 3 done! 3 days in a row — your habit is forming!`;
  }

  const q = RANDOM_QUESTIONS[Math.floor(Math.random() * RANDOM_QUESTIONS.length)];
  return `💪 Day ${streak}/${targetDays} checked in! 🤔 ${q}`;
}

function loadMilestone() {
  try {
    const raw = localStorage.getItem("milestone");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return checkMilestoneDayGap(data);
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

function checkMilestoneNotice() {
  try {
    const notice = localStorage.getItem("milestoneNotice");
    if (notice) {
      localStorage.removeItem("milestoneNotice");
      setTimeout(() => {
        showToast(notice, "warning", 6000);
      }, 500);
    }
  } catch (e) {}
}

// Logic Evaluasi Strikes dan Missed Days
function checkMilestoneDayGap(data) {
  if (!data) return null;

  // Jika milestone sudah TAMAT / COMPLETED (hfinal reached):
  if (data.completed) {
    return data;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const referenceDateStr = data.lastCheckedDate || data.createdDate || todayStr;
  const lastDate = new Date(referenceDateStr + "T00:00:00");
  const todayDate = new Date(todayStr + "T00:00:00");
  
  const diffTime = todayDate - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0 || diffDays === 1) {
    // Today or yesterday checked in
  } else if (diffDays === 2) {
    // Missed 1 day -> Warning / 1 Strike!
    if (data.strikes < 1) {
      data.strikes = 1;
    }
  } else if (diffDays >= 3) {
    // Missed 2+ days -> Auto-Delete Milestone!
    try {
      localStorage.setItem(
        "milestoneNotice",
        `🗑️ Milestone "${data.title}" was auto-deleted for missing 2 consecutive days.`
      );
    } catch (e) {}

    localStorage.removeItem("milestone");
    return null;
  }

  localStorage.setItem("milestone", JSON.stringify(data));
  return data;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function checkAllTodosCompleted() {
  if (todos.length > 0 && todos.every((t) => t.completed)) {
    showToast("🎉 All tasks completed for today! Awesome work!", "success", 4500);
  }
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
    if (todo.completed) {
      checkAllTodosCompleted();
    }
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const newText = prompt("Edit your task:", todo.text);
  if (newText !== null && newText.trim() !== "") {
    todo.text = newText.trim();
    saveTodos();
    renderTodos();
  }
}

// Format Tampilan Tag Tanggal Jadwal (e.g., 📅 04 Aug 15:00)
function formatScheduleTag(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const dateFormatted = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `<span class="task-schedule-tag" title="Scheduled: ${dateStr}">📅 ${dateFormatted} ${timeFormatted}</span>`;
  } catch {
    return "";
  }
}

// --- FUNGSI RENDER MILESTONE BANNER ---
function renderMilestone() {
  const container = document.getElementById("milestoneContainer");
  if (!container) return;

  if (!milestone) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4px 0;">
        <button id="setupMilestoneBtn" class="setup-milestone-link">
          🏆 Setup Milestone / Habit Target
        </button>
      </div>
    `;
    const btn = document.getElementById("setupMilestoneBtn");
    if (btn) btn.addEventListener("click", promptCreateMilestone);
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const isCheckedToday = milestone.lastCheckedDate === todayStr;
  const progressPercent = Math.min(100, Math.round((milestone.currentStreak / milestone.targetDays) * 100));

  let cardClass = "milestone-card";
  let statusBadge = `<span class="milestone-badge fire">🔥 ${milestone.currentStreak} Days</span>`;
  let strikeBadge = "";

  if (milestone.completed) {
    cardClass += " completed";
    statusBadge = `<span class="milestone-badge completed-badge">🏆 COMPLETED (${milestone.targetDays}/${milestone.targetDays} Days)</span>`;
  } else if (milestone.failed) {
    cardClass += " failed";
    statusBadge = `<span class="milestone-badge strike-fail">🚨 FAILED</span>`;
    strikeBadge = `<span class="milestone-badge strike-fail">2 Strikes</span>`;
  } else if (milestone.strikes === 1) {
    cardClass += " warning";
    strikeBadge = `<span class="milestone-badge strike-warn">⚠️ 1 Strike (1 Day Missed)</span>`;
  }

  let actionButtonsHtml = "";
  if (milestone.completed) {
    actionButtonsHtml = `<button class="milestone-btn checkin-btn" disabled style="background: rgba(255, 215, 0, 0.2); border-color: rgba(255, 215, 0, 0.4); color: #ffe082;">🏆 Target Completed!</button>`;
  } else if (milestone.failed) {
    actionButtonsHtml = `<button id="resetMilestoneBtn" class="milestone-btn">↺ Restart</button>`;
  } else {
    actionButtonsHtml = `<button id="checkinMilestoneBtn" class="milestone-btn checkin-btn" ${isCheckedToday ? "disabled" : ""}>
        ${isCheckedToday ? "✓ Done" : "🔥 Check-in"}
      </button>`;
  }

  container.innerHTML = `
    <div class="${cardClass}">
      <div class="milestone-header">
        <div class="milestone-title">
          🏆 ${escapeHtml(milestone.title)}
        </div>
        <div class="milestone-badges">
          ${statusBadge}
          ${strikeBadge}
        </div>
      </div>

      <div class="milestone-progress-bar">
        <div class="milestone-progress-fill" style="width: ${progressPercent}%;"></div>
      </div>

      <div class="milestone-footer">
        <span>Day ${milestone.currentStreak}/${milestone.targetDays} (${progressPercent}%)</span>
        <div class="milestone-footer-actions">
          ${actionButtonsHtml}
          <button id="editMilestoneBtn" class="milestone-btn" title="Edit / Reset Target">⚙️</button>
          <button id="deleteMilestoneBtn" class="milestone-btn delete-milestone-btn" title="Delete Milestone">✕</button>
        </div>
      </div>
    </div>
  `;

  const checkinBtn = document.getElementById("checkinMilestoneBtn");
  if (checkinBtn && !isCheckedToday && !milestone.failed && !milestone.completed) {
    checkinBtn.addEventListener("click", checkInMilestone);
  }

  const resetBtn = document.getElementById("resetMilestoneBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", promptCreateMilestone);
  }

  const editBtn = document.getElementById("editMilestoneBtn");
  if (editBtn) {
    editBtn.addEventListener("click", promptEditMilestoneOptions);
  }

  const deleteBtn = document.getElementById("deleteMilestoneBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteMilestone);
  }
}

function promptCreateMilestone() {
  const title = prompt("Name your Milestone / Habit Target (e.g. Daily Writing):", milestone?.title || "Daily Writing");
  if (!title || !title.trim()) return;

  const target = prompt("Target Days? (e.g. 30):", milestone?.targetDays || "30");
  const targetDays = parseInt(target, 10);
  if (isNaN(targetDays) || targetDays <= 0) return;

  const todayStr = new Date().toISOString().split("T")[0];

  milestone = {
    title: title.trim(),
    targetDays,
    currentStreak: 0,
    strikes: 0,
    createdDate: todayStr,
    lastCheckedDate: null,
    failed: false,
    completed: false,
  };

  saveMilestone();
  renderMilestone();
  showToast(`🏆 Milestone "${milestone.title}" (${targetDays} days) created! Ready to build consistency?`, "success");
}

function checkInMilestone() {
  if (!milestone || milestone.failed || milestone.completed) return;

  const todayStr = new Date().toISOString().split("T")[0];
  if (milestone.lastCheckedDate === todayStr) return;

  milestone.currentStreak += 1;
  milestone.lastCheckedDate = todayStr;
  milestone.strikes = 0;

  if (milestone.currentStreak >= milestone.targetDays) {
    milestone.completed = true;
    milestone.completedDate = todayStr;
  }

  saveMilestone();
  renderMilestone();

  const toastMsg = getDayCheckinQuote(milestone.currentStreak, milestone.targetDays, milestone.title);
  const toastType = milestone.completed ? "celebrate" : "success";
  showToast(toastMsg, toastType, milestone.completed ? 8000 : 5000);
}

function deleteMilestone() {
  if (!confirm(`Delete milestone "${milestone.title}"?\nProgress will be permanently lost.`)) return;
  const oldTitle = milestone.title;
  milestone = null;
  saveMilestone();
  renderMilestone();
  showToast(`🗑️ Milestone "${oldTitle}" has been deleted.`, "warning", 3000);
}

function promptEditMilestoneOptions() {
  const choice = confirm(`Milestone: ${milestone.title}\nStreak: ${milestone.currentStreak} Days\n\nClick OK to Edit/Reset target, or CANCEL to stay.`);
  if (choice) {
    promptCreateMilestone();
  }
}

// --- FUNGSI RENDER UTAMA TODO ---
function renderTodos() {
  const todoList = document.getElementById("todoList");
  const todoStats = document.getElementById("todoStats");
  if (!todoList) return;

  if (!todos.length) {
    if (todoStats) todoStats.textContent = "0 tugas · 0 selesai";
    todoList.innerHTML = "";
    return;
  }

  // 1. Render List Item
  todoList.innerHTML = todos
    .map(
      (t, index) => `
    <div class="todo-item${t.completed ? " completed" : ""}${t.completed && isHidden ? " hidden" : ""}" draggable="true" data-index="${index}">
      <div class="todo-text">
        ${escapeHtml(t.text)}
        ${formatScheduleTag(t.scheduledDate)}
      </div>
        <div class="todo-actions">
          <!-- Tombol Google Calendar -->
          <button class="cal-btn" data-id="${t.id}" title="Jadwalkan ke Google Calendar">📅</button>

          <!-- Tombol Track Stopwatch Task -->
          <button class="track-btn" data-id="${t.id}" title="Track waktu tugas">⏱️</button>
          
          <button class="complete-btn" data-id="${t.id}" title="${
            t.completed ? "Tandai belum selesai" : "Tandai selesai"
          }">${t.completed ? "↩" : "✓"}</button>
          
          <button class="edit-btn" data-id="${t.id}" title="Edit tugas">✎</button>
          
          <button class="delete-btn" data-id="${t.id}" title="Hapus tugas">✕</button>
        </div>
    </div>
  `,
    )
    .join("");

  // 2. Attach Event Listeners
  todoList.querySelectorAll(".todo-item").forEach((item) => {
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragover", dragOver);
    item.addEventListener("dragenter", dragEnter);
    item.addEventListener("dragleave", dragLeave);
    item.addEventListener("drop", dragDrop);
  });

  // Tombol 📅 Google Calendar Modal
  todoList.querySelectorAll(".cal-btn").forEach((btn) =>
    btn.addEventListener("click", () => openGcalModal(Number(btn.dataset.id)))
  );

  // Tombol ⏱️ Track Task Stopwatch
  todoList.querySelectorAll(".track-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (typeof startTaskTracking === "function") {
        startTaskTracking(Number(btn.dataset.id));
      }
    }),
  );

  todoList
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => editTodo(Number(btn.dataset.id))),
    );

  todoList
    .querySelectorAll(".complete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => toggleTodo(Number(btn.dataset.id))),
    );

  todoList
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => deleteTodo(Number(btn.dataset.id))),
    );

  // 3. Render Stats & Toggle Pill
  const completedCount = todos.filter((t) => t.completed).length;
  let statsHtml = `${todos.length} tugas · ${completedCount} selesai`;

  if (completedCount > 0) {
    statsHtml += ` <span id="toggleHideBtn" class="toggle-hide" title="Sembunyikan/Tampilkan">
      ${isHidden ? "Tampilkan" : "Sembunyikan"}
    </span>`;
  }

  if (todoStats) todoStats.innerHTML = statsHtml;

  const toggleBtn = document.getElementById("toggleHideBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isHidden = !isHidden;
      saveIsHidden();
      renderTodos();
    });
  }
}

// --- MODAL GOOGLE CALENDAR LOGIC ---
let selectedGcalTaskId = null;

function openGcalModal(taskId) {
  const task = todos.find((t) => t.id === taskId);
  if (!task) return;

  selectedGcalTaskId = taskId;
  const gcalModal = document.getElementById("gcalModal");
  const gcalTaskTitle = document.getElementById("gcalTaskTitle");
  const gcalDate = document.getElementById("gcalDate");

  if (!gcalModal || !gcalTaskTitle || !gcalDate) return;

  gcalTaskTitle.textContent = task.text;

  // Setup default date/time jika belum ada
  if (task.scheduledDate) {
    gcalDate.value = task.scheduledDate;
  } else {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    // Format YYYY-MM-THH:mm untuk input datetime-local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    gcalDate.value = `${year}-${month}-${day}T${hours}:${mins}`;
  }

  gcalModal.classList.remove("hidden");
}

function closeGcalModal() {
  const gcalModal = document.getElementById("gcalModal");
  if (gcalModal) gcalModal.classList.add("hidden");
  selectedGcalTaskId = null;
}

function saveTaskSchedule(dateVal) {
  if (!selectedGcalTaskId) return;
  const task = todos.find((t) => t.id === selectedGcalTaskId);
  if (task) {
    task.scheduledDate = dateVal;
    saveTodos();
    renderTodos();
  }
}

function launchGoogleCalendar() {
  if (!selectedGcalTaskId) return;
  const task = todos.find((t) => t.id === selectedGcalTaskId);
  const gcalDate = document.getElementById("gcalDate");
  const gcalDuration = document.getElementById("gcalDuration");

  if (!task || !gcalDate || !gcalDate.value) {
    alert("Silakan pilih tanggal dan waktu terlebih dahulu.");
    return;
  }

  const dateVal = gcalDate.value;
  const durationMins = parseInt(gcalDuration?.value || "30", 10);

  saveTaskSchedule(dateVal);

  const startDate = new Date(dateVal);
  const endDate = new Date(startDate.getTime() + durationMins * 60000);

  const toGCalTime = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const dates = `${toGCalTime(startDate)}/${toGCalTime(endDate)}`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    task.text
  )}&dates=${dates}&details=${encodeURIComponent("Tugas dari Productive Tab")}`;

  window.open(url, "_blank");
  closeGcalModal();
}

// --- FUNGSI DRAG AND DROP ---
let dragStartIndex;

function dragStart(e) {
  dragStartIndex = +e.target.closest(".todo-item").dataset.index;
  e.target.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  const item = e.target.closest(".todo-item");
  if (item) item.classList.add("over");
}

function dragLeave(e) {
  const item = e.target.closest(".todo-item");
  if (item) item.classList.remove("over");
}

function dragDrop(e) {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const dragEndIndex = +item.dataset.index;
  item.classList.remove("over");

  const itemToMove = todos[dragStartIndex];
  todos.splice(dragStartIndex, 1);
  todos.splice(dragEndIndex, 0, itemToMove);

  saveTodos();
  renderTodos();
}

// ==========================================
// DOM CONTENT LOADED (EVENT BINDINGS)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  todos = loadTodos();
  milestone = loadMilestone();
  isHidden = loadIsHidden();

  if (todoInput) {
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addTodo();
    });
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({
      id: Date.now(),
      text,
      completed: false,
    });

    saveTodos();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
  }

  function updateTimeAndGreeting() {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (greetingEl) {
      const h = now.getHours();
      greetingEl.textContent =
        h < 12
          ? "Good morning, dollong"
          : h < 15
            ? "Good afternoon, dollong"
            : h < 18
              ? "Good evening, dollong"
              : "Good night, dollong";
    }
  }

  // Bind Event Modal Google Calendar
  const openGcalBtn = document.getElementById("openGcalBtn");
  const saveTaskScheduleBtn = document.getElementById("saveTaskScheduleBtn");
  const closeGcalBtn = document.getElementById("closeGcalBtn");

  if (openGcalBtn) openGcalBtn.addEventListener("click", launchGoogleCalendar);
  if (saveTaskScheduleBtn) {
    saveTaskScheduleBtn.addEventListener("click", () => {
      const gcalDate = document.getElementById("gcalDate");
      if (gcalDate && gcalDate.value) {
        saveTaskSchedule(gcalDate.value);
      }
      closeGcalModal();
    });
  }
  if (closeGcalBtn) closeGcalBtn.addEventListener("click", closeGcalModal);

  // --- COPY KE OBSIDIAN ---
  const copyMdBtn = document.getElementById("copyMdBtn");
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      const dateStr = new Date().toLocaleDateString("en-GB");

      const completedTodos = todos.filter((t) => t.completed);
      const cancelledTodos = todos.filter((t) => !t.completed);

      // Helper kecil buat format detik ke text
      const formatDuration = (sec) => {
        if (!sec || sec <= 0) return "";
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;

        let timeStr = "";
        if (h > 0) timeStr += `${h}h `;
        if (m > 0 || h > 0) timeStr += `${m}m `;
        timeStr += `${String(s).padStart(2, "0")}s`;

        return ` ⏱️ (${timeStr.trim()})`;
      };

      let markdownText = `### Todo list for ${dateStr}\n\n`;

      if (milestone) {
        const statusStr = milestone.failed
          ? "🚨 FAILED"
          : milestone.strikes > 0
          ? "⚠️ 1 STRIKE WARNING"
          : `🔥 ${milestone.currentStreak}-day streak`;
        markdownText += `🏆 **Milestone:** ${milestone.title} — Day ${milestone.currentStreak}/${milestone.targetDays} (${statusStr})\n\n`;
      }

      if (completedTodos.length > 0) {
        completedTodos.forEach((t) => {
          const duration = formatDuration(t.elapsedTime);
          const sched = t.scheduledDate ? ` [📅 ${t.scheduledDate.replace("T", " ")}]` : "";
          markdownText += `- [x] ${t.text}${sched}${duration}\n`;
        });
      } else {
        markdownText += `*(Tidak ada tugas yang selesai)*\n`;
      }

      markdownText += `\n#### Cancelled\n\n`;

      if (cancelledTodos.length > 0) {
        cancelledTodos.forEach((t) => {
          const duration = formatDuration(t.elapsedTime);
          const sched = t.scheduledDate ? ` [📅 ${t.scheduledDate.replace("T", " ")}]` : "";
          markdownText += `- ${t.text}${sched}${duration}\n`;
        });
      } else {
        markdownText += `*(Tidak ada tugas yang dibatalkan)*\n`;
      }

      navigator.clipboard.writeText(markdownText).then(() => {
        const originalText = copyMdBtn.textContent;
        copyMdBtn.textContent = "✅ Tersalin!";

        setTimeout(() => {
          copyMdBtn.textContent = originalText;
        }, 2000);
      });
    });
  }

  // Init UI
  renderMilestone();
  checkMilestoneNotice();
  renderTodos();
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);
});
