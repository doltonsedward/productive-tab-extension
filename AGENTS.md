# Productive Tab Extension - AI Agent Guidelines

## 1. Automatic Semantic Versioning (SemVer)
Whenever you (the AI Agent) make changes, add features, or fix bugs in this codebase, you **MUST ALWAYS** automatically bump the `"version"` in `manifest.json` following the standard **Semantic Versioning (SemVer)** rules (`MAJOR.MINOR.PATCH`):

- **PATCH (`+0.0.1`, e.g., `1.3.1` -> `1.3.2`)**:
  - Bug fixes, CSS/UI tweaks, performance enhancements, or code refactorings without new user-facing features.
- **MINOR (`+0.1.0`, e.g., `1.3.2` -> `1.4.0`)**:
  - New features, new widgets, new settings, onboarding flows, or any backward-compatible user-facing functionality.
  - Reset the patch version to `0` when bumping minor.
- **MAJOR (`+1.0.0`, e.g., `1.4.0` -> `2.0.0`)**:
  - Breaking changes, major UI/UX redesigns, Manifest version upgrades, or breaking data schema migrations.
  - Reset minor and patch versions to `0`.

## 2. Version Synchronization
- **Single Source of Truth**: `manifest.json` is the authoritative source for the extension's version.
- Ensure any hardcoded fallback version (such as `data-version` in `newtab.html` or default fallback in `js/updater.js`) is kept in sync with `manifest.json`.
- The update checker (`js/updater.js`) fetches `manifest.json` from GitHub. Incrementing the version in `manifest.json` is required so that existing extension users receive the update badge/dot indicator when code is pushed.

## 3. Automatic Changelog Maintenance
Whenever you make changes or bump the version, you **MUST ALWAYS** keep both documentation sources up to date:
1. **`CHANGELOG.md`**:
   - Add a new section at the top for the new version (e.g. `## [1.4.0] - YYYY-MM-DD`).
   - Categorize entries cleanly under standard headers: `### Added`, `### Changed`, `### Fixed`, `### Refactored`, or `### Removed`.
2. **`js/data/changelog.js`**:
   - Add the corresponding version object to the top of `CHANGELOG_DATA` so that the in-app "What's New" modal in Settings stays synchronized.
