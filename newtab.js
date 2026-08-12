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

// Strike and Missed Days Evaluation Logic
function checkMilestoneDayGap(data) {
  if (!data) return null;

  // If milestone is COMPLETED (final day reached):
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

// --- SUBTASK & ACCORDION MANAGEMENT FUNCTIONS ---
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

// Schedule Date Tag Display Format (e.g., 📅 04 Aug 15:00)
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

// --- MILESTONE BANNER RENDER FUNCTIONS ---
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

// --- MAIN TODO RENDER FUNCTION ---
function renderTodos() {
  const todoList = document.getElementById("todoList");
  const todoStats = document.getElementById("todoStats");
  if (!todoList) return;

  if (!todos.length) {
    if (todoStats) todoStats.textContent = "0 tasks · 0 completed";
    todoList.innerHTML = "";
    return;
  }

  // 1. Render List Item with Subtask Accordion
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
        <button class="accordion-btn${t.isExpanded ? " expanded" : ""}" data-id="${t.id}" title="${t.isExpanded ? "Hide subtasks" : "Show/add subtasks"}">
          ${accordionIcon}
        </button>

        <div class="todo-text">
          ${escapeHtml(t.text)}
          ${subtaskBadge}
          ${formatScheduleTag(t.scheduledDate)}
        </div>

        <div class="todo-actions">
          <!-- Google Calendar Button -->
          <button class="cal-btn" data-id="${t.id}" title="Schedule in Google Calendar">📅</button>

          <!-- Task Stopwatch Tracking Button -->
          <button class="track-btn" data-id="${t.id}" title="Track task time">⏱️</button>
          
          <button class="complete-btn" data-id="${t.id}" title="${
            t.completed ? "Mark incomplete" : "Mark complete"
          }">${t.completed ? "↩" : "✓"}</button>
          
          <button class="edit-btn" data-id="${t.id}" title="Edit task">✎</button>
          
          <button class="delete-btn" data-id="${t.id}" title="Delete task">✕</button>
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
                <span class="subtask-text" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Click to toggle, double-click to edit">${escapeHtml(st.text)}</span>
                <div class="subtask-actions">
                  <button class="subtask-edit-btn" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Edit subtask">✎</button>
                  <button class="subtask-delete-btn" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Delete subtask">✕</button>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>`
            : ""
        }
        <div class="subtask-add-row">
          <input type="text" class="subtask-input" data-parent-id="${t.id}" placeholder="+ Add subtask... (Enter)" maxlength="80">
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

  // Subtask Accordion Toggle Button
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

  // Delete Subtask
  todoList.querySelectorAll(".subtask-delete-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteSubtask(Number(btn.dataset.parentId), Number(btn.dataset.subId));
    }),
  );

  // Add Subtask via Input Enter Key
  todoList.querySelectorAll(".subtask-input").forEach((input) =>
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addSubtask(Number(input.dataset.parentId), input.value);
      }
    }),
  );

  // 📅 Google Calendar Modal Button
  todoList.querySelectorAll(".cal-btn").forEach((btn) =>
    btn.addEventListener("click", () => openGcalModal(Number(btn.dataset.id)))
  );

  // ⏱️ Track Task Stopwatch Button
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
  let statsHtml = `${todos.length} tasks · ${completedCount} completed`;

  if (completedCount > 0) {
    statsHtml += ` <span id="toggleHideBtn" class="toggle-hide" title="Hide/Show">
      ${isHidden ? "Show" : "Hide"}
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

  // Setup default date/time if not set
  if (task.scheduledDate) {
    gcalDate.value = task.scheduledDate;
  } else {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    // Format YYYY-MM-THH:mm for datetime-local input
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
    alert("Please select a date and time first.");
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
  )}&dates=${dates}&details=${encodeURIComponent("Task from Productive Tab")}`;

  window.open(url, "_blank");
  closeGcalModal();
}

// --- DRAG AND DROP FUNCTIONS ---
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
      timeEl.textContent = now.toLocaleTimeString("en-US", timeOpts);
    }

    if (dateEl) {
      const showDate = (typeof appSettings === 'undefined') || appSettings.showDate !== false;
      if (showDate) {
        dateEl.textContent = now.toLocaleDateString("en-US", {
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

  // Bind Google Calendar Modal Events
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

  // --- COPY TO OBSIDIAN ---
  const copyMdBtn = document.getElementById("copyMdBtn");
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      const dateStr = new Date().toLocaleDateString("en-GB");

      const completedTodos = todos.filter((t) => t.completed);
      const cancelledTodos = todos.filter((t) => !t.completed);

      // Small helper to format seconds into text
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
        markdownText += `*(No completed tasks)*\n`;
      }

      markdownText += `\n#### Incomplete\n\n`;

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
        markdownText += `*(No incomplete tasks)*\n`;
      }

      navigator.clipboard.writeText(markdownText).then(() => {
        const originalText = copyMdBtn.textContent;
        copyMdBtn.textContent = "✅ Copied!";

        setTimeout(() => {
          copyMdBtn.textContent = originalText;
        }, 2000);
      });
    });
  }

  // Init UI
  try { renderMilestone(); } catch(e) { console.error("Milestone init error:", e); }
  try { checkMilestoneNotice(); } catch(e) { console.error("Notice error:", e); }
  try { renderTodos(); } catch(e) { console.error("Todos init error:", e); }
  try { updateTimeAndGreeting(); } catch(e) { console.error("Time init error:", e); }
  setInterval(updateTimeAndGreeting, 1000);

  // Init Settings & Widget System
  try { initSettings(); } catch(e) { console.error("Settings init error:", e); }
  try { renderWidgets(); } catch(e) { console.error("Widgets render error:", e); }
  try { initSettingsDrawer(); } catch(e) { console.error("Drawer init error:", e); }
  try { bindSettingsControls(); } catch(e) { console.error("Settings bind error:", e); }
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
  widgetSlots: {
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
  dark: "none",
};

let appSettings = { ...DEFAULT_SETTINGS };

function loadSettings() {
  try {
    const raw = localStorage.getItem("appSettings");
    if (!raw) return;
    const saved = JSON.parse(raw);
    
    // Auto-migrate old activeWidgets array format to dual slots
    if (Array.isArray(saved.activeWidgets)) {
      const left = saved.activeWidgets.slice(0, 2);
      const right = saved.activeWidgets.slice(2, 4);
      saved.widgetSlots = { left, right };
      delete saved.activeWidgets;
    }

    appSettings = {
      ...DEFAULT_SETTINGS,
      ...saved,
      widgetSlots: {
        left: Array.isArray(saved.widgetSlots?.left) ? saved.widgetSlots.left : [...DEFAULT_SETTINGS.widgetSlots.left],
        right: Array.isArray(saved.widgetSlots?.right) ? saved.widgetSlots.right : [...DEFAULT_SETTINGS.widgetSlots.right],
      }
    };
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
    document.body.style.background = `#181c24 url("background/default.png") no-repeat center center fixed`;
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
  const leftCount = appSettings.widgetSlots?.left?.length || 0;
  const rightCount = appSettings.widgetSlots?.right?.length || 0;
  const hasWidgets = (leftCount + rightCount) > 0;
  workspace.classList.toggle("has-widgets", hasWidgets);
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

// ==========================================
// DUAL-SLOT WIDGET RENDER & DRAG ENGINE
// ==========================================

const MAX_WIDGETS_PER_SIDE = 2;
let targetAddSide = "right"; // default side for widget picker
let draggedWidgetInfo = null; // { side: 'left'|'right', index: 0|1, widgetId: string }

function renderWidgets() {
  const colLeft = document.getElementById("widgetColumnLeft");
  const colRight = document.getElementById("widgetColumnRight");
  const addBtnLeft = document.getElementById("addWidgetBtnLeft");
  const addBtnRight = document.getElementById("addWidgetBtnRight");

  if (!colLeft || !colRight) return;

  // Clear existing cards
  colLeft.querySelectorAll(".widget-card").forEach(el => el.remove());
  colRight.querySelectorAll(".widget-card").forEach(el => el.remove());

  // Render left column
  appSettings.widgetSlots.left.forEach((widgetId, index) => {
    const card = renderCardForSlot(widgetId, "left", index);
    if (card && addBtnLeft) colLeft.insertBefore(card, addBtnLeft);
  });

  // Render right column
  appSettings.widgetSlots.right.forEach((widgetId, index) => {
    const card = renderCardForSlot(widgetId, "right", index);
    if (card && addBtnRight) colRight.insertBefore(card, addBtnRight);
  });

  // Bind column drop targets
  setupColumnDropTarget(colLeft, "left");
  setupColumnDropTarget(colRight, "right");

  // Run afterRender hooks
  [...appSettings.widgetSlots.left, ...appSettings.widgetSlots.right].forEach(widgetId => {
    const def = WIDGET_REGISTRY[widgetId];
    if (def && def.afterRender) def.afterRender();
  });

  // Toggle add buttons
  if (addBtnLeft) {
    addBtnLeft.classList.toggle("hidden", appSettings.widgetSlots.left.length >= MAX_WIDGETS_PER_SIDE);
    const isEmpty = appSettings.widgetSlots.left.length === 0;
    addBtnLeft.classList.toggle("empty-column-btn", isEmpty);
    const label = addBtnLeft.querySelector(".add-widget-label");
    if (label) label.textContent = isEmpty ? "Left Widget" : "More Widgets";
  }

  if (addBtnRight) {
    addBtnRight.classList.toggle("hidden", appSettings.widgetSlots.right.length >= MAX_WIDGETS_PER_SIDE);
    const isEmpty = appSettings.widgetSlots.right.length === 0;
    addBtnRight.classList.toggle("empty-column-btn", isEmpty);
    const label = addBtnRight.querySelector(".add-widget-label");
    if (label) label.textContent = isEmpty ? "Right Widget" : "More Widgets";
  }

  // Sync settings list
  renderSettingsWidgetList();
}

function renderCardForSlot(widgetId, side, index) {
  const def = WIDGET_REGISTRY[widgetId];
  if (!def) return null;
  const card = def.render();
  card.dataset.widgetId = widgetId;
  card.dataset.side = side;
  card.dataset.index = index;

  // Enhance header with drag handle & action buttons
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

    // Bind action buttons
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

  // Setup HTML5 Drag & Drop
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
    e.stopPropagation(); // Prevent bubbling up to the column drop target
    card.classList.remove("drag-over");

    if (!draggedWidgetInfo) return;
    const { side: srcSide, index: srcIndex, widgetId: srcWidgetId } = draggedWidgetInfo;

    if (srcSide === side && srcIndex === index) return;

    // Swap widget slots!
    const targetWidgetId = appSettings.widgetSlots[side][index];

    appSettings.widgetSlots[srcSide][srcIndex] = targetWidgetId;
    appSettings.widgetSlots[side][index] = srcWidgetId;

    saveSettings();
    renderWidgets();

    // Trigger swap pulse animation
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
    if (e.target.closest(".widget-card")) return; // handled by card drop
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
    // Swap with first widget in target column
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
  const arr = appSettings.widgetSlots[side];
  if (arr.length < 2) return;
  const otherIndex = index === 0 ? 1 : 0;
  const temp = arr[index];
  arr[index] = arr[otherIndex];
  arr[otherIndex] = temp;

  saveSettings();
  renderWidgets();
}

function addWidget(widgetId, side = "right") {
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
  appSettings.widgetSlots.left = appSettings.widgetSlots.left.filter(id => id !== widgetId);
  appSettings.widgetSlots.right = appSettings.widgetSlots.right.filter(id => id !== widgetId);
  saveSettings();
  renderWidgets();
  showToast("Widget removed.", "info", 2000);
}

// ==========================================
// WIDGET PICKER MODAL
// ==========================================

function openWidgetPicker(side = "right") {
  targetAddSide = side;
  const modal = document.getElementById("widgetPickerModal");
  const list = document.getElementById("widgetPickerList");
  if (!modal || !list) return;

  list.innerHTML = "";
  const allActive = [...appSettings.widgetSlots.left, ...appSettings.widgetSlots.right];

  Object.values(WIDGET_REGISTRY).forEach(def => {
    const isActive = allActive.includes(def.id);
    const isTargetFull = appSettings.widgetSlots[targetAddSide].length >= MAX_WIDGETS_PER_SIDE;
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

  const leftActive = appSettings.widgetSlots.left;
  const rightActive = appSettings.widgetSlots.right;
  const total = leftActive.length + rightActive.length;

  if (total === 0) {
    list.innerHTML = `<p class="settings-hint" style="margin:0;">No active widgets. Click the "+" button on the main screen to add one.</p>`;
    return;
  }

  let html = "";

  // Left column group
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

  // Right column group
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
      showToast("🖼️ Custom URL background applied!", "success", 2500);
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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
          
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
  // Add widget buttons (Left & Right)
  const addWidgetBtnLeft = document.getElementById("addWidgetBtnLeft");
  if (addWidgetBtnLeft) addWidgetBtnLeft.addEventListener("click", () => openWidgetPicker("left"));

  const addWidgetBtnRight = document.getElementById("addWidgetBtnRight");
  if (addWidgetBtnRight) addWidgetBtnRight.addEventListener("click", () => openWidgetPicker("right"));

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
      showToast("💾 Data exported successfully!", "success", 3000);
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

  // Reset all
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
}

