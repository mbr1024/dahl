# Contributing

Thanks for your interest in contributing to Dahl! Dahl is a **scaffold** for Tauri 2 + React 19
desktop apps — the goal is an "out-of-the-box engineering baseline". We particularly welcome:

- Bug fixes and missing engineering practices
- Examples & docs for new Tauri plugins / desktop capabilities
- More unit & e2e tests to raise coverage
- Documentation, comments, and scaffold conventions

## Dev Environment

- Node.js 22+
- Rust stable (via [rustup](https://rustup.rs/))
- Platform dependencies: see the Tauri [Prerequisites](https://tauri.app/start/prerequisites/)
  (macOS: Xcode Command Line Tools; Linux: WebKitGTK and friends)

## Common Commands

| Command                                   | Description                                                  |
| ----------------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                             | Frontend dev server only (port 1420)                         |
| `npm run tauri dev`                       | Run the desktop app in dev mode (first Rust compile is slow) |
| `npm run typecheck`                       | TypeScript type check                                        |
| `npm run lint` / `npm run lint:fix`       | ESLint check / autofix                                       |
| `npm run format` / `npm run format:check` | Prettier format / check                                      |
| `npm test`                                | Vitest unit tests                                            |
| `npm run test:e2e`                        | WebdriverIO e2e (builds a debug binary first)                |
| `npm run tauri build`                     | Bundle installers                                            |

## Code Style

- **Formatting**: handled by Prettier (`.prettierrc`), auto-run on commit (husky + lint-staged)
- **Lint**: ESLint flat config (`eslint.config.js`), TypeScript rules via `typescript-eslint`
- **Structure**: follow the scaffold conventions in `README.md` — one route per file in `routes/`,
  `components/ui/` holds shadcn-generated components (**don't hand-edit**), business components go
  in their own folders, logic extracted to `hooks/`, `lib/`, `services/`
- **i18n**: all UI copy goes through `i18n/` (en/zh) — no hardcoded strings

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add example for a new plugin
fix: fix tray icon rendering in dark mode
docs: document updater deployment
refactor: refactor the system_info command
test: add unit tests for the api layer
ci: enable e2e tests in CI
chore: bump dependencies
```

## Branch & PR Flow

1. Fork the repo, cut a feature branch from `main` (e.g. `feat/xxx`)
2. Keep Conventional Commits style; one PR should do one thing
3. Push and open a Pull Request, linking related issues (e.g. `Closes #12`)
4. Make sure CI is green: `typecheck`, `lint`, unit tests, e2e (Linux), 3-platform build
5. Wait for maintainer review; amend or add follow-up commits as requested

> First-time contributors: no pressure — small fixes and doc improvements are very welcome.

## Test Conventions

- Unit tests live next to the code under test, named `*.test.ts(x)`, run with `npm test`
- E2E specs live in `e2e/`, named `*.spec.ts`, run with `npm run test:e2e`
- E2E uses Tauri's official embedded WebDriver setup (`tauri-plugin-wdio-webdriver`), no external
  driver needed; use `xvfb-run` on headless Linux

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
