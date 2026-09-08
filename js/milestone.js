// ==========================================
// MILESTONE HABIT TRACKER MODULE
// ==========================================

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

  const q = (typeof getRandomReflectionQuestion === "function")
    ? getRandomReflectionQuestion()
    : "What habit today will your future self thank you for?";
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

function renderMilestone(justCheckedInDay = null) {
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
    actionButtonsHtml = `<button id="startNextMilestoneBtn" class="milestone-btn checkin-btn" style="background: rgba(255, 215, 0, 0.18); border-color: rgba(255, 215, 0, 0.45); color: #ffe082;">🏆 Start Next Milestone</button>`;
  } else if (milestone.failed) {
    actionButtonsHtml = `<button id="retryMilestoneBtn" class="milestone-btn">↺ Try Again</button>`;
  } else {
    actionButtonsHtml = `<button id="checkinMilestoneBtn" class="milestone-btn checkin-btn" ${isCheckedToday ? "disabled" : ""}>
        ${isCheckedToday ? "✓ Done" : "🔥 Check-in"}
      </button>`;
  }

  const restartBtnHtml = (!milestone.completed)
    ? `<button id="resetMilestoneBtn" class="milestone-btn" title="Reset & Start New Target">↺</button>`
    : "";

  // DEV-MODE: Remove or hide on finalization
  const debugBtnHtml = `<button id="debugStepMilestoneBtn" class="milestone-btn debug-btn" title="Debug Step: Left-click for +1 Day (animates fill) · Right-click to reset to Day 0">⚡ +1</button>`;

  const totalCapsules = milestone.targetDays <= 60 ? milestone.targetDays : 50;
  const isScaled = milestone.targetDays > 60;
  const filledCount = milestone.completed
    ? totalCapsules
    : (isScaled
        ? Math.min(totalCapsules, Math.round((milestone.currentStreak / milestone.targetDays) * totalCapsules))
        : Math.min(milestone.currentStreak, totalCapsules));

  let capsulesHtml = "";
  for (let i = 1; i <= totalCapsules; i++) {
    const ratio = totalCapsules > 1 ? ((i - 1) / (totalCapsules - 1)).toFixed(2) : "1";
    const isFilled = i <= filledCount;
    const isTodayPending = !isCheckedToday && !milestone.completed && !milestone.failed && (i === filledCount + 1);
    const isJustCheckedIn = justCheckedInDay !== null && i === filledCount;

    let classes = "milestone-capsule";
    let tooltip = isScaled
      ? `Progress ~${Math.round((i / totalCapsules) * 100)}%`
      : `Day ${i} of ${milestone.targetDays}`;

    if (isFilled) {
      classes += " filled";
      if (isJustCheckedIn) {
        classes += " just-checked-in";
      }
      tooltip += " · Completed";
    } else if (isTodayPending) {
      classes += " today-pending";
      tooltip += " · Today (Pending Check-in)";
    } else {
      tooltip += " · Upcoming";
    }

    capsulesHtml += `<div class="${classes}" style="--c-ratio: ${ratio};" title="${escapeHtml(tooltip)}"></div>`;
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

      <div class="milestone-capsules ${totalCapsules > 30 ? "compact-gap" : ""}">
        ${capsulesHtml}
      </div>

      <div class="milestone-footer">
        <span>Day ${milestone.currentStreak}/${milestone.targetDays} (${progressPercent}%)</span>
        <div class="milestone-footer-actions">
          ${actionButtonsHtml}
          ${debugBtnHtml}
          ${restartBtnHtml}
          <button id="deleteMilestoneBtn" class="milestone-btn delete-milestone-btn" title="Delete Milestone">✕</button>
        </div>
      </div>
    </div>
  `;

  if (justCheckedInDay !== null) {
    setTimeout(() => {
      const animatingEl = container.querySelector(".milestone-capsule.just-checked-in");
      if (animatingEl) {
        animatingEl.classList.remove("just-checked-in");
      }
    }, 1100);
  }

  const checkinBtn = document.getElementById("checkinMilestoneBtn");
  if (checkinBtn && !isCheckedToday && !milestone.failed && !milestone.completed) {
    checkinBtn.addEventListener("click", checkInMilestone);
  }

  // DEV-MODE: Remove or hide on finalization
  const debugStepBtn = document.getElementById("debugStepMilestoneBtn");
  if (debugStepBtn) {
    debugStepBtn.addEventListener("click", () => checkInMilestone(true));
    debugStepBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (!milestone) return;
      milestone.currentStreak = 0;
      milestone.lastCheckedDate = null;
      milestone.completed = false;
      milestone.failed = false;
      milestone.strikes = 0;
      saveMilestone();
      renderMilestone();
      showToast("⚡ Debug: Reset streak to Day 0", "info", 1500);
    });
  }

  const startNextBtn = document.getElementById("startNextMilestoneBtn");
  if (startNextBtn) {
    startNextBtn.addEventListener("click", () => promptCreateMilestone(true));
  }

  const retryBtn = document.getElementById("retryMilestoneBtn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => promptCreateMilestone(true));
  }

  const resetBtn = document.getElementById("resetMilestoneBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => promptCreateMilestone(true));
  }

  const deleteBtn = document.getElementById("deleteMilestoneBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteMilestone);
  }
}

async function promptCreateMilestone(isRestart = false) {
  const isExisting = Boolean(milestone && isRestart);
  const message = isExisting
    ? `Starting a new target will end your current streak (${milestone.currentStreak}/${milestone.targetDays} days).`
    : "Set your daily consistency goal and target days.";

  const result = await showFormModal({
    badge: "🏆 Milestone Habit",
    title: isExisting ? "Start New Habit Target" : "Create Habit Target",
    message: message,
    fields: [
      {
        name: "title",
        label: "Habit Name",
        type: "text",
        value: "",
        placeholder: "e.g. Daily Writing, Morning Run, 20-min Reading...",
        required: true,
      },
      {
        name: "targetDays",
        label: "Target Days",
        type: "number",
        value: 14,
        placeholder: "e.g. 14",
        hint: "Minimum 1 day. Recommended: 14, 21, 30, or 66 days.",
        min: 1,
        max: 365,
        required: true,
      },
    ],
    confirmText: isExisting ? "Start New Target" : "Start Habit Tracker",
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
  showToast(`🏆 Milestone "${milestone.title}" (${targetDays} days) started! Ready to build consistency?`, "success");
}

function checkInMilestone(isBypassLock = false) {
  if (!milestone) return;

  // If already completed or failed, clicking debug step (+1) restarts from Day 0 for seamless loop testing
  if (isBypassLock && (milestone.completed || milestone.failed)) {
    milestone.completed = false;
    milestone.failed = false;
    milestone.currentStreak = 0;
    milestone.lastCheckedDate = null;
    milestone.strikes = 0;
    saveMilestone();
    renderMilestone();
    showToast("⚡ Reset to Day 0. Ready to test again!", "info", 2000);
    return;
  }

  if (milestone.failed || milestone.completed) return;

  const todayStr = new Date().toISOString().split("T")[0];
  if (!isBypassLock && milestone.lastCheckedDate === todayStr) return;

  milestone.currentStreak += 1;
  milestone.lastCheckedDate = todayStr;
  milestone.strikes = 0;

  if (milestone.currentStreak >= milestone.targetDays) {
    milestone.completed = true;
    milestone.completedDate = todayStr;
  }

  saveMilestone();
  renderMilestone(milestone.currentStreak);

  const showModal = localStorage.getItem("showReflectionModal") !== "false";
  const isEligibleForModal = milestone.currentStreak >= 3 || milestone.completed;
  const question = (typeof getRandomReflectionQuestion === "function")
    ? getRandomReflectionQuestion()
    : "What habit today will your future self thank you for?";

  if (showModal && isEligibleForModal && typeof showReflectionModal === "function") {
    setTimeout(() => {
      showReflectionModal({
        streak: milestone.currentStreak,
        targetDays: milestone.targetDays,
        title: milestone.title,
        question: question,
      });
    }, 950);
  } else {
    const toastMsg = getDayCheckinQuote(milestone.currentStreak, milestone.targetDays, milestone.title);
    const toastType = milestone.completed ? "celebrate" : "success";
    showToast(toastMsg, toastType, milestone.completed ? 8000 : 5000);
  }
}

async function deleteMilestone() {
  const confirmed = await showConfirmModal({
    badge: "🏆 Milestone Habit",
    title: `Delete "${milestone.title}"?`,
    message: `Your current streak of ${milestone.currentStreak}/${milestone.targetDays} days will be permanently lost. This cannot be undone.`,
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
