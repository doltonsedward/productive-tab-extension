let todos = [];
let isHidden = false;

// State Milestone Habit Tracker
let milestone = null;

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
    if (Array.isArray(todo.subtasks)) {
      todo.subtasks.forEach((st) => (st.completed = todo.completed));
    }
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

// --- FUNGSI KELOLA SUBTASK & ACCORDION ---
function toggleAccordion(parentId) {
  const todo = todos.find((t) => t.id === parentId);
  if (todo) {
    todo.isExpanded = !todo.isExpanded;
    saveTodos();
    renderTodos();
  }
}

function addSubtask(parentId, text) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !text || !text.trim()) return;

  if (!Array.isArray(todo.subtasks)) todo.subtasks = [];

  todo.subtasks.push({
    id: Date.now(),
    text: text.trim(),
    completed: false,
  });

  todo.isExpanded = true;
  todo.completed = false; // reset completion if new uncompleted subtask added

  saveTodos();
  renderTodos();
}

function toggleSubtask(parentId, subtaskId) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !Array.isArray(todo.subtasks)) return;

  const st = todo.subtasks.find((s) => s.id === subtaskId);
  if (st) {
    st.completed = !st.completed;

    if (todo.subtasks.length > 0) {
      const allDone = todo.subtasks.every((s) => s.completed);
      const wasCompleted = todo.completed;
      todo.completed = allDone;
      if (allDone && !wasCompleted) {
        checkAllTodosCompleted();
      }
    }

    saveTodos();
    renderTodos();
  }
}

function deleteSubtask(parentId, subtaskId) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !Array.isArray(todo.subtasks)) return;

  todo.subtasks = todo.subtasks.filter((s) => s.id !== subtaskId);

  if (todo.subtasks.length > 0) {
    todo.completed = todo.subtasks.every((s) => s.completed);
  }

  saveTodos();
  renderTodos();
}

function editSubtask(parentId, subtaskId) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !Array.isArray(todo.subtasks)) return;

  const st = todo.subtasks.find((s) => s.id === subtaskId);
  if (!st) return;

  const newText = prompt("Edit subtask:", st.text);
  if (newText !== null && newText.trim() !== "") {
    st.text = newText.trim();
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

  // 1. Render List Item dengan Subtask Accordion
  todoList.innerHTML = todos
    .map((t, index) => {
      const subtasks = t.subtasks || [];
      const completedSubtasks = subtasks.filter((s) => s.completed).length;
      const hasSubtasks = subtasks.length > 0;
      const allSubtasksDone = hasSubtasks && completedSubtasks === subtasks.length;

      const subtaskBadge = hasSubtasks
        ? `<span class="subtask-badge${allSubtasksDone ? " all-done" : ""}">${completedSubtasks}/${subtasks.length}</span>`
        : "";

      const accordionIcon = t.isExpanded ? "▼" : "▶";

      return `
    <div class="todo-wrapper${t.completed && isHidden ? " hidden" : ""}">
      <div class="todo-item${t.completed ? " completed" : ""}" draggable="true" data-index="${index}" data-id="${t.id}">
        <button class="accordion-btn${t.isExpanded ? " expanded" : ""}" data-id="${t.id}" title="${t.isExpanded ? "Sembunyikan subtask" : "Tampilkan/tambah subtask"}">
          ${accordionIcon}
        </button>

        <div class="todo-text">
          ${escapeHtml(t.text)}
          ${subtaskBadge}
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

      ${
        t.isExpanded
          ? `
      <div class="subtask-container">
        ${
          hasSubtasks
            ? `<div class="subtask-list">
            ${subtasks
              .map(
                (st) => `
              <div class="subtask-item${st.completed ? " completed" : ""}">
                <input type="checkbox" class="subtask-checkbox" data-parent-id="${t.id}" data-sub-id="${st.id}" ${st.completed ? "checked" : ""}>
                <span class="subtask-text" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Klik untuk toggle, double-click untuk edit">${escapeHtml(st.text)}</span>
                <div class="subtask-actions">
                  <button class="subtask-edit-btn" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Edit subtask">✎</button>
                  <button class="subtask-delete-btn" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Hapus subtask">✕</button>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>`
            : ""
        }
        <div class="subtask-add-row">
          <input type="text" class="subtask-input" data-parent-id="${t.id}" placeholder="+ Tambah subtask... (Enter)" maxlength="80">
        </div>
      </div>
      `
          : ""
      }
    </div>
  `;
    })
    .join("");

  // 2. Attach Event Listeners
  todoList.querySelectorAll(".todo-item").forEach((item) => {
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragover", dragOver);
    item.addEventListener("dragenter", dragEnter);
    item.addEventListener("dragleave", dragLeave);
    item.addEventListener("drop", dragDrop);
  });

  // Tombol Toggle Accordion Subtask
  todoList.querySelectorAll(".accordion-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleAccordion(Number(btn.dataset.id));
    }),
  );

  // Checkbox Subtask & Click/DblClick Subtask Text
  todoList.querySelectorAll(".subtask-checkbox").forEach((cb) =>
    cb.addEventListener("change", () => {
      toggleSubtask(Number(cb.dataset.parentId), Number(cb.dataset.subId));
    }),
  );

  todoList.querySelectorAll(".subtask-text").forEach((stText) => {
    stText.addEventListener("click", () => {
      toggleSubtask(Number(stText.dataset.parentId), Number(stText.dataset.subId));
    });
    stText.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      editSubtask(Number(stText.dataset.parentId), Number(stText.dataset.subId));
    });
  });

  // Edit Subtask Button
  todoList.querySelectorAll(".subtask-edit-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      editSubtask(Number(btn.dataset.parentId), Number(btn.dataset.subId));
    }),
  );

  // Hapus Subtask
  todoList.querySelectorAll(".subtask-delete-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteSubtask(Number(btn.dataset.parentId), Number(btn.dataset.subId));
    }),
  );

  // Tambah Subtask via Input Enter Key
  todoList.querySelectorAll(".subtask-input").forEach((input) =>
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addSubtask(Number(input.dataset.parentId), input.value);
      }
    }),
  );

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
      subtasks: [],
      isExpanded: false,
    });

    saveTodos();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
  }

  function updateTimeAndGreeting() {
    const now = new Date();
    if (timeEl) {
      const use12h = (typeof appSettings !== 'undefined') && appSettings.clockFormat === '12h';
      const showSecs = (typeof appSettings !== 'undefined') && appSettings.showSeconds;
      const timeOpts = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: use12h,
      };
      if (showSecs) timeOpts.second = "2-digit";
      timeEl.textContent = now.toLocaleTimeString("id-ID", timeOpts);
    }

    if (dateEl) {
      const showDate = (typeof appSettings === 'undefined') || appSettings.showDate !== false;
      if (showDate) {
        dateEl.textContent = now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        dateEl.style.display = '';
      } else {
        dateEl.style.display = 'none';
      }
    }

    if (greetingEl) {
      const h = now.getHours();
      const name = (typeof appSettings !== 'undefined' && appSettings.name) ? `, ${appSettings.name}` : '';
      greetingEl.textContent =
        h < 12
          ? `Good morning${name}`
          : h < 15
            ? `Good afternoon${name}`
            : h < 18
              ? `Good evening${name}`
              : `Good night${name}`;
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
          if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach((st) => {
              markdownText += `  - [${st.completed ? "x" : " "}] ${st.text}\n`;
            });
          }
        });
      } else {
        markdownText += `*(Tidak ada tugas yang selesai)*\n`;
      }

      markdownText += `\n#### Cancelled\n\n`;

      if (cancelledTodos.length > 0) {
        cancelledTodos.forEach((t) => {
          const duration = formatDuration(t.elapsedTime);
          const sched = t.scheduledDate ? ` [📅 ${t.scheduledDate.replace("T", " ")}]` : "";
          markdownText += `- [ ] ${t.text}${sched}${duration}\n`;
          if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach((st) => {
              markdownText += `  - [${st.completed ? "x" : " "}] ${st.text}\n`;
            });
          }
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

  // Init Settings & Widget System
  initSettings();
  renderWidgets();
  initSettingsDrawer();
  bindSettingsControls();
});

// ==========================================
// APP SETTINGS SYSTEM
// ==========================================

// Default settings schema - easy to extend
const DEFAULT_SETTINGS = {
  name: "dollong",           // Greeting name
  clockFormat: "24h",        // "24h" | "12h"
  showSeconds: false,        // bool
  showDate: true,            // bool
  activeWidgets: ["quicknotes", "dailyquote"], // ordered list of active widget IDs
  widgetPosition: "right",   // "right" | "left"
  bgType: "default",         // "default" | "preset" | "url" | "custom"
  bgVal: "",                 // URL, base64 data string, or preset key
  bgDim: 40,                 // 0 to 85 percent overlay darkness
  bgBlur: 0,                 // 0 to 25 px blur
};

const BG_PRESETS = {
  default: "bg.png",
  aurora: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop",
  space: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
  mountain: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop",
  cyber: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop",
  dark: "none",
};

let appSettings = { ...DEFAULT_SETTINGS };

function loadSettings() {
  try {
    const raw = localStorage.getItem("appSettings");
    if (!raw) return;
    const saved = JSON.parse(raw);
    appSettings = { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    appSettings = { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem("appSettings", JSON.stringify(appSettings));
}

function initSettings() {
  loadSettings();
  applyWorkspaceLayout();
  applyBackgroundSettings();
}

function applyBackgroundSettings() {
  const type = appSettings.bgType || "default";
  const val = appSettings.bgVal || "";
  const dim = appSettings.bgDim !== undefined ? appSettings.bgDim : 40;
  const blur = appSettings.bgBlur !== undefined ? appSettings.bgBlur : 0;

  // 1. Wallpaper image / background
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
    // Default
    document.body.style.background = `#181c24 url("bg.png") no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
  }

  // 2. Dim Overlay
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
  const hasWidgets = appSettings.activeWidgets.length > 0;
  workspace.classList.toggle("has-widgets", hasWidgets);
  workspace.classList.toggle("widgets-left", appSettings.widgetPosition === "left");
  workspace.classList.toggle("widgets-right", appSettings.widgetPosition === "right");
}

// ==========================================
// WIDGET REGISTRY
// Each widget defines: id, name, icon, desc, render()
// ==========================================

const WIDGET_REGISTRY = {
  quicknotes: {
    id: "quicknotes",
    name: "Quick Notes",
    icon: "📝",
    desc: "Catatan cepat & scratchpad",
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
          <button class="widget-remove-btn" data-remove="quicknotes" title="Hapus widget">✕</button>
        </div>
        <textarea
          id="quickNotesTextarea"
          class="quick-notes-textarea"
          placeholder="Ide cepat, catatan sementara..."
          maxlength="1000"
        >${escapeHtml(saved)}</textarea>
        <div class="quick-notes-footer">
          <span class="quick-notes-autosave" id="quickNotesStatus">✓ Tersimpan</span>
          <button class="quick-notes-clear-btn" id="quickNotesClearBtn">Hapus semua</button>
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
          if (textarea && confirm("Hapus semua catatan?")) {
            textarea.value = "";
            localStorage.removeItem("quickNotes");
            showToast("📝 Quick Notes dibersihkan.", "info", 2000);
          }
        });
      }
    }
  },

  dailyquote: {
    id: "dailyquote",
    name: "Daily Quote",
    icon: "💡",
    desc: "Inspirasi & kutipan harian",
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
      // Deterministic per day, but can be refreshed manually
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
          <button class="widget-remove-btn" data-remove="dailyquote" title="Hapus widget">✕</button>
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
    desc: "Ringkasan produktivitas harian",
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
          <button class="widget-remove-btn" data-remove="focusstats" title="Hapus widget">✕</button>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${doneTasks}</div>
            <div class="stat-label">Selesai</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalTasks}</div>
            <div class="stat-label">Total Task</div>
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
    desc: "Timer & Stopwatch di samping todo",
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
          <button class="widget-remove-btn" data-remove="timer" title="Hapus widget">✕</button>
        </div>
        <div style="text-align:center; padding: 8px 0;">
          <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-bottom:8px;">
            Gunakan tombol ⏱️ di pojok kanan bawah untuk Timer & Stopwatch lengkap.
          </div>
          <div id="widgetTimerDisplay" style="font-size:1.6rem; font-weight:700; letter-spacing:1px; font-family:Arial,sans-serif;">00:00</div>
        </div>
      `;
      return card;
    },
    afterRender() {
      // Sync display with global timer if available
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

// ==========================================
// WIDGET RENDER ENGINE
// ==========================================

const MAX_WIDGETS = 4;

function renderWidgets() {
  const column = document.getElementById("widgetColumn");
  const addBtn = document.getElementById("addWidgetBtn");
  if (!column) return;

  // Remove all existing widget cards
  column.querySelectorAll(".widget-card").forEach(el => el.remove());

  // Render each active widget
  appSettings.activeWidgets.forEach(widgetId => {
    const def = WIDGET_REGISTRY[widgetId];
    if (!def) return;
    const card = def.render();
    column.insertBefore(card, addBtn);
  });

  // Bind remove buttons
  column.querySelectorAll(".widget-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeWidget(btn.dataset.remove));
  });

  // Run afterRender hooks
  appSettings.activeWidgets.forEach(widgetId => {
    const def = WIDGET_REGISTRY[widgetId];
    if (def && def.afterRender) def.afterRender();
  });

  // Show/hide add button based on max
  if (addBtn) {
    addBtn.classList.toggle("hidden", appSettings.activeWidgets.length >= MAX_WIDGETS);
  }

  // Update workspace layout classes
  applyWorkspaceLayout();

  // Sync settings widget list in drawer
  renderSettingsWidgetList();
}

function addWidget(widgetId) {
  if (appSettings.activeWidgets.length >= MAX_WIDGETS) {
    showToast(`🧩 Maksimal ${MAX_WIDGETS} widget aktif.`, "warning", 2500);
    return;
  }
  if (appSettings.activeWidgets.includes(widgetId)) {
    showToast("Widget ini sudah aktif.", "info", 2000);
    return;
  }
  appSettings.activeWidgets.push(widgetId);
  saveSettings();
  renderWidgets();
  closeWidgetPicker();
  showToast(`🧩 Widget "${WIDGET_REGISTRY[widgetId]?.name}" ditambahkan!`, "success", 2500);
}

function removeWidget(widgetId) {
  appSettings.activeWidgets = appSettings.activeWidgets.filter(id => id !== widgetId);
  saveSettings();
  renderWidgets();
  showToast(`Widget dihapus.`, "info", 2000);
}

// ==========================================
// WIDGET PICKER MODAL
// ==========================================

function openWidgetPicker() {
  const modal = document.getElementById("widgetPickerModal");
  const list = document.getElementById("widgetPickerList");
  if (!modal || !list) return;

  list.innerHTML = "";

  Object.values(WIDGET_REGISTRY).forEach(def => {
    const isActive = appSettings.activeWidgets.includes(def.id);
    const isMax = appSettings.activeWidgets.length >= MAX_WIDGETS;
    const item = document.createElement("button");
    item.className = `widget-picker-item${isActive || isMax ? " disabled" : ""}`;
    item.innerHTML = `
      <span class="widget-picker-item-icon">${def.icon}</span>
      <span class="widget-picker-item-name">${def.name}</span>
      <span class="widget-picker-item-desc">${isActive ? "Aktif" : def.desc}</span>
    `;
    if (!isActive && !isMax) {
      item.addEventListener("click", () => addWidget(def.id));
    }
    list.appendChild(item);
  });

  modal.classList.remove("hidden");
}

function closeWidgetPicker() {
  const modal = document.getElementById("widgetPickerModal");
  if (modal) modal.classList.add("hidden");
}

// ==========================================
// SETTINGS DRAWER
// ==========================================

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
  // Personal tab
  const nameInput = document.getElementById("settingName");
  if (nameInput) nameInput.value = appSettings.name || "";

  // Clock format toggle
  document.querySelectorAll("[data-clock]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.clock === appSettings.clockFormat);
  });

  // Toggles
  const showSecondsEl = document.getElementById("settingShowSeconds");
  if (showSecondsEl) showSecondsEl.checked = !!appSettings.showSeconds;

  const showDateEl = document.getElementById("settingShowDate");
  if (showDateEl) showDateEl.checked = appSettings.showDate !== false;

  // Background presets
  document.querySelectorAll("[data-bg]").forEach(btn => {
    const isSel = (appSettings.bgType === "preset" || appSettings.bgType === "default") && (appSettings.bgVal || "default") === btn.dataset.bg;
    btn.classList.toggle("active", isSel);
  });

  // Background URL input
  const bgUrlInput = document.getElementById("bgUrlInput");
  if (bgUrlInput) {
    bgUrlInput.value = appSettings.bgType === "url" ? appSettings.bgVal || "" : "";
  }

  // Dim slider
  const bgDimSlider = document.getElementById("bgDimSlider");
  const bgDimVal = document.getElementById("bgDimVal");
  if (bgDimSlider && bgDimVal) {
    bgDimSlider.value = appSettings.bgDim !== undefined ? appSettings.bgDim : 40;
    bgDimVal.textContent = `${bgDimSlider.value}%`;
  }

  // Blur slider
  const bgBlurSlider = document.getElementById("bgBlurSlider");
  const bgBlurVal = document.getElementById("bgBlurVal");
  if (bgBlurSlider && bgBlurVal) {
    bgBlurSlider.value = appSettings.bgBlur !== undefined ? appSettings.bgBlur : 0;
    bgBlurVal.textContent = `${bgBlurSlider.value}px`;
  }

  // Widget position toggles
  document.querySelectorAll("[data-widgetpos]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.widgetpos === appSettings.widgetPosition);
  });

  // Refresh widget list in drawer
  renderSettingsWidgetList();
}

function renderSettingsWidgetList() {
  const list = document.getElementById("settingsWidgetList");
  if (!list) return;

  if (appSettings.activeWidgets.length === 0) {
    list.innerHTML = `<p class="settings-hint" style="margin:0;">Belum ada widget aktif. Klik tombol "+" untuk menambahkan.</p>`;
    return;
  }

  list.innerHTML = appSettings.activeWidgets.map(id => {
    const def = WIDGET_REGISTRY[id];
    if (!def) return "";
    return `
      <div class="settings-widget-item">
        <span class="settings-widget-item-icon">${def.icon}</span>
        <span class="settings-widget-item-name">${def.name}</span>
        <button class="settings-widget-item-remove" data-remove-widget="${id}" title="Hapus widget">✕</button>
      </div>
    `;
  }).join("");

  list.querySelectorAll("[data-remove-widget]").forEach(btn => {
    btn.addEventListener("click", () => removeWidget(btn.dataset.removeWidget));
  });
}

function initSettingsDrawer() {
  // Apply any saved settings immediately on load
  syncSettingsUI();
}

function bindSettingsControls() {
  // FAB toggle
  const fab = document.getElementById("toggleSettingsBtn");
  if (fab) fab.addEventListener("click", () => {
    const drawer = document.getElementById("settingsDrawer");
    if (drawer && drawer.classList.contains("open")) {
      closeSettingsDrawer();
    } else {
      openSettingsDrawer();
    }
  });

  // Close button
  const closeBtn = document.getElementById("closeSettingsBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeSettingsDrawer);

  // Backdrop click to close
  const backdrop = document.getElementById("settingsBackdrop");
  if (backdrop) backdrop.addEventListener("click", closeSettingsDrawer);

  // Tab switching
  document.querySelectorAll(".settings-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".settings-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".settings-tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const tab = document.getElementById(`settingsTab-${btn.dataset.tab}`);
      if (tab) tab.classList.add("active");
    });
  });

  // --- PERSONAL TAB ---
  // Name input
  const nameInput = document.getElementById("settingName");
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      appSettings.name = nameInput.value.trim();
      saveSettings();
    });
  }

  // Clock format (24h / 12h)
  document.querySelectorAll("[data-clock]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-clock]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      appSettings.clockFormat = btn.dataset.clock;
      saveSettings();
    });
  });

  // Show Seconds toggle
  const showSecondsEl = document.getElementById("settingShowSeconds");
  if (showSecondsEl) {
    showSecondsEl.addEventListener("change", () => {
      appSettings.showSeconds = showSecondsEl.checked;
      saveSettings();
    });
  }

  // Show Date toggle
  const showDateEl = document.getElementById("settingShowDate");
  if (showDateEl) {
    showDateEl.addEventListener("change", () => {
      appSettings.showDate = showDateEl.checked;
      saveSettings();
    });
  }

  // --- BACKGROUND TAB ---
  // Presets
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

  // URL apply
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
      showToast("🖼️ Custom URL background diterapkan!", "success", 2500);
    });
  }

  // File Upload
  const bgUploadBtn = document.getElementById("bgUploadBtn");
  const bgFileInput = document.getElementById("bgFileInput");
  if (bgUploadBtn && bgFileInput) {
    bgUploadBtn.addEventListener("click", () => bgFileInput.click());
    bgFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast("⚠️ Ukuran file maksimal 5MB.", "warning", 3000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        document.querySelectorAll("[data-bg]").forEach(b => b.classList.remove("active"));
        appSettings.bgType = "custom";
        appSettings.bgVal = dataUrl;
        saveSettings();
        applyBackgroundSettings();
        showToast("🖼️ Custom background gambar berhasil dipasang!", "success", 2500);
      };
      reader.readAsDataURL(file);
      bgFileInput.value = "";
    });
  }

  // Dim Slider
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

  // Blur Slider
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

  // --- WIDGETS TAB ---
  // Widget position
  document.querySelectorAll("[data-widgetpos]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-widgetpos]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      appSettings.widgetPosition = btn.dataset.widgetpos;
      saveSettings();
      applyWorkspaceLayout();
    });
  });

  // Add widget button
  const addWidgetBtn = document.getElementById("addWidgetBtn");
  if (addWidgetBtn) addWidgetBtn.addEventListener("click", openWidgetPicker);

  // Widget picker close
  const closePickerBtn = document.getElementById("closeWidgetPickerBtn");
  if (closePickerBtn) closePickerBtn.addEventListener("click", closeWidgetPicker);

  // Close picker on backdrop click
  const pickerModal = document.getElementById("widgetPickerModal");
  if (pickerModal) {
    pickerModal.addEventListener("click", (e) => {
      if (e.target === pickerModal) closeWidgetPicker();
    });
  }

  // --- DATA TAB ---
  // Export
  const exportBtn = document.getElementById("exportDataBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = {
        todos: JSON.parse(localStorage.getItem("todos") || "[]"),
        milestone: JSON.parse(localStorage.getItem("milestone") || "null"),
        appSettings: JSON.parse(localStorage.getItem("appSettings") || "{}"),
        quickNotes: localStorage.getItem("quickNotes") || "",
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
      showToast("💾 Data berhasil diekspor!", "success", 3000);
    });
  }

  // Import
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
          if (data.isHidden !== undefined) localStorage.setItem("isHidden", data.isHidden);
          showToast("📥 Data berhasil diimpor! Halaman akan di-reload...", "success", 2000);
          setTimeout(() => location.reload(), 2200);
        } catch {
          showToast("❌ File tidak valid. Pastikan format JSON benar.", "danger", 4000);
        }
      };
      reader.readAsText(file);
      importFile.value = "";
    });
  }

  // Reset all
  const resetBtn = document.getElementById("resetAllDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("⚠️ Yakin ingin menghapus SEMUA data?\n\nTodos, milestone, settings, dan catatan akan terhapus permanen.")) return;
      localStorage.clear();
      sessionStorage.clear();
      showToast("🗑️ Semua data dihapus. Reload...", "warning", 2000);
      setTimeout(() => location.reload(), 2200);
    });
  }
}

