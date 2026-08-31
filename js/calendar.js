// ==========================================
// GOOGLE CALENDAR SCHEDULING MODULE
// ==========================================

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

  if (task.scheduledDate) {
    gcalDate.value = task.scheduledDate;
  } else {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
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
    showToast("⚠️ Please select a date and time first.", "warning", 3000);
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

function initCalendarEvents() {
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
}
