# Changelog

All notable changes to the **Productive Tab** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
