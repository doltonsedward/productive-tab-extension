// ==========================================
// MILESTONE HABIT TRACKER MODULE
// ==========================================

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

function checkMilestoneNotice() {
  try {
    const notice = localStorage.getItem("milestoneNotice");
    if (notice) {
      localStorage.removeItem("milestoneNotice");
      setTimeout(() => {
        showToast(notice, "warning", 6000);
      }, 500);
    }
  } catch (e) { }
}

function checkMilestoneDayGap(data) {
  if (!data) return null;

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
    if (data.strikes < 1) {
      data.strikes = 1;
    }
  } else if (diffDays >= 3) {
    try {
      localStorage.setItem(
        "milestoneNotice",
        `🗑️ Milestone "${data.title}" was auto-deleted for missing 2 consecutive days.`
      );
    } catch (e) { }

    localStorage.removeItem("milestone");
    return null;
  }

  localStorage.setItem("milestone", JSON.stringify(data));
  return data;
}

function checkAllTodosCompleted() {
  if (!milestone || milestone.completed || milestone.failed) return;
  if (!todos || todos.length === 0) return;

  const todayStr = new Date().toISOString().split("T")[0];
  if (milestone.lastCheckedDate === todayStr) return;

  const allCompleted = todos.every((t) => t.completed);
  if (allCompleted) {
    checkInMilestone();
  }
}

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

async function promptCreateMilestone() {
  const result = await showFormModal({
    badge: "🏆 Milestone Habit",
    title: milestone ? "Edit Habit Target" : "Create Habit Target",
    message: "Set your daily consistency goal and target days.",
    fields: [
      {
        name: "title",
        label: "Habit Name",
        type: "text",
        value: milestone?.title || "",
        placeholder: "e.g. Daily Writing, Morning Run...",
        required: true,
      },
      {
        name: "targetDays",
        label: "Target Days",
        type: "number",
        value: milestone?.targetDays || 14,
        placeholder: "e.g. 30",
        hint: "Minimum 1 day. Recommended: 14, 30, or 66 days.",
        min: 7,
        max: 365,
        required: true,
      },
    ],
    confirmText: milestone ? "Save Changes" : "Create Milestone",
    cancelText: "Cancel",
  });

  if (!result) return;

  const title = result.title?.trim();
  const targetDays = parseInt(result.targetDays, 10);

  if (!title || isNaN(targetDays) || targetDays <= 0) return;

  const todayStr = new Date().toISOString().split("T")[0];

  milestone = {
    title,
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

async function deleteMilestone() {
  const confirmed = await showConfirmModal({
    badge: "🏆 Milestone Habit",
    title: `Delete "${milestone.title}"?`,
    message: "Your streak and all progress will be permanently lost. This cannot be undone.",
    confirmText: "Delete Target",
    cancelText: "Keep Target",
    isDanger: true,
  });
  if (!confirmed) return;
  const oldTitle = milestone.title;
  milestone = null;
  saveMilestone();
  renderMilestone();
  showToast(`🗑️ Milestone "${oldTitle}" has been deleted.`, "warning", 3000);
}

async function promptEditMilestoneOptions() {
  const confirmed = await showConfirmModal({
    badge: "🏆 Milestone Habit",
    title: "Edit Habit Target?",
    message: `"${milestone.title}" — Current streak is ${milestone.currentStreak} of ${milestone.targetDays} days.`,
    confirmText: "Edit / Reset Target",
    cancelText: "Keep Going",
    isDanger: false,
  });
  if (confirmed) {
    await promptCreateMilestone();
  }
}
