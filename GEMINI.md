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

## 2. Single Source of Truth for Versioning
- **`manifest.json` is the SOLE authoritative source for the extension's version.**
- All UI and code modules (settings footer, update checker, changelog modal) read the version dynamically at runtime via `chrome.runtime.getManifest().version`.
- **NEVER** hardcode version numbers in `newtab.html`, `js/updater.js`, `js/settings.js`, or `README.md` (which uses a dynamic Shields.io badge reading `manifest.json` from GitHub).
- Updating `"version"` in `manifest.json` is the **ONLY** required file change for bumping the version.

## 3. Single Source of Truth for Changelog
- **`CHANGELOG.md` is the SOLE authoritative complete history of all releases.**
- The in-app "What's New" release notes modal dynamically parses `CHANGELOG.md` locally via `fetch(chrome.runtime.getURL("CHANGELOG.md"))`.
- Whenever you make changes or bump the version, you **MUST record the release notes ONLY in `CHANGELOG.md`**:
  - Add a new section at the top for the new version (e.g. `## [1.17.8] - YYYY-MM-DD`).
  - Categorize entries cleanly under standard headers: `### Added`, `### Changed`, `### Fixed`, `### Refactored`, or `### Removed`.
- **Do NOT create or maintain a separate `js/data/changelog.js` file.**

## 4. UI/UX Design System & Aesthetics (Muted Glassmorphism)
All UI additions, tweaks, and widgets **MUST ALWAYS** follow these core design principles:

### A. Central Visual Hierarchy (Todo List is the Hero)
- The **Todo List** in the center is always the primary focal point of the new tab dashboard.
- Side widgets (Someday Box, Quick Links, Notes, Quotes, Habits, etc.) must remain visually **secondary, passive, and calm**. They must never compete with or distract from the main Todo List.

### B. Dim, Muted Glassmorphism Style
- **Backgrounds**: Use dark translucent glass layers (`rgba(255, 255, 255, 0.025 - 0.08)`), subtle backdrop blur (`backdrop-filter: blur(16px - 22px)`), and gentle borders (`1px solid rgba(255, 255, 255, 0.06 - 0.12)`).
- **No Harsh Neon or Loud Glows**: Avoid 100% saturated neon accents or heavy glowing box-shadows. Instead, use soft, muted pastel tones with low opacity (`rgba(..., 0.35 - 0.5)` for accents, `rgba(..., 0.07 - 0.12)` for fills).
- **Subdued Resting State**: Action buttons (such as delete, edit, move buttons, or colorful emojis) inside widget items should be hidden (`opacity: 0`) or very dim when idle, smoothly fading in (`opacity: 0.85 - 1`) only when the parent item is hovered.
- **Micro-Interactions**: Hover animations must be subtle and calm (e.g. `translateY(-1.5px)` elevation, slight border lightening) instead of aggressive scaling or bouncy transitions.

## 5. English Language Standard
- **Universal English UI & Codebase**: All user-facing UI text, widget names, placeholders, labels, toasts, modals, tooltips, code comments, documentation, and changelog release notes **MUST ALWAYS be strictly written in English**.

