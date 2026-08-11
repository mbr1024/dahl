# Development Walkthrough: From Demo to Your App

> Everything under `src/routes/` and `src-tauri/src/lib.rs` is demo code. This guide
> explains how to reshape the scaffold into your own app. Pair it with the
> "Renaming the project" section in [README.en.md](../README.en.md).

## 0. The Map: What Happens When You Click Something

```
Button onClick ──invoke("my_command")──▶ Rust #[tauri::command]
      │                                        │
      │  @tauri-apps/plugin-xxx (npm)          │ tauri-plugin-xxx (crate)
      ▼                                        ▼
   capabilities/*.json permission            (security boundary —
   declarations                                missing = call denied)
```

- Frontend: `src/` (routes in `App.tsx`, state in `stores/`, requests in `services/`)
- Backend: `src-tauri/src/lib.rs` (commands, plugin registration, tray)
- Permissions: `src-tauri/capabilities/` (whitelist of what each plugin may do)

## 1. Adding a Page

Taking an `About` page as an example — four steps:

**① Create `src/routes/about.tsx`** (model after `home.tsx`; copy goes through i18n):

```tsx
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("about.title")}</CardTitle>
      </CardHeader>
      <CardContent>{t("about.desc")}</CardContent>
    </Card>
  );
}
```

**② Register the route** in `src/App.tsx`:

```tsx
import AboutPage from "@/routes/about";
// ...
<Route path="about" element={<AboutPage />} />;
```

**③ Add navigation (optional)** — `navItems` in `src/components/layout/app-layout.tsx`:

```tsx
{ to: "/about", label: t("nav.about"), icon: Info }
```

**④ Add i18n copy** in `src/i18n/index.ts` (both zh and en).

Verify with `pnpm dev` (open `/about`) and `pnpm run test`.

## 2. Adding a Rust Command

**① Define the command in `src-tauri/src/lib.rs`** (return values implement
`serde::Serialize`; return `Result<_, String>` to surface errors):

```rust
#[derive(serde::Serialize)]
struct Greeting { message: String }

#[tauri::command]
fn greet(name: String) -> Greeting {
    Greeting { message: format!("Hello, {name}!") }
}
```

**② Register it** in the `invoke_handler` at the bottom of `lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![system_info, greet])
```

**③ Call from the frontend**:

```ts
import { invoke } from "@tauri-apps/api/core";

const res = await invoke<{ message: string }>("greet", { name: "dahl" });
```

**④ Tests**: pure commands get asserted directly in `lib.rs`'s `#[cfg(test)]` module
(see `system_info_reports_current_platform`); frontend interaction tests mock
`@tauri-apps/api/core` with `vi.mock` and assert rendering (see `capabilities.test.tsx`).

## 3. Adding a Tauri Plugin

All three steps are required — skipping the capabilities permission makes the
frontend call fail with "not allowed":

**① Rust side**: `cd src-tauri && cargo add tauri-plugin-xxx`, then register on the
`tauri::Builder` chain in `lib.rs`:

```rust
.plugin(tauri_plugin_xxx::init())
```

**② Frontend side**: `pnpm add @tauri-apps/plugin-xxx`, then `import` and use it.

**③ Permission declaration** in the `permissions` array of
`src-tauri/capabilities/default.json`:

```json
"xxx:default",
"xxx:allow-specific-operation"
```

> Principle: grant only the operations you use (keep shell scopes and similar
> `args: true` entries as narrow as possible) — this is the security boundary of a
> desktop app. `pnpm tauri build --debug` surfaces schema/permission errors if unsure.

## 4. Removing the Demo Code

Remove in dependency order (pages first, then copy, then tests):

1. **Routes**: delete `src/routes/capabilities.tsx`, `data.tsx`, `settings.tsx`
   (`home.tsx` is a fine homepage template)
2. **App.tsx**: remove the corresponding `<Route>`s and imports
3. **Navigation**: drop the entries from `navItems` in `app-layout.tsx`
4. **i18n**: remove `capabilities`/`data` copy from `src/i18n/index.ts` (and
   `settings.update.*` if you drop the update feature)
5. **Tests**: delete the matching cases in `src/routes/*.test.tsx` and
   `app-layout.test.tsx`; update route assertions in `e2e/app.spec.ts`
6. **Rust demo**: remove `system_info` and its registration; the tray / single-instance
   logic can stay
7. **SQLite**: the `todos` table is created at runtime via
   `CREATE TABLE IF NOT EXISTS` — deleting `capabilities.tsx` stops creating it; if you
   change the db filename, make sure no stale references remain in `tauri.conf.json`

Afterwards run `pnpm run typecheck && pnpm run test && pnpm run lint` — the 95%
coverage threshold will tell you if anything is left uncovered.

## 5. Common Pitfalls

| Symptom                   | Cause                                                         | Fix                                                       |
| ------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| invoke says "not allowed" | plugin missing from capabilities                              | add `xxx:default` or a specific allow                     |
| frontend type mismatch    | Rust return shape changed                                     | keep the TS interface in sync with `#[derive(Serialize)]` |
| version chaos on release  | `package.json` / `Cargo.toml` / `tauri.conf.json` out of sync | CI catches it — see [DEPLOYMENT.en.md](DEPLOYMENT.en.md)  |
| i18n key shows raw text   | copy added to only one language                               | add to both zh and en                                     |
