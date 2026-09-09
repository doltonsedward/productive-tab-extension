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
    // Today or yesterday — still on track
  } else if (diffDays === 2) {
    if (data.strikes < 1) {
      data.strikes = 1;
    }
  } else if (diffDays >= 3) {
    // Instead of auto-deleting, mark as streak broken and show recovery modal
    data.streakBroken = true;
    data.daysMissed = diffDays - 1;
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

  // Show recovery modal if streak was broken (2+ days missed) — blocks normal render
  if (milestone.streakBroken) {
    container.innerHTML = "";
    showRecoveryModal();
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
    actionButtonsHtml = `
      <button id="keepStreakBtn" class="milestone-btn milestone-btn-keep-streak" title="Continue your streak beyond the original target (+30 days auto-extended)">
        ♾️ Keep Streak
      </button>
      <button id="archiveMilestoneBtn" class="milestone-btn milestone-btn-archive" title="Archive this achievement & start a new habit target">
        🏆 Archive & Next
      </button>
    `;
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



  const keepStreakBtn = document.getElementById("keepStreakBtn");
  if (keepStreakBtn) {
    keepStreakBtn.addEventListener("click", keepStreakMode);
  }

  const archiveBtn = document.getElementById("archiveMilestoneBtn");
  if (archiveBtn) {
    archiveBtn.addEventListener("click", () => showCongratulationsModal());
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
  const subtitleText = isExisting
    ? `Starting a new target will end your current streak (${milestone.currentStreak}/${milestone.targetDays} days).`
    : "Choose a preset or set your own target.";

  const PRESETS = [14, 21, 30, 66];
  const DEFAULT_DAYS = 21;

  const result = await new Promise((resolve) => {
    // Reuse the singleton dialog overlay from DialogManager
    const overlay = document.getElementById("customDialogModal");
    const card = overlay ? overlay.querySelector(".dialog-card") : null;
    if (!overlay || !card) {
      // Graceful fallback to old form modal
      resolve(null);
      return;
    }

    card.classList.remove("dialog-danger");
    card.innerHTML = `
      <span class="dialog-badge">🏆 Milestone Habit</span>
      <h3 class="dialog-title">${isExisting ? "Start New Habit Target" : "Create Habit Target"}</h3>
      <p class="dialog-message">${escapeHtml(subtitleText)}</p>
      <div class="dialog-fields">
        <div class="dialog-field" id="dialogFieldWrap_title">
          <label for="mcp_titleInput">Habit Name</label>
          <input
            type="text"
            id="mcp_titleInput"
            placeholder="e.g. Daily Writing, Morning Run, 20-min Reading..."
            autocomplete="off"
            spellcheck="true"
          />
          <span class="dialog-field-error">This field is required.</span>
        </div>
        <div class="dialog-field" id="dialogFieldWrap_targetDays">
          <label>Target Days</label>
          <div class="mcp-preset-pills" id="mcp_presets">
            ${PRESETS.map(d => `
              <button type="button" class="mcp-preset-pill${d === DEFAULT_DAYS ? " active" : ""}" data-days="${d}">
                ${d}d
              </button>
            `).join("")}
          </div>
          <div class="mcp-custom-row">
            <span class="mcp-custom-label">Custom:</span>
            <input
              type="number"
              id="mcp_daysInput"
              min="1"
              max="100"
              value="${DEFAULT_DAYS}"
              autocomplete="off"
            />
            <span class="mcp-days-unit">days</span>
          </div>
          <span class="dialog-field-hint">Tip: 21d builds a habit, 66d makes it automatic.</span>
          <span class="dialog-field-error">Please enter a valid number between 1 and 100.</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-cancel" id="mcp_cancelBtn">Cancel</button>
        <button class="dialog-btn dialog-btn-confirm" id="mcp_confirmBtn">
          ${isExisting ? "Start New Target" : "Start Habit Tracker"}
        </button>
      </div>
    `;

    overlay.classList.remove("dialog-hidden");

    const titleInput   = card.querySelector("#mcp_titleInput");
    const daysInput    = card.querySelector("#mcp_daysInput");
    const pillsEl      = card.querySelector("#mcp_presets");
    const confirmBtn   = card.querySelector("#mcp_confirmBtn");
    const cancelBtn    = card.querySelector("#mcp_cancelBtn");
    const titleWrap    = card.querySelector("#dialogFieldWrap_title");
    const daysWrap     = card.querySelector("#dialogFieldWrap_targetDays");

    // Auto-focus habit name
    requestAnimationFrame(() => {
      titleInput.focus();
      titleInput.select();
    });

    // Pill ↔ input sync
    pillsEl.addEventListener("click", (e) => {
      const pill = e.target.closest(".mcp-preset-pill");
      if (!pill) return;
      pillsEl.querySelectorAll(".mcp-preset-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      daysInput.value = pill.dataset.days;
      daysWrap.classList.remove("has-error");
    });

    daysInput.addEventListener("input", () => {
      const val = parseInt(daysInput.value, 10);
      pillsEl.querySelectorAll(".mcp-preset-pill").forEach(p => {
        p.classList.toggle("active", parseInt(p.dataset.days, 10) === val);
      });
      daysWrap.classList.remove("has-error");
    });

    // Backdrop dismiss
    const backdropHandler = (e) => {
      if (e.target === overlay) finish(null);
    };
    overlay.addEventListener("click", backdropHandler);

    // Keyboard
    const keyHandler = (e) => {
      if (e.key === "Escape") { e.preventDefault(); finish(null); }
      if (e.key === "Enter" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault(); doConfirm();
      }
    };
    document.addEventListener("keydown", keyHandler);

    function doConfirm() {
      let hasError = false;

      const titleVal = titleInput.value.trim();
      if (!titleVal) {
        titleWrap.classList.add("has-error");
        titleInput.focus();
        hasError = true;
      } else {
        titleWrap.classList.remove("has-error");
      }

      const rawDays = parseInt(daysInput.value, 10);
      if (isNaN(rawDays) || rawDays < 1 || rawDays > 100) {
        daysWrap.classList.add("has-error");
        if (!hasError) daysInput.focus();
        hasError = true;
      } else {
        daysWrap.classList.remove("has-error");
      }

      if (hasError) return;
      finish({ title: titleVal, targetDays: rawDays });
    }

    function finish(value) {
      overlay.removeEventListener("click", backdropHandler);
      document.removeEventListener("keydown", keyHandler);
      overlay.classList.add("dialog-hidden");
      setTimeout(() => { card.innerHTML = ""; }, 280);
      resolve(value);
    }

    confirmBtn.addEventListener("click", doConfirm);
    cancelBtn.addEventListener("click", () => finish(null));
  });

  if (!result) return;

  const { title, targetDays } = result;
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
  showToast(`🏆 "${milestone.title}" — ${targetDays}-day target started! Let's build that habit.`, "success");
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

  // If milestone is completed, launch the Congratulations Modal with gratification question
  if (milestone.completed) {
    setTimeout(() => {
      showCongratulationsModal();
    }, 950);
    return;
  }

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
    message: `Your current streak of ${milestone.currentStreak}/${milestone.targetDays} days will be ended and archived to your timeline.`,
    confirmText: "Delete Target",
    cancelText: "Keep Target",
    isDanger: true,
  });
  if (!confirmed) return;
  const oldTitle = milestone.title;
  const todayStr = new Date().toISOString().split("T")[0];

  // If there was any streak progress, archive it to the timeline as an ended milestone
  if (milestone.currentStreak > 0) {
    let completedHabits = [];
    try {
      completedHabits = JSON.parse(localStorage.getItem("completedHabits") || "[]");
    } catch (e) { completedHabits = []; }

    completedHabits.unshift({
      id: "h_failed_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title: milestone.title,
      targetDays: milestone.targetDays,
      currentStreak: milestone.currentStreak,
      failedDate: todayStr,
      archivedAt: todayStr,
      status: "failed",
      quote: `Streak ended on Day ${milestone.currentStreak} of ${milestone.targetDays}. Every setback is a setup for a stronger comeback.`
    });

    try {
      localStorage.setItem("completedHabits", JSON.stringify(completedHabits));
    } catch (e) { }
  }

  milestone = null;
  saveMilestone();
  renderMilestone();
  showToast(`🗑️ Milestone "${oldTitle}" has been deleted.`, "warning", 3000);
}

function showRecoveryModal() {
  const overlay = document.getElementById("customDialogModal");
  const card = overlay ? overlay.querySelector(".dialog-card") : null;
  if (!overlay || !card || !milestone) return;

  const habitTitle = escapeHtml(milestone.title);
  const daysMissed = milestone.daysMissed || 2;
  const streak = milestone.currentStreak;
  const targetDays = milestone.targetDays;

  card.classList.remove("dialog-danger");
  card.classList.add("milestone-recovery-card");

  card.innerHTML = `
    <span class="dialog-badge" style="background: rgba(255,152,0,0.15); color: #ffb74d; border-color: rgba(255,152,0,0.3);">
      ⚠️ Streak Broken
    </span>
    <h3 class="dialog-title">You missed ${daysMissed} day${daysMissed > 1 ? "s" : ""}</h3>
    <p class="dialog-message milestone-recovery-habit-name">"${habitTitle}"</p>
    <p class="dialog-message" style="margin-top: 4px; font-size: 0.82rem; opacity: 0.7;">
      Your ${streak}-day streak couldn't be saved — but your effort wasn't wasted.
      Every master was once a beginner. What matters is what you do next.
    </p>
    <div class="milestone-recovery-progress">
      <span class="milestone-recovery-progress-label">Progress lost: ${streak} / ${targetDays} days</span>
      <div class="milestone-recovery-bar-track">
        <div class="milestone-recovery-bar-fill" style="width: ${Math.round((streak / targetDays) * 100)}%;"></div>
      </div>
    </div>
    <div class="dialog-actions milestone-recovery-actions">
      <button class="dialog-btn dialog-btn-cancel milestone-recovery-discard" id="recoveryDiscardBtn">
        ✕ Discard Habit
      </button>
      <button class="dialog-btn dialog-btn-confirm" id="recoveryRestartBtn">
        ↺ Restart from Day 1
      </button>
    </div>
  `;

  overlay.classList.remove("dialog-hidden");

  // Deliberately NO backdrop dismiss and NO Escape key — user must choose
  // Remove any existing backdrop listener from DialogManager
  if (overlay._backdropHandler) {
    overlay.removeEventListener("click", overlay._backdropHandler);
    overlay._backdropHandler = null;
  }

  const restartBtn = card.querySelector("#recoveryRestartBtn");
  const discardBtn = card.querySelector("#recoveryDiscardBtn");

  function doRestart() {
    card.classList.remove("milestone-recovery-card");
    overlay.classList.add("dialog-hidden");
    setTimeout(() => { card.innerHTML = ""; }, 280);

    milestone.currentStreak = 0;
    milestone.lastCheckedDate = null;
    milestone.strikes = 0;
    milestone.failed = false;
    milestone.completed = false;
    milestone.streakBroken = false;
    milestone.daysMissed = 0;

    saveMilestone();
    renderMilestone();
    showToast(`🔄 "${milestone.title}" restarted from Day 1. You've got this!`, "info", 4000);
  }

  function doDiscard() {
    card.classList.remove("milestone-recovery-card");
    overlay.classList.add("dialog-hidden");
    setTimeout(() => { card.innerHTML = ""; }, 280);

    const oldTitle = milestone.title;
    const todayStr = new Date().toISOString().split("T")[0];

    // Archive failed milestone to completedHabits
    let completedHabits = [];
    try {
      completedHabits = JSON.parse(localStorage.getItem("completedHabits") || "[]");
    } catch (e) { completedHabits = []; }

    completedHabits.unshift({
      id: "h_failed_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title: milestone.title,
      targetDays: milestone.targetDays,
      currentStreak: milestone.currentStreak,
      failedDate: todayStr,
      archivedAt: todayStr,
      status: "failed",
      quote: `Streak ended on Day ${milestone.currentStreak} of ${milestone.targetDays}. Every setback is feedback to start stronger.`
    });

    try {
      localStorage.setItem("completedHabits", JSON.stringify(completedHabits));
    } catch (e) { }

    milestone = null;
    saveMilestone();
    renderMilestone();
    showToast(`⚠️ "${oldTitle}" archived as streak ended. Ready when you are.`, "warning", 4000);
  }

  if (restartBtn) restartBtn.addEventListener("click", doRestart);
  if (discardBtn) discardBtn.addEventListener("click", doDiscard);
}

// ──────────────────────────────────────────────────────────────────────────────
// Feature B helpers — Victory Ending Card
// ──────────────────────────────────────────────────────────────────────────────

function keepStreakMode() {
  if (!milestone || !milestone.completed) return;
  const extensionDays = 30;
  milestone.targetDays = milestone.currentStreak + extensionDays;
  milestone.completed = false;
  milestone.completedDate = null;
  saveMilestone();
  renderMilestone();
  showToast(`♾️ Streak extended! New target: ${milestone.targetDays} days (+${extensionDays}). Keep going!`, "success", 5000);
}

function showCongratulationsModal() {
  const overlay = document.getElementById("customDialogModal");
  const card = overlay ? overlay.querySelector(".dialog-card") : null;
  if (!overlay || !card || !milestone) return;

  const habitTitle = escapeHtml(milestone.title);
  const targetDays = milestone.targetDays;

  // Rotating gratification / reflection questions
  const GRATIFICATION_QUESTIONS = [
    "Not as hard as you thought, right? What did you learn about yourself along the way?",
    "You stayed the course and finished! What is the single biggest takeaway from building this habit?",
    "Consistency unlocked! What made the real difference between starting and finishing this time?",
    "You proved your self-trust! If you could give one piece of advice to yourself on Day 1, what would it be?",
    "Milestone conquered! How did showing up every single day shift your mindset and focus?",
  ];
  const questionIndex = Math.floor(Math.random() * GRATIFICATION_QUESTIONS.length);
  const selectedQuestion = GRATIFICATION_QUESTIONS[questionIndex];

  // Rotating default inspirational quotes
  const DEFAULT_QUOTES = [
    "Small daily disciplines quietly compound into massive personal transformation.",
    "Discipline is the ultimate bridge between intention and lasting accomplishment.",
    `What felt challenging on Day 1 became second nature by Day ${targetDays}.`,
    "Consistency isn't about never missing; it's about always showing up.",
    "True self-trust comes from keeping the promises you make to yourself.",
  ];
  const quoteIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
  const defaultQuote = DEFAULT_QUOTES[quoteIndex];

  card.className = "dialog-card congrats-modal-card";
  card.classList.remove("dialog-danger");

  card.innerHTML = `
    <h3 class="dialog-title" style="margin-bottom: 2px;">🎉 Congratulations!</h3>
    <p class="congrats-hero-text">
      You successfully finished all <strong>${targetDays} days</strong> of <span class="congrats-habit-name">"${habitTitle}"</span>!
    </p>

    <div class="congrats-reflection-box">
      <label class="congrats-question-label" for="congratsReflectionInput">
        💭 ${escapeHtml(selectedQuestion)}
      </label>
      <textarea id="congratsReflectionInput" class="congrats-textarea" rows="3" placeholder="${escapeHtml(defaultQuote)}"></textarea>
      <div class="congrats-hint">✨ This personal note will be permanently engraved onto your Trophy Timeline.</div>
    </div>

    <div class="dialog-actions" style="justify-content: space-between; gap: 8px;">
      <button class="dialog-btn dialog-btn-secondary" id="congratsKeepStreakBtn" title="Auto-extend this habit target by +30 days and keep rolling">
        ♾️ Keep Streak (+30d)
      </button>
      <button class="dialog-btn dialog-btn-confirm congrats-archive-btn" id="congratsArchiveBtn">
        🏆 Archive to Trophy Shelf
      </button>
    </div>
  `;

  overlay.classList.remove("dialog-hidden");

  const inputEl = card.querySelector("#congratsReflectionInput");
  const keepBtn = card.querySelector("#congratsKeepStreakBtn");
  const archiveBtn = card.querySelector("#congratsArchiveBtn");

  const backdropHandler = (e) => {
    if (e.target === overlay) finish();
  };
  const keyHandler = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      finish();
    }
  };

  overlay.addEventListener("click", backdropHandler);
  document.addEventListener("keydown", keyHandler);

  function finish() {
    overlay.removeEventListener("click", backdropHandler);
    document.removeEventListener("keydown", keyHandler);
    overlay.classList.add("dialog-hidden");
    setTimeout(() => {
      card.innerHTML = "";
      card.className = "dialog-card";
    }, 280);
  }

  if (keepBtn) {
    keepBtn.addEventListener("click", () => {
      finish();
      keepStreakMode();
    });
  }

  if (archiveBtn) {
    archiveBtn.addEventListener("click", async () => {
      const userQuote = inputEl ? (inputEl.value.trim() || defaultQuote) : defaultQuote;
      finish();
      setTimeout(async () => {
        await archiveMilestone(userQuote);
      }, 300);
    });
  }
}

async function archiveMilestone(reflectionText = null) {
  if (!milestone || !milestone.completed) return;

  let completedHabits = [];
  try {
    completedHabits = JSON.parse(localStorage.getItem("completedHabits") || "[]");
  } catch (e) { completedHabits = []; }

  const todayStr = new Date().toISOString().split("T")[0];
  const habitQuote = reflectionText || "Small daily disciplines quietly compound into massive personal transformation.";

  completedHabits.unshift({
    id: "h_comp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    title: milestone.title,
    targetDays: milestone.targetDays,
    currentStreak: milestone.currentStreak,
    completedDate: milestone.completedDate || todayStr,
    archivedAt: todayStr,
    status: "completed",
    quote: habitQuote,
  });

  try {
    localStorage.setItem("completedHabits", JSON.stringify(completedHabits));
  } catch (e) { }

  const archivedTitle = milestone.title;
  milestone = null;
  saveMilestone();
  renderMilestone(); // Crucial: Immediately update dashboard so no dead buttons remain!

  // Turn ON unread notification indicator ONLY when a new milestone is earned
  localStorage.setItem("trophyHubUnread", "true");
  const fab = document.getElementById("trophyHubFabBtn");
  if (fab) fab.classList.add("has-unread");

  showToast(`🏆 "${archivedTitle}" engraved into Trophy Shelf!`, "celebrate", 4500);
}

function showTrophyHubModal() {
  const overlay = document.getElementById("customDialogModal");
  const card = overlay ? overlay.querySelector(".dialog-card") : null;
  if (!overlay || !card) return;

  // Clear unread notification when user opens the hub
  localStorage.removeItem("trophyHubUnread");
  const fab = document.getElementById("trophyHubFabBtn");
  if (fab) fab.classList.remove("has-unread");

  const todayStr = new Date().toISOString().split("T")[0];

  // Load user completed & failed habits
  let userHabits = [];
  try {
    userHabits = JSON.parse(localStorage.getItem("completedHabits") || "[]");
  } catch (e) { userHabits = []; }

  // Ensure every item has a unique ID for deletion identification
  userHabits.forEach((h, idx) => {
    if (!h.id) {
      h.id = "h_" + (h.failedDate || h.completedDate || h.archivedAt || "rec") + "_" + idx;
    }
  });

  const completedHabits = userHabits.filter(h => h.status !== "failed");
  const failedHabits = userHabits.filter(h => h.status === "failed");

  // Aggregate Consistency Stats
  const totalMastered = completedHabits.length;
  const totalDays = completedHabits.reduce((acc, h) => acc + (h.targetDays || h.currentStreak || 0), 0);
  const longestStreak = completedHabits.length
    ? Math.max(...completedHabits.map(h => h.targetDays || h.currentStreak || 0))
    : (milestone ? milestone.currentStreak : 0);

  const hasActiveMilestone = Boolean(milestone && !milestone.completed && !milestone.failed);

  // Achievements Database
  const ACHIEVEMENTS = [
    { id: "first_spark", icon: "🌱", title: "Day One Spark", desc: "Took the first step and logged your initial check-in", unlocked: Boolean((milestone && milestone.currentStreak > 0) || totalMastered > 0 || userHabits.length > 0) },
    { id: "streak_3", icon: "🔥", title: "3-Day Ignition", desc: "Built initial momentum with a 3-day consecutive streak", unlocked: Boolean((milestone && milestone.currentStreak >= 3) || longestStreak >= 3) },
    { id: "streak_7", icon: "⚡", title: "7-Day Unbroken Week", desc: "Completed one full week of consistency without a single strike", unlocked: Boolean((milestone && milestone.currentStreak >= 7) || longestStreak >= 7) },
    { id: "habit_master", icon: "🏆", title: "First Trophy", desc: "Conquered your first full habit target and archived the victory", unlocked: totalMastered > 0 },
    { id: "streak_21", icon: "🧠", title: "21-Day Neural Lock", desc: "Reached the psychological threshold of automatic habit formation", unlocked: Boolean(longestStreak >= 21 || (milestone && milestone.currentStreak >= 21)) },
    { id: "century_master", icon: "👑", title: "100-Day Centurion", desc: "Accumulated 100 total days of dedicated consistency", unlocked: totalDays >= 100 }
  ];
  const unlockedAchievementsCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  // Community Quests Database (empty state until community sync system is active)
  const COMMUNITY_QUESTS = [];

  card.className = "dialog-card trophy-hub-card";
  card.classList.remove("dialog-danger");

  // ── Timeline Empty State (When no habits achieved/attempted yet) ─────────
  const emptyStateHtml = `
    <div class="tv3-empty-state">
      <div class="tv3-empty-icon">🌱</div>
      <div class="tv3-empty-title">Your Consistency Journey Starts Here</div>
      <div class="tv3-empty-desc">Conquer your first habit milestone to start building your permanent timeline of victories.</div>
      ${!hasActiveMilestone ? `
        <button type="button" class="tv3-start-btn" id="hubStartMilestoneBtn">
          🎯 Start Your First Milestone
        </button>
      ` : `
        <div class="tv3-empty-hint">Your active milestone is in progress below. Check in daily to reach the finish line!</div>
      `}
    </div>
  `;

  // ── Timeline Nodes for Recorded Habits ──────────────────────────────────
  const timelineNodesHtml = userHabits.map((h) => {
    const isFailed = h.status === "failed";
    const habitDays = h.targetDays || h.currentStreak || 0;

    if (isFailed) {
      // Redemption logic: Failed milestone can ONLY be deleted if the user
      // has completed a new milestone of at least 14 days on or after the failure date
      const failedTs = new Date(h.failedDate || h.archivedAt || 0).getTime();
      const isRedeemed = userHabits.some(h2 => {
        if (h2.status === "failed") return false;
        if ((h2.targetDays || 0) < 14) return false;
        const compTs = new Date(h2.completedDate || h2.archivedAt || 0).getTime();
        return compTs >= failedTs;
      });

      const quote = h.quote || `Streak ended on Day ${h.currentStreak || 0} of ${h.targetDays}. Every setback is feedback to start stronger.`;

      return `
        <div class="tv3-node failed" data-id="${escapeHtml(h.id)}">
          <div class="tv3-node-dot failed">✕</div>
          <div class="tv3-card failed">
            <div class="tv3-header">
              <span class="tv3-title failed">${escapeHtml(h.title)}</span>
              <div class="tv3-header-right">
                <span class="tv3-date">Ended ${escapeHtml(h.failedDate || h.archivedAt || "")}</span>
                ${isRedeemed ? `
                  <button type="button" class="tv3-delete-btn" data-id="${escapeHtml(h.id)}" title="Redeemed by 14+ day milestone! Click to clear this record">
                    🗑️
                  </button>
                ` : ""}
              </div>
            </div>
            <p class="tv3-quote failed">"${escapeHtml(quote)}"</p>
            <div class="tv3-footer">
              <span class="tv3-tag failed">⚠️ Incomplete · Day ${h.currentStreak || 0}/${h.targetDays}</span>
              ${isRedeemed ? `
                <span class="tv3-redeemed-tag">✓ 14d Redeemed</span>
              ` : `
                <span class="tv3-locked-tag" title="Complete a new milestone of at least 14 days to unlock deletion">🔒 14d target needed to clear</span>
              `}
            </div>
          </div>
        </div>
      `;
    }

    // Completed node
    const quote = h.quote || "Small daily disciplines quietly compound into massive personal transformation.";
    return `
      <div class="tv3-node completed" data-id="${escapeHtml(h.id)}">
        <div class="tv3-node-dot completed">✓</div>
        <div class="tv3-card completed">
          <div class="tv3-header">
            <span class="tv3-title">${escapeHtml(h.title)}</span>
            <span class="tv3-date">Conquered ${escapeHtml(h.completedDate || h.archivedAt || "")}</span>
          </div>
          <p class="tv3-quote">"${escapeHtml(quote)}"</p>
          <div class="tv3-footer">
            <span class="tv3-tag completed">🎯 ${h.targetDays}-Day Target Finished</span>
            <span class="tv3-cumul">${habitDays} days banked</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // ── Active Milestone or Action Card at bottom of timeline ───────────────
  const activeOrActionNodeHtml = hasActiveMilestone ? `
    <div class="tv3-node active-node" style="margin-bottom: 0;">
      <div class="tv3-node-dot active">⚡</div>
      <div class="tv3-card active-card">
        <div class="tv3-header">
          <span class="tv3-title active">${escapeHtml(milestone.title)}</span>
          <span class="tv3-date">Active · Day ${milestone.currentStreak} of ${milestone.targetDays}</span>
        </div>
        <div class="tv3-active-progress-wrap">
          <div class="tv3-active-bar-track">
            <div class="tv3-active-bar-fill" style="width: ${Math.round((milestone.currentStreak / milestone.targetDays) * 100)}%;"></div>
          </div>
          <span class="tv3-active-pct">${Math.round((milestone.currentStreak / milestone.targetDays) * 100)}%</span>
        </div>
        <div class="tv3-footer">
          <span class="tv3-tag active">
            ${milestone.lastCheckedDate === todayStr ? "✓ Checked in today" : "⏳ Pending check-in today"}
          </span>
          <span class="tv3-cumul">${milestone.targetDays - milestone.currentStreak} days remaining</span>
        </div>
      </div>
    </div>
  ` : `
    <div class="tv3-node create-node" style="margin-bottom: 0;">
      <div class="tv3-node-dot create">＋</div>
      <div class="tv3-card create-card" id="hubCreateMilestoneCard" role="button" tabindex="0" title="Click to setup a new habit milestone">
        <div class="tv3-header">
          <span class="tv3-title" style="color: rgba(255,255,255,0.85);">+ Start New Milestone</span>
          <span class="tv3-date">Available</span>
        </div>
        <p class="tv3-quote">"The secret of getting ahead is getting started."</p>
        <div class="tv3-footer">
          <span class="tv3-tag create-tag">🎯 Setup Habit Target (14–100 days)</span>
        </div>
      </div>
    </div>
  `;

  const trophiesCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Consistency Timeline</div>
      <div class="v4-section-desc">A chronological record of every habit milestone conquered and attempted.</div>
    </div>
    <div class="trophy-v3-timeline">
      ${userHabits.length === 0 ? emptyStateHtml : timelineNodesHtml}
      ${activeOrActionNodeHtml}
    </div>
  `;

  const badgesCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Consistency Achievements</div>
      <div class="v4-section-desc">Earn badges as your daily discipline and habit follow-through compound over time.</div>
    </div>
    ${ACHIEVEMENTS.map(a => `
      <div class="achievement-card ${a.unlocked ? "unlocked" : "locked"}">
        <span class="achievement-icon">${a.icon}</span>
        <div class="achievement-info">
          <div class="achievement-title">${escapeHtml(a.title)}</div>
          <span class="achievement-desc">${escapeHtml(a.desc)}</span>
        </div>
        <span class="achievement-badge ${a.unlocked ? "unlocked" : "locked"}">${a.unlocked ? "✓ Unlocked" : "Locked"}</span>
      </div>
    `).join("")}
  `;

  const communityCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Global Community Challenges</div>
      <div class="v4-section-desc">Stay accountable and motivated alongside focused builders worldwide.</div>
    </div>
    ${COMMUNITY_QUESTS.length > 0 ? COMMUNITY_QUESTS.map(q => `
      <div class="community-quest-card">
        <div class="cqc-header">
          <span class="cqc-title">🌱 ${escapeHtml(q.title)}</span>
          <span class="cqc-tag">${escapeHtml(q.tag)}</span>
        </div>
        <p class="cqc-desc">${escapeHtml(q.goal)}</p>
        <div class="cqc-bar-track"><div class="cqc-bar-fill" style="width: ${q.progress}%;"></div></div>
        <div class="cqc-meta"><span>${escapeHtml(q.participants)}</span><span>${q.progress}% on track</span></div>
      </div>
    `).join("") : `
      <div class="tv3-empty-state" style="margin-top: 10px;">
        <div class="tv3-empty-icon">🌱</div>
        <div class="tv3-empty-title">No Active Challenges</div>
        <div class="tv3-empty-desc">Community challenges and seasonal sprints are coming soon. Focus on conquering your personal milestones in the meantime!</div>
      </div>
    `}
  `;

  const followThroughRate = (totalMastered + failedHabits.length) > 0
    ? Math.round((totalMastered / (totalMastered + failedHabits.length)) * 100)
    : 100;

  const metricsCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Consistency Analytics</div>
      <div class="v4-section-desc">A transparent look at your long-term consistency, follow-through, and focus patterns.</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px;">
        <div style="font-size: 0.76rem; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 9px; letter-spacing: 0.2px;">Performance Metrics</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
          <span>Target Follow-Through</span>
          <span style="color: rgba(160,225,185,0.9); font-weight: 600;">${followThroughRate}% Completed</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
          <span>Habits Conquered</span>
          <span style="font-weight: 600; color: rgba(255,255,255,0.85);">${totalMastered} Targets</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.7);">
          <span>Total Days Banked</span>
          <span style="font-weight: 600; color: rgba(160,225,185,0.9);">${totalDays} Days</span>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px;">
        <div style="font-size: 0.76rem; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 6px;">Longest Single Streak</div>
        <div style="font-size: 0.72rem; color: rgba(255,255,255,0.65);">Personal Best: <strong>${longestStreak} Consecutive Days</strong></div>
      </div>
      <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 12px;">
        <div style="font-size: 0.70rem; color: rgba(255,255,255,0.48); font-style: italic; line-height: 1.4;">
          "Consistency compounds silently. Finishing each target doesn't just check a box—it builds lasting self-trust."
        </div>
      </div>
    </div>
  `;

  card.innerHTML = `
    <div class="trophy-header-row" style="margin-bottom: 2px;">
      <h3 class="dialog-title" style="margin-bottom: 0;">Consistency Hub</h3>
    </div>
    <p class="trophy-hub-subtitle">Review your conquered streaks, unlocked achievements, and consistency growth.</p>

    <div class="trophy-v4-split">
      <div class="tv4-sidebar">
        <div class="tv4-profile-badge">
          <div class="tv4-profile-num">${totalDays}</div>
          <div class="tv4-profile-lbl">Days Conquered</div>
          <div class="tv4-profile-sub">${totalMastered} habit${totalMastered === 1 ? "" : "s"} mastered</div>
        </div>
        <button type="button" class="tv4-menu-btn active" data-sec="shelf">
          <span>🏆 Timeline</span>
          <span class="tv4-menu-chip">${userHabits.length}</span>
        </button>
        <button type="button" class="tv4-menu-btn" data-sec="badges">
          <span>🏅 Achievements</span>
          <span class="tv4-menu-chip">${unlockedAchievementsCount}</span>
        </button>
        <button type="button" class="tv4-menu-btn" data-sec="community">
          <span>🌱 Challenges</span>
          <span class="tv4-menu-chip">${COMMUNITY_QUESTS.length}</span>
        </button>
        <button type="button" class="tv4-menu-btn" data-sec="stats">
          <span>📊 Insights</span>
          <span class="tv4-menu-chip">✓</span>
        </button>
      </div>

      <div class="tv4-canvas" id="hubCanvas">
        <div class="v4-canvas-section" data-sec="shelf">
          ${trophiesCanvasHtml}
        </div>
        <div class="v4-canvas-section" data-sec="badges" style="display:none;">
          ${badgesCanvasHtml}
        </div>
        <div class="v4-canvas-section" data-sec="community" style="display:none;">
          ${communityCanvasHtml}
        </div>
        <div class="v4-canvas-section" data-sec="stats" style="display:none;">
          ${metricsCanvasHtml}
        </div>
      </div>
    </div>

    <div class="dialog-actions" style="justify-content: flex-end; margin-top: 14px;">
      <button class="dialog-btn dialog-btn-confirm" id="trophyHubCloseBtn">Done</button>
    </div>
  `;

  overlay.classList.remove("dialog-hidden");

  // Wire sidebar navigation
  const menuBtns = card.querySelectorAll(".tv4-menu-btn");
  const canvasSections = card.querySelectorAll(".v4-canvas-section");
  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.sec;
      canvasSections.forEach(s => {
        s.style.display = s.dataset.sec === target ? "" : "none";
      });
    });
  });

  // Wire create milestone action cards
  const startBtn = card.querySelector("#hubStartMilestoneBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      finish();
      promptCreateMilestone(false);
    });
  }

  const createCard = card.querySelector("#hubCreateMilestoneCard");
  if (createCard) {
    createCard.addEventListener("click", () => {
      finish();
      promptCreateMilestone(false);
    });
  }

  // Wire delete buttons for redeemed failed milestones
  const deleteBtns = card.querySelectorAll(".tv3-delete-btn");
  deleteBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = btn.dataset.id;
      if (!targetId) return;

      let currentList = [];
      try {
        currentList = JSON.parse(localStorage.getItem("completedHabits") || "[]");
      } catch (err) { currentList = []; }

      const idx = currentList.findIndex((item, i) =>
        (item.id && item.id === targetId) ||
        ("h_" + (item.failedDate || item.completedDate || item.archivedAt || "rec") + "_" + i === targetId)
      );

      if (idx !== -1) {
        currentList.splice(idx, 1);
        try {
          localStorage.setItem("completedHabits", JSON.stringify(currentList));
        } catch (err) { }
        showToast("🗑️ Streak record cleared.", "info", 2500);
        finish();
        setTimeout(() => {
          showTrophyHubModal();
        }, 150);
      }
    });
  });

  // Close handlers
  const closeBtn = card.querySelector("#trophyHubCloseBtn");
  const backdropHandler = (e) => { if (e.target === overlay) finish(); };
  const keyHandler = (e) => {
    if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); finish(); }
  };

  overlay.addEventListener("click", backdropHandler);
  document.addEventListener("keydown", keyHandler);

  function finish() {
    overlay.removeEventListener("click", backdropHandler);
    document.removeEventListener("keydown", keyHandler);
    overlay.classList.add("dialog-hidden");
    setTimeout(() => {
      card.innerHTML = "";
      card.className = "dialog-card";
    }, 280);
  }

  if (closeBtn) closeBtn.addEventListener("click", finish);
}

function initTrophyHubFab() {
  const fab = document.getElementById("trophyHubFabBtn");
  if (!fab) return;

  function updateFabState() {
    const isUnread = localStorage.getItem("trophyHubUnread") === "true";
    fab.classList.toggle("has-unread", isUnread);
  }

  updateFabState();
  fab.addEventListener("click", () => {
    showTrophyHubModal();
    updateFabState();
  });
}
