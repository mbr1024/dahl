# 开发向导：从示例到你的应用

> 本项目的 `src/routes/`、`src-tauri/src/lib.rs` 里全是演示代码。本文按"增删改"三种
> 动作说明如何把它改造成你自己的应用。配合 [README](../README.md) 的「改造为新项目」
> 改名指引使用。

## 0. 地图：一次交互走通哪些层

```
前端按钮 onClick ──invoke("my_command")──▶ Rust #[tauri::command]
      │                                         │
      │  @tauri-apps/plugin-xxx（npm）           │ tauri-plugin-xxx（crate）
      ▼                                         ▼
   capabilities/*.json 权限声明 ──── 安全边界（漏配 = 调用被拒）
```

- 前端：`src/`（路由在 `App.tsx`，状态在 `stores/`，请求在 `services/`）
- 后端：`src-tauri/src/lib.rs`（命令、插件注册、托盘）
- 权限：`src-tauri/capabilities/`（每个插件能干什么，白名单）

## 1. 加一个页面

以 `关于` 页为例，四步：

**① 建文件 `src/routes/about.tsx`**（参照 `home.tsx` 的写法，文案走 i18n）：

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

**② 注册路由** `src/App.tsx`：

```tsx
import AboutPage from "@/routes/about";
// ...
<Route path="about" element={<AboutPage />} />;
```

**③ 加导航（可选）** `src/components/layout/app-layout.tsx` 的 `navItems`：

```tsx
{ to: "/about", label: t("nav.about"), icon: Info }
```

**④ 补 i18n 文案** `src/i18n/index.ts`（中英两处都要）。

验证：`pnpm dev` 后访问 `/about`；测试用 `pnpm run test`。

## 2. 加一个 Rust 命令

**① 在 `src-tauri/src/lib.rs` 定义命令**（返回值要实现 `serde::Serialize`，参数可加
`Result<_, String>` 返回错误）：

```rust
#[derive(serde::Serialize)]
struct Greeting { message: String }

#[tauri::command]
fn greet(name: String) -> Greeting {
    Greeting { message: format!("Hello, {name}!") }
}
```

**② 注册到 invoke_handler**（`lib.rs` 末尾）：

```rust
.invoke_handler(tauri::generate_handler![system_info, greet])
```

**③ 前端调用**：

```ts
import { invoke } from "@tauri-apps/api/core";

const res = await invoke<{ message: string }>("greet", { name: "dahl" });
```

**④ 测试**：纯逻辑命令在 `lib.rs` 的 `#[cfg(test)]` 模块直接断言（参照现有
`system_info_reports_current_platform`）；前端交互测试在 `src/routes/*.test.tsx` 里
`vi.mock("@tauri-apps/api/core")` 后断言渲染（参照 `capabilities.test.tsx`）。

## 3. 接一个 Tauri 插件

三步缺一不可（漏了 capabilities 权限，前端调用会直接报 "not allowed"）：

**① Rust 侧**：`cd src-tauri && cargo add tauri-plugin-xxx`，然后在 `lib.rs` 的
`tauri::Builder` 链上注册：

```rust
.plugin(tauri_plugin_xxx::init())
```

**② 前端侧**：`pnpm add @tauri-apps/plugin-xxx`，即可 `import` 使用。

**③ 权限声明** `src-tauri/capabilities/default.json` 的 `permissions` 数组：

```json
"xxx:default",
"xxx:allow-具体操作"
```

> 原则：只给用到的操作放权（`args: true` 的 shell scope 之类要写最小心眼范围），
> 这是桌面应用的安全边界。可运行 `pnpm tauri build --debug` 看权限 schema 报错提示。

## 4. 清理演示代码

把脚手架改成你自己的应用时，按依赖顺序删（先删页面，再删文案，最后删测试）：

1. **路由**：删 `src/routes/capabilities.tsx`、`data.tsx`、`settings.tsx`（`home.tsx` 可留作首页模板）
2. **App.tsx**：删对应 `<Route>` 与 import
3. **导航**：`app-layout.tsx` 的 `navItems` 删对应项
4. **i18n**：`src/i18n/index.ts` 删 `capabilities`/`data` 相关文案（`settings` 若删了更新
   功能则连 `settings.update.*` 一并删）
5. **测试**：删 `src/routes/*.test.tsx`、`src/components/layout/app-layout.test.tsx` 中
   对应用例；`e2e/app.spec.ts` 里对应路由的断言
6. **Rust 示例**：`lib.rs` 删 `system_info` 命令与注册；保留托盘/单实例逻辑可继续用
7. **SQLite**：demo 表（`todos`）是运行时 `CREATE TABLE IF NOT EXISTS` 建的，删掉
   `capabilities.tsx` 即不再创建；若换了 db 文件名，确认 `tauri.conf.json` 与
   capabilities 无残留引用

删完后跑一遍 `pnpm run typecheck && pnpm run test && pnpm run lint`，确保没有
悬空引用（覆盖率阈值 95% 会自动提示还有多少未覆盖）。

## 5. 常见坑

| 现象                    | 原因                                                         | 处理                                              |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| invoke 报 "not allowed" | capabilities 没给该插件放权                                  | 补 `xxx:default` 或具体 allow                     |
| 前端类型对不上          | Rust 返回值结构没同步到前端类型                              | 手写 interface 与 `#[derive(Serialize)]` 字段对齐 |
| 改了版本发版乱套        | `package.json` / `Cargo.toml` / `tauri.conf.json` 三处不同步 | CI 会报错，见 [DEPLOYMENT.md](DEPLOYMENT.md)      |
| i18n 缺失 key 显示原文  | 只在 zh/en 一处加了文案                                      | 两处都要加                                        |
