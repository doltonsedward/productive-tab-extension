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

function loadMilestone() {
  try {
    const data = JSON.parse(localStorage.getItem("milestone"));
    if (!data) return null;
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

// Logic Evaluasi Strikes dan Missed Days
function checkMilestoneDayGap(data) {
  if (!data || data.failed || !data.lastCheckedDate) return data;

  const todayStr = new Date().toISOString().split("T")[0];
  const lastDate = new Date(data.lastCheckedDate + "T00:00:00");
  const todayDate = new Date(todayStr + "T00:00:00");
  
  const diffTime = todayDate - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Kemarin sudah check in, hari ini giliran check in lagi.
  } else if (diffDays === 2) {
    // Lewat 1 hari tanpa check-in -> Warning / 1 Strike!
    if (data.strikes < 1) {
      data.strikes = 1;
    }
  } else if (diffDays >= 3) {
    // Lewat 2+ hari tanpa check-in -> Fail total! Reset streak ke 0
    data.strikes = 2;
    data.failed = true;
  }

  saveMilestone();
  return data;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const newText = prompt("Ubah tugas kamu:", todo.text);
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
    const dateFormatted = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
    const timeFormatted = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `<span class="task-schedule-tag" title="Tersedul: ${dateStr}">📅 ${dateFormatted} ${timeFormatted}</span>`;
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
          🏆 Setup Milestone / Target Habit
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
  let statusBadge = `<span class="milestone-badge fire">🔥 ${milestone.currentStreak} Hari</span>`;
  let strikeBadge = "";

  if (milestone.failed) {
    cardClass += " failed";
    statusBadge = `<span class="milestone-badge strike-fail">🚨 GAGAL</span>`;
    strikeBadge = `<span class="milestone-badge strike-fail">2 Strike</span>`;
  } else if (milestone.strikes === 1) {
    cardClass += " warning";
    strikeBadge = `<span class="milestone-badge strike-warn">⚠️ 1 Strike</span>`;
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
        <span>Hari ${milestone.currentStreak}/${milestone.targetDays} (${progressPercent}%)</span>
        <div class="milestone-footer-actions">
          ${
            milestone.failed
              ? `<button id="resetMilestoneBtn" class="milestone-btn">↺ Mulai Ulang</button>`
              : `<button id="checkinMilestoneBtn" class="milestone-btn checkin-btn" ${isCheckedToday ? "disabled" : ""}>
                  ${isCheckedToday ? "✓ Done" : "🔥 Check-in"}
                </button>`
          }
          <button id="editMilestoneBtn" class="milestone-btn" title="Edit Milestone">⚙️</button>
          <button id="deleteMilestoneBtn" class="milestone-btn delete-milestone-btn" title="Hapus Milestone">✕</button>
        </div>
      </div>
    </div>
  `;

  const checkinBtn = document.getElementById("checkinMilestoneBtn");
  if (checkinBtn && !isCheckedToday && !milestone.failed) {
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
  const title = prompt("Nama Milestone / Target Habit kamu (misal: Habit Menulis):", milestone?.title || "Habit Menulis");
  if (!title || !title.trim()) return;

  const target = prompt("Target Berapa Hari? (misal: 30):", milestone?.targetDays || "30");
  const targetDays = parseInt(target, 10);
  if (isNaN(targetDays) || targetDays <= 0) return;

  milestone = {
    title: title.trim(),
    targetDays,
    currentStreak: 0,
    strikes: 0,
    lastCheckedDate: null,
    failed: false,
  };

  saveMilestone();
  renderMilestone();
}

function checkInMilestone() {
  if (!milestone || milestone.failed) return;

  const todayStr = new Date().toISOString().split("T")[0];
  if (milestone.lastCheckedDate === todayStr) return;

  milestone.currentStreak += 1;
  milestone.lastCheckedDate = todayStr;

  // Jika sebelumnya ada strike tapi berhasil checkin hari ini, strike dibersihkan
  milestone.strikes = 0;

  saveMilestone();
  renderMilestone();
}

function deleteMilestone() {
  if (!confirm(`Hapus milestone "${milestone.title}"?\nProgress akan hilang permanen.`)) return;
  milestone = null;
  saveMilestone();
  renderMilestone();
}

function promptEditMilestoneOptions() {
  const choice = confirm(`Milestone: ${milestone.title}\nStreak: ${milestone.currentStreak} Hari\n\nKlik OK untuk Edit/Reset target, atau CANCEL untuk batal.`);
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
  renderTodos();
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);
});
