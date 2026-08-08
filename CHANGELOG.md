# Changelog

Versioning follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/). Releases and changelogs are maintained
automatically by [Changesets](https://github.com/changesets/changesets).

## [0.1.0] - 2026-08-08

### Added

- Initial scaffold: Tauri 2 + React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui
- Routing (react-router v8), state management (zustand + TanStack Query), i18n
  (react-i18next, en/zh, English by default)
- 16 official Tauri plugins integrated: fs / dialog / store / window-state /
  clipboard-manager / global-shortcut / notification / single-instance / http /
  updater / log / autostart / sql(SQLite) / shell / deep-link / opener
- System tray (macOS template icon), main-window vibrancy (macOS), hide-to-tray on close
- Engineering: ESLint 10 flat config, Prettier, husky + lint-staged, Vitest unit tests,
  WebdriverIO e2e, 3-platform CI builds
- Zero-trust permission model with permission gotcha conventions documented
- Programmatic icon generation scripts (`scripts/make-app-icon.py`,
  `scripts/make-tray-template.py`)
