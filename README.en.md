# Dahl

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
![Tauri 2](https://img.shields.io/badge/Tauri-2-24c8db)
![React 19](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
[![CI](https://github.com/mbr1024/dahl/actions/workflows/build.yml/badge.svg)](https://github.com/mbr1024/dahl/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/mbr1024/dahl/graph/badge.svg)](https://app.codecov.io/gh/mbr1024/dahl)

**中文版（默认）: [README.md](README.md).**

A production-ready [Tauri 2](https://tauri.app) + React 19 desktop app scaffold, bundled with the mainstream engineering practices of 2026. Open the box and start building.

> Status: `0.2.0`. Release & update pipeline: [docs/DEPLOYMENT.en.md](docs/DEPLOYMENT.en.md) · Changelog: [CHANGELOG.en.md](CHANGELOG.en.md)

## Tech Stack

| Layer   | Choice                                     |
| ------- | ------------------------------------------ |
| UI      | React 19 + TypeScript + Vite               |
| Desktop | Tauri 2 (Rust)                             |
| Routing | react-router v8                            |
| State   | zustand (client) + TanStack Query (server) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix)        |
| Linting | ESLint 10 (flat config) + Prettier         |

## Quick Start

```bash
# Option 1: scaffold a new project from this template (no fork needed)
pnpm dlx degit mbr1024/dahl my-app && cd my-app && pnpm install
pnpm run tauri dev        # dev mode (first Rust compile is slow)

# Option 2: develop in this repo
pnpm install
pnpm run tauri dev        # dev mode (first Rust compile is slow)
pnpm run tauri build      # bundle installers
```

## Renaming for Your Own Project

The template ships with the placeholder name `Dahl`. When scaffolding your own project,
rename the following (degit does no variable substitution — 5 manual edits):

| Item                                       | Location                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Package name                               | `package.json` → `name`                                                                                   |
| Rust crate name                            | `src-tauri/Cargo.toml` → `package.name`                                                                   |
| App name / window title                    | `src-tauri/tauri.conf.json` → `productName`, `app.windows[0].title`                                       |
| App identifier (install paths / bundle ID) | `src-tauri/tauri.conf.json` → `identifier` (e.g. `com.acme.myapp`)                                        |
| deep-link scheme                           | `src-tauri/tauri.conf.json` → `plugins.deep-link.identifiers`, also `src-tauri/Info.plist` URL scheme     |
| App icons                                  | regenerate the full `src-tauri/icons/` set from your artwork with `scripts/make-app-icon.py` (see header) |

Then run `pnpm run tauri dev` and confirm the app name, window title, and `dahl://` scheme
are all replaced. If you changed the `identifier`, remove config leftovers from the old one
(e.g. the old directory under `~/Library/Application Support/` on macOS) before first run.

> This template targets **desktop** (macOS / Windows / Linux). Although
> `src-tauri/icons/` includes Android/iOS assets, the capabilities and plugin choices
> (autostart, window-state, updater, tray) are desktop-only — mobile is out of scope.

## Common Commands

```bash
pnpm run dev              # frontend dev server only
pnpm run build            # frontend build
pnpm run typecheck        # TypeScript type check
pnpm run lint             # ESLint
pnpm run lint:fix         # ESLint autofix
pnpm run format           # Prettier format
pnpm run test             # Vitest unit tests
pnpm run test:coverage    # unit tests + coverage report (HTML into coverage/)
pnpm run test:e2e         # WebdriverIO e2e (builds debug binary first)
pnpm run changeset        # record a version change (auto version PR)
pnpm run tauri build      # bundle installers (macOS: .app/.dmg)
```

## End-to-End Testing

Built on WebdriverIO + `@wdio/tauri-service` (embedded WebDriver — the WebDriver server runs
inside the app, no external driver needed). Covers: app launch, Rust command invoke, routing, i18n switching.

```bash
pnpm run test:e2e         # build debug binary, then run
pnpm run test:e2e:run     # run directly (CI, when binary already built)
```

Notes:

- **Close any running Dahl instance first** (the single-instance plugin hands off new launches to the existing process)
- Test plugins (`tauri-plugin-wdio`) are registered in dev/debug builds only; release artifacts carry no test backdoor
- On headless Linux use `xvfb-run`; macOS/Windows work out of the box
- Tests live in `e2e/`, config in `wdio.conf.ts`, type checks in `tsconfig.e2e.json`

## Walkthrough

From demo to your own app (adding pages / Rust commands / plugins, removing demo
code): see **[docs/WALKTHROUGH.en.md](docs/WALKTHROUGH.en.md)**.

## Coverage

Unit-test coverage is measured by Vitest v8 (`test:coverage`) — currently ~99%, with
a 95% regression threshold in `vitest.config.ts`. CI runs coverage on every push/PR
and uploads it to [Codecov](https://app.codecov.io/gh/mbr1024/dahl).

## Directory Structure

```
src/
├── routes/          # page components (one route per file)
├── components/
│   ├── ui/          # shadcn-generated components (don't edit)
│   ├── layout/      # app shell, theme/language providers
│   └── error-boundary.tsx  # global error boundary
├── stores/          # zustand global state (theme/language, persisted)
├── services/        # data layer (TanStack Query + http plugin)
├── i18n/            # react-i18next (zh/en, Chinese default)
├── hooks/           # shared hooks
├── lib/             # utilities (cn, etc.)
└── test/            # test setup
src-tauri/
├── src/lib.rs       # Rust entry: plugin registration, commands, tray
├── capabilities/    # permissions (zero-trust, opt-in)
└── tauri.conf.json  # window, bundling, updater, deep-link config
e2e/                 # WebdriverIO e2e tests (embedded WebDriver)
docs/                # deployment & ops docs (updater setup, etc.)
.github/workflows/   # CI: check / e2e / Linux build (full 3-platform release on tag)
```

## Bundled Plugins

`fs`, `dialog`, `store`, `window-state`, `clipboard-manager`,
`notification`, `single-instance`, `http`, `updater`, `log`, `autostart`,
`sql` (SQLite), `shell`, `deep-link`, `opener`

The example page (sidebar → Desktop Capabilities) demonstrates: Rust command invoke,
file dialogs, clipboard, system notifications,
key-value store, SQLite CRUD, shell execution, and deep-link handling.

## Contributing

Issues and PRs are welcome! Please read [CONTRIBUTING.en.md](.github/CONTRIBUTING.en.md) first
(dev environment, commit conventions, PR flow). Report security issues via
[SECURITY.en.md](.github/SECURITY.en.md).

## Scaffold Conventions

- **Permissions**: Tauri 2 denies everything by default. `clipboard-manager` /
  `sql` / `shell` / `deep-link` ship with empty `default` permission sets — add explicit `allow-*`
  entries in `capabilities/` when using them (debug: see `src-tauri/gen/schemas/acl-manifests.json`)
- **Tray**: left-click toggles the main window, right-click menu quits; closing the window hides it to the tray
- **Updater**: GitHub Releases is the update source (endpoint points to `latest.json`); the production
  signing key is configured, and CI signs and generates the update manifest on release — see [docs/DEPLOYMENT.en.md](docs/DEPLOYMENT.en.md)
- **Deep-link**: scheme is `dahl://`; register the scheme first when testing in dev mode
- **Theme/language**: controlled by `src/stores/use-settings.ts`, preferences persisted; Chinese by default
- **Commits**: husky + lint-staged run lint/format automatically on pre-commit

## Recommended IDE

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
