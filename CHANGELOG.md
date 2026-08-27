# Changelog

All notable changes to the **Productive Tab** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
