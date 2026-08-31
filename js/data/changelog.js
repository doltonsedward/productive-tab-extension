// ==========================================
// DATA: CHANGELOG & RELEASE NOTES (CURRENT MAJOR: v1.x)
// ==========================================
// Contains all version releases for the current major cycle (v1.x).
// Older major releases are archived in CHANGELOG.md on GitHub:
// https://github.com/doltonsedward/productive-tab-extension/blob/main/CHANGELOG.md

const CHANGELOG_DATA = [
  {
    version: "1.15.4",
    date: "2026-08-31",
    items: [
      { type: "change", text: "Habit Integrity Protection: Removed streak manual edits and check-in unlocking to keep habit building authentic and uncheatable." },
      { type: "change", text: "Pure Restart Flow: Milestone settings now offer a direct 'Reset & Start New Target' flow starting fresh from Day 0." }
    ]
  },
  {
    version: "1.15.3",
    date: "2026-08-31",
    items: [
      { type: "fix", text: "Milestone Edit Bug: Editing habit name or target days now safely preserves your streak history and check-in status." },
      { type: "change", text: "Streamlined Milestone Settings: Clicking ⚙️ directly opens the Edit Habit Target form with streak adjustment and check-in unlock controls." }
    ]
  },
  {
    version: "1.15.2",
    date: "2026-08-31",
    items: [
      { type: "change", text: "Full Frosted Crystal Adoption: Applied the airy, high-translucency Frosted Crystal glassmorphism as the permanent standard card theme." },
      { type: "change", text: "Contextual Emoji Badges: Added distinct emoji icons to all modal badges (e.g. 🌱 Someday Box, 📋 Todo List, 📌 Subtask, 🏆 Milestone Habit, 🧠 Daily Learning Log, 📝 Quick Notes, ⚠️ Danger Zone)." }
    ]
  },
  {
    version: "1.15.1",
    date: "2026-08-31",
    items: [
      { type: "feat", text: "3 Glassmorphism Modal Variations: Added Frosted Crystal, Deep Obsidian, and Neon Aurora style themes with true translucent glass diffraction." },
      { type: "refactor", text: "Hierarchy & Redundancy Fix: Refactored modal titles and badges so badges show section context and titles show clear, non-repetitive actions." },
      { type: "change", text: "Increased Glass Translucency: Replaced heavy opaque modal card background with airy, frosted glass backdrop blur." }
    ]
  },
  {
    version: "1.15.0",
    date: "2026-08-31",
    items: [
      { type: "feat", text: "Custom Glassmorphism Dialog System: New reusable dialog engine (dialog.js + dialog.css) replaces all native browser prompt(), confirm(), and alert() with themed modals supporting keyboard navigation, backdrop-click dismiss, and real-time validation." },
      { type: "feat", text: "Unified Milestone Modal: Habit Name and Target Days combined into a single form modal — no more two consecutive blocking prompts." },
      { type: "change", text: "Todo & Subtask Editing: Edit actions now open a glassmorphic prompt modal with existing text pre-selected." },
      { type: "change", text: "Someday Box & Learning Log Dialogs: Add tag, edit item, and clear all now use custom glassmorphic modals." },
      { type: "change", text: "Settings Erase All Data: Reset confirmation upgraded to a danger-styled glassmorphic modal." },
      { type: "change", text: "Timer & Calendar: Replaced blocking alert() calls with non-blocking showToast() notifications." }
    ]
  },
  {
    version: "1.14.2",
    date: "2026-08-28",
    items: [
      { type: "change", text: "Prioritized Widget Order: Reordered Add Widget picker list to put Quick Links, Someday Box, and Daily Learning Log first." }
    ]
  },
  {
    version: "1.14.1",
    date: "2026-08-28",
    items: [
      { type: "fix", text: "Tag Scroll Retention: Smooth in-place tag selection without resetting horizontal scroll position." },
      { type: "change", text: "Subdued Copy Button: Styled the copy button with muted glass borders matching the central Todo List." }
    ]
  },
  {
    version: "1.14.0",
    date: "2026-08-28",
    items: [
      { type: "feat", text: "Dynamic Tag Placeholders: Input placeholders now adapt dynamically when selecting category tags (TIL, Insight, Quote, etc.) for a cleaner, decluttered UI." },
      { type: "change", text: "English Language Standardization: Standardized all Daily Learning Log copy, empty state prompts, and agent guidelines to English." }
    ]
  },
  {
    version: "1.13.1",
    date: "2026-08-28",
    items: [
      { type: "fix", text: "Widget Slot Sanitization: Auto-migrated legacy widget IDs and purged orphan slot entries to prevent ghost widget slot occupancy in settings." }
    ]
  },
  {
    version: "1.13.0",
    date: "2026-08-28",
    items: [
      { type: "feat", text: "Daily Learning Log Widget (TIL & Daily Accountability): Dedicated learning & knowledge capture widget with daily accountability badges, sentence starters, and Obsidian export." }
    ]
  },
  {
    version: "1.10.0",
    date: "2026-08-28",
    items: [
      { type: "feat", text: "Someday Box Drag & Drop Reordering: Reorder ideas and future tasks effortlessly with smooth drag-and-drop support." }
    ]
  },
  {
    version: "1.9.3",
    date: "2026-08-28",
    items: [
      { type: "fix", text: "Someday Box Outer Spacing: Enhanced vertical breathing room between tag filter chips, task list container, and backlog footer." }
    ]
  },
  {
    version: "1.9.2",
    date: "2026-08-28",
    items: [
      { type: "change", text: "Someday Box Spacing & Breathing Room: Optimized vertical padding, item gaps, tag font sizing, and footer spacing for clean legibility." }
    ]
  },
  {
    version: "1.9.1",
    date: "2026-08-28",
    items: [
      { type: "feat", text: "Direct GitHub Changelog Archive: Added a quick-access link card in What's New to explore the full repository changelog archive." },
      { type: "refactor", text: "Streamlined Major Release Organization: Organized in-app changelog to display current major version cycle (v1.x) with direct GitHub archive links for previous cycles." }
    ]
  },
  {
    version: "1.9.0",
    date: "2026-08-28",
    items: [
      { type: "feat", text: "Individual Widget Minimize: Added a [─]/[+] collapse button on widget headers to tuck away individual widgets into a sleek, compact glass bar without removing them." }
    ]
  },
  {
    version: "1.8.1",
    date: "2026-08-27",
    items: [
      { type: "change", text: "Moved Focus Mode toggle to bottom-right corner with Stopwatch on its left, and softened the active indicator to a very calm, dim tone." }
    ]
  },
  {
    version: "1.8.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Global Focus Mode (Minimize All Widgets): Added a floating 👁️ button to quickly hide all active side widgets with smooth slide & blur animation, leaving pure focus on the Todo List." }
    ]
  },
  {
    version: "1.7.2",
    date: "2026-08-27",
    items: [
      { type: "change", text: "Subdued and softened Someday Box colors so it blends peacefully into the background, keeping the Todo List as the main focal point." }
    ]
  },
  {
    version: "1.7.1",
    date: "2026-08-27",
    items: [
      { type: "change", text: "Softened Quick Links hover animations to be minimal, calm, and subtle." }
    ]
  },
  {
    version: "1.7.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Redesigned Quick Links to a stylish 6-slot App Dock layout (2x3 squircle glass app tiles with labels)." },
      { type: "feat", text: "Added interactive searchable icon & emoji selector with 180+ curated icons and direct keyboard input." }
    ]
  },
  {
    version: "1.6.6",
    date: "2026-08-27",
    items: [
      { type: "change", text: "Widened the widget columns from 250px to 290px for a more spacious and comfortable layout." }
    ]
  },
  {
    version: "1.6.5",
    date: "2026-08-27",
    items: [
      { type: "fix", text: "Tweaked typography in Someday Box list items: tag text is now smaller and properly spaced from the task name." }
    ]
  },
  {
    version: "1.6.4",
    date: "2026-08-27",
    items: [
      { type: "change", text: "Redesigned Someday Box list items to a modern 'dashboard' style with elegant color-accented left borders and minimal tag text." }
    ]
  },
  {
    version: "1.6.3",
    date: "2026-08-27",
    items: [
      { type: "fix", text: "Fixed Someday Box item text and tag alignment (now correctly left-aligned)." },
      { type: "fix", text: "Removed unnecessary dot symbol from active tag chips for a cleaner look." }
    ]
  },
  {
    version: "1.6.2",
    date: "2026-08-27",
    items: [
      { type: "refactor", text: "Polished 🌱 Someday Box with soft, muted pastel tones and calm contrast." },
      { type: "feat", text: "Dim unselected tags by default with a clear active dot indicator on the selected tag." }
    ]
  },
  {
    version: "1.6.1",
    date: "2026-08-27",
    items: [
      { type: "refactor", text: "Redesigned 🌱 Someday Box with a full-width input and horizontal tag chip selector bar." },
      { type: "feat", text: "Added vibrant color-coded badge pills for distinct tag categories." },
      { type: "fix", text: "Optimized GitHub update checker interval to 15m with robust cache busting." },
      { type: "fix", text: "Fixed script loading order to ensure version comparison functions are globally available." },
      { type: "fix", text: "Added instant cached update indicator badge display on tab load." }
    ]
  },
  {
    version: "1.6.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Added 🌱 Someday Box widget to capture future ideas and backlog items." },
      { type: "feat", text: "Reusable custom tags & filter chips for easy organization." },
      { type: "feat", text: "1-Click Move to Today (🚀) button directly promoting tasks to Todo list." },
      { type: "feat", text: "Integrated Someday Box data into Settings Backup & Restore." }
    ]
  },
  {
    version: "1.5.1",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Synchronized unread update indicator dot with main Settings FAB button." }
    ]
  },
  {
    version: "1.5.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Added unread update glowing dot indicator on What's New button." },
      { type: "feat", text: "Highlighted latest release with vibrant ✨ Latest badge and glowing status node." }
    ]
  },
  {
    version: "1.4.3",
    date: "2026-08-27",
    items: [
      { type: "fix", text: "Upgraded What's New modal with true translucent glassmorphism and top neon sheen." }
    ]
  },
  {
    version: "1.4.2",
    date: "2026-08-27",
    items: [
      { type: "refactor", text: "Expanded What's New modal with ultra-rich glassmorphism and increased width." },
      { type: "feat", text: "Added smooth fade-in and fade-out scale transitions across all dashboard modals." }
    ]
  },
  {
    version: "1.4.1",
    date: "2026-08-27",
    items: [
      { type: "refactor", text: "Redesigned What's New modal into a modern glowing vertical timeline." },
      { type: "fix", text: "Removed redundant Close button and enabled click-outside / Esc key dismissal." }
    ]
  },
  {
    version: "1.4.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Discreet in-app What's New viewer modal in Settings drawer." },
      { type: "feat", text: "Created CHANGELOG.md and automated AI Agent changelog tracking." }
    ]
  },
  {
    version: "1.3.2",
    date: "2026-08-27",
    items: [
      { type: "refactor", text: "Modularized icon datasets into dedicated data file (js/data/icons.js)." }
    ]
  },
  {
    version: "1.3.1",
    date: "2026-08-27",
    items: [
      { type: "fix", text: "Fixed icon search matching and custom emoji fallback in Quick Links." }
    ]
  },
  {
    version: "1.3.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Added Quick Links tube dock widget with custom icon picker." },
      { type: "feat", text: "Searchable emoji picker & Google Favicon auto-detection." }
    ]
  },
  {
    version: "1.2.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "First-time welcome onboarding modal to personalize dashboard name." },
      { type: "feat", text: "Automatic background update checker with drawer notification." }
    ]
  },
  {
    version: "1.1.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Dual-slot widget workspace engine (drag & drop positions)." },
      { type: "feat", text: "Task-level stopwatch tracking and Google Calendar scheduling." },
      { type: "feat", text: "Added Quick Notes, Daily Quote, and Focus Stats widgets." }
    ]
  },
  {
    version: "1.0.0",
    date: "2026-08-27",
    items: [
      { type: "feat", text: "Initial release: Minimalist clock, todo list, milestone habits, and focus timer." }
    ]
  }
];
