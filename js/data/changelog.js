// ==========================================
// DATA: CHANGELOG & RELEASE NOTES (CURRENT MAJOR: v1.x)
// ==========================================
// Contains all version releases for the current major cycle (v1.x).
// Older major releases are archived in CHANGELOG.md on GitHub:
// https://github.com/doltonsedward/productive-tab-extension/blob/main/CHANGELOG.md

const CHANGELOG_DATA = [
  {
    version: "1.17.0",
    date: "2026-09-02",
    items: [
      { type: "feat", text: "Bookmark Spotlight & Command Palette: Added Ctrl+B / Cmd+B glass spotlight modal to search and open browser bookmarks." },
      { type: "feat", text: "macOS-Style Spring Folder Animations: Tactile spring bounce transitions when navigating bookmark folders." },
      { type: "feat", text: "Native Chrome Sync: Real-time synchronization with chrome.bookmarks API and Google favicon detection." },
      { type: "feat", text: "Keyboard Navigation: Full arrow keys, Enter, Backspace, and Esc support." }
    ]
  },
  {
    version: "1.16.11",
    date: "2026-09-02",
    items: [
      { type: "change", text: "Subdued Add Widget Button: Softened resting state of the add button with low-contrast borders and dim opacity." },
      { type: "change", text: "20-Version What's New Cap: Optimized in-app release notes list to display the 20 most recent versions with full history archived on GitHub." }
    ]
  },
  {
    version: "1.16.10",
    date: "2026-09-02",
    items: [
      { type: "feat", text: "Top & Bottom Fade Gradient: Added soft gradient mask shadow on widget column boundaries for smooth, seamless scrolling." }
    ]
  },
  {
    version: "1.16.9",
    date: "2026-09-02",
    items: [
      { type: "fix", text: "Locked Center Hero: Anchored Clock, Greeting, and Todo section vertically so adding/removing widgets never shifts the center workspace." }
    ]
  },
  {
    version: "1.16.8",
    date: "2026-09-02",
    items: [
      { type: "change", text: "Fixed Viewport Layout: Dashboard now fits within a single 100vh screen with independent column scrolling, keeping clock and layout anchored." }
    ]
  },
  {
    version: "1.16.7",
    date: "2026-08-31",
    items: [
      { type: "refactor", text: "Production Finalization: Removed all testing controls and preview buttons for a clean, distraction-free interface." }
    ]
  },
  {
    version: "1.16.6",
    date: "2026-08-31",
    items: [
      { type: "change", text: "Balanced Watermark: Restored quotation mark watermark opacity for balanced ambient aesthetics." }
    ]
  },
  {
    version: "1.16.5",
    date: "2026-08-31",
    items: [
      { type: "change", text: "Ultra-Subdued Hierarchy: Dimmed all auxiliary metadata, checkboxes, and buttons to keep focus completely centered on the mindful reflection question." }
    ]
  },
  {
    version: "1.16.4",
    date: "2026-08-31",
    items: [
      { type: "change", text: "Subdued Done Button: Softened the Spatial Zen action button to keep focal attention on the reflection question." },
      { type: "change", text: "Active Milestone Integration: The reflection modal now automatically reflects your live habit name and progress." }
    ]
  },
  {
    version: "1.16.3",
    date: "2026-08-31",
    items: [
      { type: "change", text: "Spatial Zen Standard: Locked in the Spatial Zen reflection card design with subtle watermark typography." },
      { type: "change", text: "Day 3+ Reflection Threshold: Reflection questions now appear starting from Day 3, keeping Days 1 and 2 lightweight with toast messages." }
    ]
  },
  {
    version: "1.16.2",
    date: "2026-08-31",
    items: [
      { type: "feat", text: "4 Creative Reflection Modal Variations: Added Zen Minimal, Milestone Hero, Micro-Journal, and Spatial Zen styles with real-time preview tabs." },
      { type: "fix", text: "Settings Drawer: Resolved script syntax error so settings open smoothly." }
    ]
  },
  {
    version: "1.16.1",
    date: "2026-08-31",
    items: [
      { type: "refactor", text: "Frosted Crystal Permanent Standard: Cleaned up temporary modal style variations and Settings selector for a unified, clutter-free design." }
    ]
  },
  {
    version: "1.16.0",
    date: "2026-08-31",
    items: [
      { type: "feat", text: "Dedicated Reflection Modal: Daily milestone check-in now reveals an elegant reflection card with mindful questions and zero time pressure." },
      { type: "feat", text: "Interactive Toast Timer & Hover Pause: Toasts now feature an animated progress line, pause on hover, and dismiss on click." },
      { type: "feat", text: "25 Mindful Reflection Questions: Extracted questions into a dedicated data module with 10 new self-growth prompts." },
      { type: "change", text: "Reflection Preferences: Added in-modal opt-out and a Settings toggle to customize your check-in experience." }
    ]
  },
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
  }
];
