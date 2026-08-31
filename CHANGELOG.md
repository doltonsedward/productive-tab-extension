# Changelog

All notable changes to the **Productive Tab** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.15.2] - 2026-08-31
### Changed
- **💎 Full Frosted Crystal Adoption**: Set Frosted Crystal glassmorphism (`rgba(14, 18, 28, 0.38)` + `blur(22px)` + crisp white reflection sheen) as the standard default modal card design across the entire application.
- **🏷️ Contextual Emoji Badges**: Added component-specific emoji icons to all modal badges (e.g. `🌱 Someday Box`, `📋 Todo List`, `📌 Subtask`, `🏆 Milestone Habit`, `🧠 Daily Learning Log`, `📝 Quick Notes`, `⚠️ Danger Zone`) with aligned `inline-flex` typography.

---

## [1.15.1] - 2026-08-31
### Added
- **🎨 3 Distinct Glassmorphism Modal Variations**: Upgraded the dialog system with 3 selectable glassmorphism themes (`Frosted Crystal`, `Deep Obsidian Glass`, and `Neon Aurora Glass`) featuring true frosted translucency (0.52 to 0.72 opacity with 32px backdrop blur) and top sheen highlights.

### Changed
- **✨ Hierarchy & Redundancy Cleanup**: Eliminated repetitive badge/title pairs across all modals. The badge now strictly represents the component context (e.g. `TODO LIST`, `SUBTASK`, `SOMEDAY BOX`, `LEARNING LOG`, `MILESTONE HABIT`, `DANGER ZONE`), while the title states the distinct action (e.g. `Edit Task`, `Edit Subtask`, `New Custom Tag`, `Edit Habit Target`).
- **🔍 High Translucency & Contrast**: Overhauled modal card opacity from opaque 0.92 to authentic translucent glassmorphism with enhanced diffraction blur and subtle border sheen.

---

## [1.15.0] - 2026-08-31
### Added
- **🪟 Custom Glassmorphism Dialog System**: Introduced a new reusable dialog engine (`js/dialog.js` + `css/dialog.css`) that replaces all native browser `prompt()`, `confirm()`, and `alert()` calls with elegant, theme-consistent custom modals. Provides `showPromptModal()`, `showConfirmModal()`, and `showFormModal()` Promise-based APIs with keyboard navigation (<kbd>Enter</kbd> to confirm, <kbd>Esc</kbd> to cancel), backdrop-click dismissal, auto-focus with text selection, and real-time field validation.
- **📝 Unified Milestone Creation / Edit Modal**: Replaced two consecutive blocking prompts with a single `showFormModal` containing both Habit Name and Target Days fields in one clean, readable dialog — including a helper hint for recommended day targets.

### Changed
- **✏️ Todo & Subtask Editing**: Edit task and edit subtask actions now open a glassmorphic prompt modal with the existing text pre-selected for instant editing.
- **🌱 Someday Box Dialogs**: Add custom tag, edit task, and clear all confirmations now use custom glassmorphic modals.
- **🧠 Daily Learning Log Dialogs**: Add custom category, edit entry, and clear all confirmations now use custom glassmorphic modals.
- **⚙️ Settings Erase All Data**: Reset confirmation now uses a danger-styled glassmorphic confirmation modal with a clear warning message.
- **⏰ Timer & Calendar Alerts**: Replaced blocking `alert()` calls — timer "Time's up!" and GCal validation error now use non-blocking `showToast()` notifications.

---

## [1.14.2] - 2026-08-28
### Changed
- **🧩 Prioritized Widget Picker Ordering**: Reordered the Add Widget picker list by user utility and frequency of use, placing high-value daily workflow widgets (Quick Links, Someday Box, and Daily Learning Log) at the top.

---

## [1.14.1] - 2026-08-28
### Fixed
- **🏷️ Tag Chip Scroll Retention**: Resolved an issue where selecting tags far to the right caused the horizontal tag bar to jump/reset back to the left. Active classes are now toggled smoothly in-place without tearing down the DOM or resetting `scrollLeft`.
### Changed
- **📋 Subdued Copy Button**: Renamed the Obsidian export button to `📋 Copy` and adopted the same calm, muted glass aesthetic as the Todo List copy button, with temporary `✅ Copied!` click feedback.

---

## [1.14.0] - 2026-08-28
### Added
- **💡 Dynamic Tag-Based Input Placeholders**: Replaced static sentence starter buttons with intuitive dynamic input placeholders that update automatically whenever a category tag is clicked (`🧠 TIL` -> *"Today I learned..."*, `💡 Insight` -> *"I just realized that..."*, `📖 Quote` -> *"A quote or idea that resonated today..."*, etc.).
### Changed
- **🌐 Full English Standardization**: Standardized all UI copy, widget titles, placeholders, empty-state prompts, badges, and toasts to clear, modern English across the entire widget and codebase.
- **🌱 Concise & Punchy Learning Nudge**: Shortened the empty-state prompt to a clean, inspiring prompt (*"Spend 5 mins reading or exploring something new. What's one thing you discovered today?"*).
- **📋 Guidelines Update**: Added Rule 5 to `AGENTS.md` and `GEMINI.md` mandating universal English for all future UI text, documentation, and codebase developments.

---

## [1.13.1] - 2026-08-28
### Fixed
- **🧩 Widget Slot Ghost Occupancy & Sanitization**: Resolved an issue where legacy or deprecated widget IDs (e.g. `dailysparks`) remained in `widgetSlots` after renaming/removal, causing the Settings drawer to show phantom `(1/2)` counts without displaying any widget items. Added automatic legacy ID migration and orphan widget slot sanitization across `state.js`, `widgets.js`, and `settings.js`.

---

## [1.13.0] - 2026-08-28
### Added
- **🧠 Daily Learning Log Widget (TIL & Daily Accountability)**: Dedicated daily learning and knowledge capture widget designed to motivate users to learn and log at least one new insight every single day:
  - **🌱 Daily Learning Accountability**: Dynamic header badge (`⏳ Belum Belajar` vs `✓ X Dipelajari`) paired with encouraging empty-state prompts to build consistent daily learning habits.
  - **⚡ Instant Sentence Starters**: 1-click prompt chips (`[🧠 Today I learned...]`, `[💡 Baru sadar kalau...]`, `[📖 Kutipan: "..."]`, `[✨ Istilah: ...]`, `[🛠️ Metode: ...]`) to eliminate blank-page syndrome.
  - **🏷️ Structured Learning Tags**: Organize learnings with default presets (`🧠 TIL`, `💡 Insight`, `📖 Kutipan`, `✨ Istilah`, `🛠️ Metode`) or create custom categories.
  - **🔍 Interactive Category Filter Bar**: Filter active learnings by category pills with real-time counters.
  - **📋 1-Click Obsidian Markdown Export**: Formats all active learnings into clean Daily Notes Markdown (`### 🧠 Daily Learning Log (YYYY-MM-DD)`) with auto-hashtagging ready to paste into Obsidian.
  - **🔀 Drag & Drop Reordering**: Rearrange learning notes effortlessly with visual grab indicators and immediate local persistence.
  - **💾 Backup & Restore Integration**: Fully incorporated `dailyLearningData` and `dailyLearningTags` into JSON backup and restore workflows.

---

## [1.10.0] - 2026-08-28
### Added
- **🔀 Someday Box Task Drag & Drop Reordering**: Enabled smooth drag-and-drop reordering for items in the Someday Box widget. Tasks can now be picked up and rearranged dynamically with intuitive visual grab feedback, dashed dragging state, and top drop indicator line, with order instantly persisted to local storage.

---

## [1.9.3] - 2026-08-28
### Fixed
- **🌱 Someday Box Outer List Spacing**: Added distinct vertical breathing room above and below the task list container. Increased gap between filter tag chips bar and task list, and expanded separation before the backlog footer divider for a clean, uncrowded layout.

---

## [1.9.2] - 2026-08-28
### Changed
- **🌱 Someday Box Spacing & Breathing Room**: Optimized visual hierarchy and whitespace across the Someday Box widget. Improved vertical padding inside item cards (`9px 10px 9px 12px`), increased list item gap (`8px`), enhanced title line-height (`1.4`), scaled up category tag font size (`0.62rem`), and added breathing space to the footer separator and quick action chips for improved legibility.

---

## [1.9.1] - 2026-08-28
### Added
- **📜 Direct GitHub Changelog Archive Link**: Added a sleek link card in the What's New modal directing users to the full historical changelog archive on GitHub (`CHANGELOG.md`).
### Refactored
- **⚡ Major Cycle Release Organization**: Structured in-app release notes dataset (`js/data/changelog.js`) to display the current major version cycle (`v1.x.x`) with direct GitHub archive linking for previous major versions, ensuring smooth and organized What's New presentation.

---

## [1.9.0] - 2026-08-28
### Added
- **🧩 Individual Widget Minimize / Collapse**: Added a clean `[─]` / `[+]` minimize button to every widget header actions toolbar. Clicking the button or the header title collapses the widget into a compact, elegant ~38px glass bar with a smooth height and opacity transition. Minimized states are saved per-widget and persist across new tabs and browser sessions.

---

## [1.8.1] - 2026-08-27
### Changed
- **Bottom-Right Action Dock Alignment**: Moved the Focus Mode toggle button to the furthest bottom-right corner and placed the Stopwatch/Timer FAB to its left for a clean, cohesive action dock.
- **Subdued Focus Mode Indicator**: Softened the active Focus Mode indicator to a very calm, dim emerald tint with no pulsating glow or harsh saturation, keeping the workspace distraction-free.

---

## [1.8.0] - 2026-08-27
### Added
- **🎯 Global Focus Mode (Minimize All Widgets)**: Added a floating action button (`👁️`) in the bottom-left corner to quickly minimize and restore all active side widgets. When activated, side columns and "Add Widget" buttons slide smoothly out of view with a gentle blur and scale transition, giving a clutter-free, distractionless workspace focused entirely on the main Todo List. Minimized state persists across tabs and restarts.

---

## [1.7.2] - 2026-08-27
### Changed
- **Subdued Someday Box Aesthetics**: Softened all colors, borders, and tags in the Someday Box widget with lower contrast and muted pastel accents. Item action buttons now hide when idle and only appear on hover, keeping the user's primary focus squarely on the main Todo List.

---

## [1.7.1] - 2026-08-27
### Changed
- **Subtle App Dock Hover Animations**: Softened the hover animation on Quick Links squircle tiles with gentle, minimal glass elevation (`translateY(-1.5px)`) and muted border highlights instead of aggressive neon glow and heavy scaling.

---

## [1.7.0] - 2026-08-27
### Added
- **📱 Quick Links App Dock Layout**: Redesigned Quick Links widget to a sleek 6-slot App Dock layout (2x3 squircle glass app tiles with clean labels underneath).
- **🔍 Interactive Emoji & Icon Search Selector**: Replaced manual emoji inputs with a searchable popover icon selector featuring 180+ curated icons, bilingual keywords (EN/ID), and direct OS keyboard emoji pasting.
- **🔄 Smart Column Exclusivity**: Moving or swapping full-column widgets cleanly swaps the whole column contents without overflow.

---

## [1.6.6] - 2026-08-27
### Changed
- **Expanded Widget Column Width**: Increased widget column width from `250px` to `290px` to give widgets like the Someday Box, Quick Links, and Notes more breathing room and prevent text from wrapping prematurely.

---

## [1.6.5] - 2026-08-27
### Fixed
- **🌱 Someday Box Typography Tweak**: Adjusted the tag text spacing and font size inside the list items to prevent it from feeling cramped against the task name. The tag is now slightly smaller and bolder for a sleeker dashboard look.

---

## [1.6.4] - 2026-08-27
### Changed
- **🌱 Someday Box List Redesign**: Updated Someday Box list items to a modern "dashboard" style (Option 3). Ideas now feature an elegant color-accented left border based on their tag category, and tag pills have been simplified to clean, uppercase ghost text for a sleeker, lightweight look.

---

## [1.6.3] - 2026-08-27
### Fixed
- **🌱 Someday Box Alignment Fix**: Fixed an issue where list item text and tags were awkwardly centered instead of cleanly left-aligned.
- **Removed Active Tag List Dot**: Removed the unnecessary `●` active indicator symbol inside tag chips for a cleaner layout, relying on soft filled backgrounds and bold text instead.

---

## [1.6.2] - 2026-08-27
### Changed
- **🌱 Someday Box Visual Polish**: Softened tag colors into gentle, muted pastel tones and removed harsh neon borders/shadows.
- **Clear Active Tag Indicator**: Unselected tags are now dim and translucent by default; the active tag is clearly distinguished with a filled highlight and active indicator dot (`●`).
- **Subtle Counter Badge & Input**: Refined input container border and count badge for a calm, distraction-free aesthetic.

---

## [1.6.1] - 2026-08-27
### Changed
- **🌱 Someday Box Redesign (Option A: Sleek Quick-Capture Feed)**: Replaced cramped inline dropdown with a full-width input row and horizontal scrolling tag chip selector bar.
- **Color-Coded Tag Badges**: Added distinctive visual neon accents for tags (`Idea`, `Learn`, `Next Week`, `Project`, `Someday`).
### Fixed
- **Optimized GitHub Update Checker Interval**: Shortened update check frequency to 15 minutes with multi-layer cache busting for instant detection.
- **Script Dependency Order**: Reordered script loading sequence so version comparison utilities are initialized before settings drawer.
- **Instant Badge Rendering**: Added instant rendering of cached update indicator upon opening new tabs.

---

## [1.6.0] - 2026-08-27
### Added
- **🌱 Someday Box Widget**: New dedicated widget to capture ideas, backlog items, and future tasks without cluttering today's main Todo list.
- **🏷️ Reusable Custom Tags**: Categorize someday ideas using built-in presets (`🌱 Someday`, `💡 Idea`, `📅 Next Week`, `🎯 Project`, `📚 Learn`) or create custom tags that persist for reuse.
- **🚀 1-Click "Move to Today"**: Instantly promote any someday task into today's active Todo list in the center with a single click.
- **🔍 Interactive Tag Filter Chips**: Quick filtering to view all backlog items or narrow down by specific tags.
- Integrated Someday Box tasks and custom tags into the Backup & Restore system.

---

## [1.5.1] - 2026-08-27
### Added
- Synchronized unread changelog dot indicator with the main Settings floating action button (⚙️), alerting users to newly published updates.

---

## [1.5.0] - 2026-08-27
### Added
- Unread update glowing dot indicator on the "What's New" button in Settings drawer footer that automatically clears once viewed.
- Distinct `✨ Latest` badge and glowing status indicator highlighting the newest release in the What's New timeline.

---

## [1.4.3] - 2026-08-27
### Fixed
- Fixed opaque modal background by applying true translucent frosted glassmorphism with subtle top neon gradient sheen.

---

## [1.4.2] - 2026-08-27
### Added
- Smooth cubic-bezier fade-in and fade-out scale transitions across all dashboard modals on open and close.
### Refactored
- Expanded What's New modal dimensions (600px width) with deep frosted glassmorphism, saturation boost, and improved breathing room.

---

## [1.4.1] - 2026-08-27
### Changed
- Redesigned What's New modal into a clean, modern vertical timeline with glowing status nodes.
- Removed redundant Close button and added click-outside and `Escape` key dismissal.
- Placed GitHub repository link neatly in the header for a compact, distraction-free modal.

---

## [1.4.0] - 2026-08-27
### Added
- Discreet in-app **What's New / Release Notes** viewer modal accessible from the Settings drawer footer.
- Comprehensive `CHANGELOG.md` documentation tracking all releases and updates.
- Modularized release data in `js/data/changelog.js`.
- AI Agent guidelines updated in `AGENTS.md` and `GEMINI.md` to automatically maintain changelog on version bumps.

---

## [1.3.2] - 2026-08-27
### Refactored
- Modularized icon dataset from `widgets.js` into dedicated `js/data/icons.js`.
- Improved maintainability and codebase cleanliness for list datasets.

---

## [1.3.1] - 2026-08-27
### Fixed
- Fixed icon search matching and custom emoji fallback input in Quick Links popover.

---

## [1.3.0] - 2026-08-27
### Added
- New **Quick Links** widget: 5-slot pill tube dock for fast shortcut access.
- Searchable emoji & curated icon picker popover with Google Favicon auto-fallback.
- Inline edit mode with shortcut re-ordering and delete badges.

---

## [1.2.0] - 2026-08-27
### Added
- First-time **Welcome Onboarding Modal** for personalized dashboard greetings.
- Automated background **Update Checker** with GitHub version detection and drawer update banner.
- Custom background dimming and blur slider controls.

---

## [1.1.0] - 2026-08-27
### Added
- Dual-slot widget workspace engine (left and right columns with drag & drop support).
- Task-level stopwatch tracking and elapsed time recording.
- Google Calendar direct schedule modal for tasks.
- Quick Notes scratchpad widget with auto-save.
- Daily Quote inspirational widget.
- Focus Stats productivity summary widget.

---

## [1.0.0] - 2026-08-27
### Added
- Initial release of Productive Tab dashboard.
- Minimalist digital clock with date and dynamic time-based greetings.
- Todo list with priority tags, subtasks, and Obsidian markdown export.
- Milestone habit tracker with streak counting and weekly progress bars.
- Global stopwatch & countdown focus timer.
- Local data backup (Export / Import JSON) and customization settings.
