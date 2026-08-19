# AI Agent Guide

## Project

- This repository is a desktop application scaffold built with Tauri 2, Rust 1.95.0, React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack Query, and react-i18next.
- The supported platform is desktop: macOS, Windows, and Linux. Mobile assets are present but mobile builds are out of scope.
- Use pnpm 10.14.0, Node.js 22.12.0, and the toolchain versions in `.node-version` and `rust-toolchain.toml`.

## Before Editing

- Read the relevant section of `README.md` and `docs/WALKTHROUGH.md` before changing scaffold conventions.
- Check `git status --short` first. Do not revert or overwrite unrelated worktree changes.
- Run `pnpm run version:check` when changing release or package metadata.
- Run `pnpm run identity:check` after renaming the scaffold for a new application. The template repository is expected to retain some `mbr1024/dahl` upstream references until it is forked.

## Source Layout

- Put page-level components in `src/routes/`, one route per file.
- Put reusable business components outside `src/components/ui/`; `src/components/ui/` contains generated shadcn components and should not be hand-edited.
- Put shared React behavior in `src/hooks/`, client state in `src/stores/`, database and network access in `src/services/`, and small pure helpers in `src/lib/`.
- Register routes in `src/App.tsx` and navigation items in `src/components/layout/app-layout.tsx`.
- Keep user-facing text in both `zh` and `en` resources in `src/i18n/index.ts`. Do not add hardcoded UI copy in page or component JSX.
- Keep the document language and title synchronized through `LanguageSync`.

## Tauri Rules

- Every native capability needs both the Rust/npm plugin wiring and an explicit permission in `src-tauri/capabilities/`.
- Keep permissions narrow. The HTTP demo is restricted to `https://api.github.com/**`; update it when the API configuration changes. Do not add broad HTTP or cleartext HTTP access for convenience.
- Keep shell commands allowlisted with the smallest possible command and argument scope.
- `withGlobalTauri` is currently required by the embedded WebDriver bridge. Do not remove it without updating the E2E setup.
- Deep-link listening is global in `src/hooks/use-deep-link-listener.ts`; the URL list is exposed through `src/stores/use-deep-link-store.ts`. Handle both cold-start URLs from `getCurrent()` and subsequent URLs from `onOpenUrl()`.
- Keep Rust commands registered in `src-tauri/src/lib.rs` and return serializable, typed values.

## Data And Configuration

- Use parameterized SQL in `src/services/todos.ts`; extend the migration flow instead of adding one-off schema changes.
- Use TanStack Query for server/database state and invalidate the relevant query after mutations.
- Runtime demo API values come from `.env` variables described in `.env.example`. Never commit secrets; `.env` files are ignored.
- Use `src/config.ts` for app-level environment-backed configuration rather than scattering URLs or repository names through components.

## Release And Versioning

- User-visible changes should include a Changeset via `pnpm run changeset`.
- `pnpm run changeset:version` synchronizes `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.lock` through `scripts/sync-version.mjs`.
- Keep the updater endpoint, deep-link scheme, package name, Rust crate name, product name, identifier, and icons consistent after renaming the scaffold.
- Signing keys and platform notarization/code-signing certificates belong in CI secrets, never in the repository.

## Validation

Run the relevant checks after edits. For broad changes, run all of these:

```bash
pnpm run version:check
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm run test:coverage
pnpm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
pnpm audit
cargo audit
pnpm run test:e2e
```

- `pnpm run test:e2e` builds the debug binary first. `pnpm run test:e2e:run` assumes it already exists.
- Do not lower coverage thresholds to make a change pass. Add or update tests instead.
- Do not commit, amend, or push unless explicitly requested.
