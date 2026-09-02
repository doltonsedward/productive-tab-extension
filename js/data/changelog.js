// ==========================================
// DATA: CHANGELOG & RELEASE NOTES (CURRENT MAJOR: v1.x)
// ==========================================
// Contains all version releases for the current major cycle (v1.x).
// Older major releases are archived in CHANGELOG.md on GitHub:
// https://github.com/doltonsedward/productive-tab-extension/blob/main/CHANGELOG.md

const CHANGELOG_DATA = [
  {
    version: "1.17.5",
    date: "2026-09-02",
    items: [
      { type: "change", text: "Bookmark Modal Transparency: Increased the bookmark spotlight card to match the Frosted Crystal glassmorphism style — background reduced to 0.40 opacity with stronger blur saturation and a top sheen gradient line." }
    ]
  },
  {
    version: "1.17.4",
    date: "2026-09-02",
    items: [
      { type: "change", text: "Calm Resting State: Moving cursor away from bookmark items automatically clears the active outline, keeping the modal resting and neutral unless navigating via keyboard." },
      { type: "change", text: "Seamless Keyboard Resume: Pressing arrow keys instantly engages keyboard navigation smoothly even after mouse hover." }
    ]
  },
  {
    version: "1.17.3",
    date: "2026-09-02",
    items: [
      { type: "fix", text: "Bookmark Selection Highlight: Fixed index synchronization in Dual-Pane finder so only the actively hovered or keyboard-selected bookmark item receives the green highlight." },
      { type: "change", text: "Mouse & Keyboard Coordination: Moving cursor over folder sidebar now clears right-pane selection, preventing multiple active outlines." }
    ]
  },
  {
    version: "1.17.2",
    date: "2026-09-02",
    items: [
      { type: "change", text: "Dual-Pane Column Finder: Replaced the collapsible tree view with a two-panel column finder — a folder sidebar on the left and a live bookmark list on the right." },
      { type: "change", text: "Keyboard Pane Switching: ArrowLeft / ArrowRight now switch focus between the folder pane and the bookmark pane." },
      { type: "change", text: "Auto-Select First Folder: The first folder is automatically selected on open so the right pane is never empty." },
      { type: "change", text: "Favicon Support: Bookmark links display a Google favicon thumbnail in browse and search modes." }
    ]
  },
  {
    version: "1.17.1",
    date: "2026-09-02",
    items: [
      { type: "change", text: "Collapsible Tree View: Transformed bookmark folders into a collapsible tree view (collapsed by default) with spring transitions." },
      { type: "change", text: "New Tab Opening: Clicking bookmarks or pressing Enter now reliably opens destination URLs in a new browser tab." },
      { type: "change", text: "Subdued Resting Aesthetics: Green accent glow only activates on hover or explicit keyboard navigation." },
      { type: "fix", text: "Keyboard Navigation: Fixed ArrowUp / ArrowDown across all visible tree folders and links." }
    ]
  },
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
];
