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


  // DEV-MODE: Remove or hide on finalization
  const debugBtnHtml = `<button id="debugStepMilestoneBtn" class="milestone-btn debug-btn" title="Debug Step: Left-click for +1 Day (animates fill) · Right-click to reset to Day 0">⚡ +1</button>`;

  // DEV-MODE: Remove or hide on finalization
  const debugBreakBtnHtml = `<button id="debugBreakStreakBtn" class="milestone-btn debug-break-btn" title="Debug: Simulate 3-day miss → show recovery modal">🚨 Break</button>`;


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
          ${debugBreakBtnHtml}
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

  // DEV-MODE: Remove or hide on finalization
  const debugBreakBtn = document.getElementById("debugBreakStreakBtn");
  if (debugBreakBtn) {
    debugBreakBtn.addEventListener("click", () => {
      if (!milestone) return;
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      milestone.lastCheckedDate = threeDaysAgo.toISOString().split("T")[0];
      milestone.streakBroken = true;
      milestone.daysMissed = 3;
      saveMilestone();
      renderMilestone();
    });
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
    milestone = null;
    saveMilestone();
    renderMilestone();
    showToast(`🗑️ "${oldTitle}" has been discarded. Ready when you are.`, "warning", 4000);
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
    <span class="dialog-badge" style="background: rgba(255,215,0,0.12); color: #ffe082; border-color: rgba(255,215,0,0.3);">
      🎉 Target Conquered!
    </span>
    <h3 class="dialog-title" style="margin-bottom: 2px;">Congratulations!</h3>
    <p class="congrats-hero-text">
      You successfully finished all <strong>${targetDays} days</strong> of <span class="congrats-habit-name">"${habitTitle}"</span>!
    </p>

    <div class="congrats-reflection-box">
      <label class="congrats-question-label" for="congratsReflectionInput">
        💭 ${escapeHtml(selectedQuestion)}
      </label>
      <textarea id="congratsReflectionInput" class="congrats-textarea" rows="3" placeholder="Write your personal reflection or keep the quote...">${escapeHtml(defaultQuote)}</textarea>
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
    title: milestone.title,
    targetDays: milestone.targetDays,
    currentStreak: milestone.currentStreak,
    completedDate: milestone.completedDate || todayStr,
    archivedAt: todayStr,
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

  showToast(`🏆 "${archivedTitle}" engraved into Trophy Shelf! Ready for your next challenge?`, "celebrate", 5000);
  await promptCreateMilestone(false);
}

function showTrophyHubModal() {
  const overlay = document.getElementById("customDialogModal");
  const card = overlay ? overlay.querySelector(".dialog-card") : null;
  if (!overlay || !card) return;

  // Clear unread notification when user opens the hub
  localStorage.removeItem("trophyHubUnread");
  const fab = document.getElementById("trophyHubFabBtn");
  if (fab) fab.classList.remove("has-unread");

  // Load user completed habits
  let userHabits = [];
  try {
    userHabits = JSON.parse(localStorage.getItem("completedHabits") || "[]");
  } catch (e) { userHabits = []; }

  const isDemo = userHabits.length === 0;
  const displayHabits = isDemo ? [
    {
      title: "Morning 20-min Reading",
      targetDays: 30,
      currentStreak: 30,
      completedDate: "2026-09-07",
      archivedAt: "2026-09-07",
      isSample: true,
      quote: "Reading clarifies thoughts and unlocks compounding insights."
    },
    {
      title: "Daily Deep Work Practice",
      targetDays: 21,
      currentStreak: 21,
      completedDate: "2026-08-30",
      archivedAt: "2026-08-30",
      isSample: true,
      quote: "Focus is a mental muscle strengthened by continuous consistency."
    },
    {
      title: "Evening Digital Detox",
      targetDays: 14,
      currentStreak: 14,
      completedDate: "2026-08-15",
      archivedAt: "2026-08-15",
      isSample: true,
      quote: "Restoring stillness before sleep fuels daytime energy."
    }
  ] : userHabits;

  // Aggregate Consistency Stats
  const totalMastered = displayHabits.length;
  const totalDays = displayHabits.reduce((acc, h) => acc + (h.targetDays || h.currentStreak || 0), 0);
  const longestStreak = displayHabits.length ? Math.max(...displayHabits.map(h => h.targetDays || h.currentStreak || 0)) : 0;

  // Achievements Database
  const ACHIEVEMENTS = [
    { id: "first_spark", icon: "🌱", title: "Day One Spark", desc: "Took the first step and logged your initial check-in", unlocked: true },
    { id: "streak_3", icon: "🔥", title: "3-Day Ignition", desc: "Built initial momentum with a 3-day consecutive streak", unlocked: true },
    { id: "streak_7", icon: "⚡", title: "7-Day Unbroken Week", desc: "Completed one full week of consistency without a single strike", unlocked: true },
    { id: "habit_master", icon: "🏆", title: "First Trophy", desc: "Conquered your first full habit target and archived the victory", unlocked: totalMastered > 0 },
    { id: "streak_21", icon: "🧠", title: "21-Day Neural Lock", desc: "Reached the psychological threshold of automatic habit formation", unlocked: longestStreak >= 21 },
    { id: "century_master", icon: "👑", title: "100-Day Centurion", desc: "Accumulated 100 total days of dedicated consistency", unlocked: totalDays >= 100 }
  ];
  const unlockedAchievementsCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  // Community Quests Database
  const COMMUNITY_QUESTS = [
    {
      title: "September 21-Day Consistency Sprint",
      tag: "Active Sprint",
      participants: "3,420 builders",
      goal: "Keep any habit target active for 21 consecutive days without a streak break.",
      progress: 74
    },
    {
      title: "Morning Focus Initiative",
      tag: "Weekly Challenge",
      participants: "1,890 builders",
      goal: "Check in before 09:00 AM for 7 consecutive days to build morning momentum.",
      progress: 52
    }
  ];

  card.className = "dialog-card trophy-hub-card";
  card.classList.remove("dialog-danger");

  const sampleBadgeHtml = isDemo
    ? `<span class="trophy-sample-badge" title="Sample preview — real data populates once you complete and archive habit targets.">Sample Preview</span>`
    : "";

  // ── Timeline-style trophy nodes for the Trophies canvas ─────────────────
  let runningTotal = 0;
  const reversedHabits = [...displayHabits].reverse();
  const timelineNodesHtml = reversedHabits.map((h) => {
    runningTotal += (h.targetDays || h.currentStreak || 0);
    const quote = h.quote || "Discipline is choosing what you want most over what you want now.";
    return `
      <div class="tv3-node">
        <div class="tv3-node-dot">✓</div>
        <div class="tv3-card">
          <div class="tv3-header">
            <span class="tv3-title">${escapeHtml(h.title)}</span>
            <span class="tv3-date">Conquered ${h.completedDate || h.archivedAt}</span>
          </div>
          <p class="tv3-quote">"${escapeHtml(quote)}"</p>
          <div class="tv3-footer">
            <span class="tv3-tag">🎯 ${h.targetDays}-Day Target Finished</span>
            <span class="tv3-cumul">${runningTotal} days banked all-time</span>
          </div>
        </div>
      </div>
    `;
  }).reverse().join("");

  const trophiesCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Conquered Habit Timeline</div>
      <div class="v4-section-desc">A chronological record of every habit target successfully brought across the finish line.</div>
    </div>
    <div class="trophy-v3-timeline">
      ${timelineNodesHtml}
      <div class="tv3-node" style="margin-bottom: 0;">
        <div class="tv3-node-dot" style="border-color: rgba(0,255,135,0.5); color: #a7f3d0;">⚡</div>
        <div class="tv3-card" style="border-style: dashed; background: rgba(0,255,135,0.02);">
          <div class="tv3-header">
            <span class="tv3-title" style="color: #a7f3d0;">Active Habit in Progress</span>
            <span class="tv3-date">Ongoing</span>
          </div>
          <p class="tv3-quote">"Every daily check-in is a vote for the person you are becoming."</p>
          <div class="tv3-footer">
            <span class="tv3-tag" style="background: rgba(0,255,135,0.06); color: #6ee7b7; border-color: rgba(0,255,135,0.18);">⚡ Building Next Milestone</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const badgesCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Consistency Milestones</div>
      <div class="v4-section-desc">Milestone badges earned as your daily discipline and follow-through compound.</div>
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
      <div class="v4-section-desc">Stay accountable and motivated alongside thousands of focused builders worldwide.</div>
    </div>
    ${COMMUNITY_QUESTS.map(q => `
      <div class="community-quest-card">
        <div class="cqc-header">
          <span class="cqc-title">🌱 ${escapeHtml(q.title)}</span>
          <span class="cqc-tag">${escapeHtml(q.tag)}</span>
        </div>
        <p class="cqc-desc">${escapeHtml(q.goal)}</p>
        <div class="cqc-bar-track"><div class="cqc-bar-fill" style="width: ${q.progress}%;"></div></div>
        <div class="cqc-meta"><span>${escapeHtml(q.participants)}</span><span>${q.progress}% on track</span></div>
      </div>
    `).join("")}
  `;

  const metricsCanvasHtml = `
    <div class="v4-section-header">
      <div class="v4-section-title">Consistency Analytics</div>
      <div class="v4-section-desc">A transparent look at your long-term consistency, follow-through, and focus patterns.</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px;">
        <div style="font-size: 0.76rem; font-weight: 600; color: #ffe082; margin-bottom: 9px; letter-spacing: 0.2px;">Performance Metrics</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
          <span>Target Follow-Through</span>
          <span style="color: #a7f3d0; font-weight: 600;">100% Completed</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
          <span>Habits Conquered</span>
          <span style="font-weight: 600; color: #ffe082;">${totalMastered} Targets</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(255,255,255,0.7);">
          <span>Total Days Banked</span>
          <span style="font-weight: 600; color: #a7f3d0;">${totalDays} Days</span>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px;">
        <div style="font-size: 0.76rem; font-weight: 600; color: #ffe082; margin-bottom: 6px;">Longest Single Streak</div>
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
      <h3 class="dialog-title" style="margin-bottom: 0;">Consistency Hub ${sampleBadgeHtml}</h3>
    </div>
    <p class="trophy-hub-subtitle">Review your conquered streaks, unlocked milestone badges, and consistency growth.</p>

    <div class="trophy-v4-split">
      <div class="tv4-sidebar">
        <div class="tv4-profile-badge">
          <div class="tv4-profile-num">${totalDays}d</div>
          <div class="tv4-profile-lbl">Days Conquered</div>
          <div class="tv4-profile-sub">${totalMastered} habits mastered</div>
        </div>
        <button type="button" class="tv4-menu-btn active" data-sec="shelf">
          <span>🏆 Timeline</span>
          <span class="tv4-menu-chip">${displayHabits.length}</span>
        </button>
        <button type="button" class="tv4-menu-btn" data-sec="badges">
          <span>🏅 Milestones</span>
          <span class="tv4-menu-chip">${unlockedAchievementsCount}</span>
        </button>
        <button type="button" class="tv4-menu-btn" data-sec="community">
          <span>🌱 Challenges</span>
          <span class="tv4-menu-chip">2</span>
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
