# 项目协作说明

这是一份给 AI 和新协作者的项目速记，不替代 `README.md` 和
`docs/WALKTHROUGH.md`。遇到脚手架约定、改名或发布问题，先看那两份文档；这份文件只记录
这个仓库最容易踩的坑。

## 项目边界

Dahl 是 Tauri 2 + React 19 的桌面应用脚手架，支持 macOS、Windows、Linux。移动端图标素材
只是顺手保留，移动端不是本项目的目标。

开发环境按仓库文件来：pnpm 10.14.0、Node.js 22.12.0、Rust 1.95.0。Node 版本见
`.node-version`，Rust 版本见 `rust-toolchain.toml`。

常用入口：`pnpm run dev` 只启动前端，`pnpm run tauri:dev` 启动桌面应用，`pnpm run build`
只构建前端，`pnpm run tauri:build` 打包安装包。

## 动手前

先看一眼：

```bash
git status --short
```

不要顺手清理、回退或覆盖不属于当前任务的改动。涉及脚手架结构时，先读 README 和 walkthrough
对应章节；涉及版本号时，最后跑 `pnpm run version:check`。

把 Dahl 改成新应用后，再跑 `pnpm run identity:check`。模板仓库本身会保留一些
`mbr1024/dahl` 上游链接，这些提示在 fork 之前是正常的。

## 代码放哪

- 页面放 `src/routes/`，一个路由一个文件。
- 业务组件放 `src/components/`，`src/components/ui/` 是 shadcn 生成目录，除非重新生成组件，不直接改里面的文件。
- 共用行为放 `src/hooks/`，客户端状态放 `src/stores/`，数据库和网络访问放 `src/services/`，小工具放 `src/lib/`。
- 路由入口在 `src/App.tsx`，侧边栏在 `src/components/layout/app-layout.tsx`。
- 用户能看到的文字进 `src/i18n/index.ts`，zh/en 两边一起改。页面 JSX 里不要留下只在一种语言下可见的硬编码文案。
- `src-tauri/gen/schemas/`、`dist/`、`coverage/`、`logs/` 和 `src-tauri/target/` 都是生成物，不要手改或提交。

## Tauri 这边

新增一个原生能力通常要同时改 npm 插件、Rust 插件注册和 `src-tauri/capabilities/` 权限。
权限漏了会得到 `not allowed`，权限放宽了则会把安全边界一起放宽。

- HTTP 示例只允许 `https://api.github.com/**`，改 API 配置时同步改 capability；不要为了调试加入泛域名或明文 HTTP。
- Shell scope 只放行实际要执行的命令和参数。
- `withGlobalTauri` 是 embedded WebDriver 测试桥接的一部分，不能单独删除。
- 深链接监听在 `src/hooks/use-deep-link-listener.ts`，收到的 URL 放在 `src/stores/use-deep-link-store.ts`。冷启动看 `getCurrent()`，运行中唤起看 `onOpenUrl()`，两条都不能漏。
- macOS Dock、托盘和再次启动都应该调用“显示并聚焦”，托盘菜单才使用 toggle。窗口关闭事件目前是隐藏到托盘，不是退出应用。
- 改 deep-link scheme 时，`src-tauri/tauri.conf.json` 和 macOS 的 `src-tauri/Info.plist` 要一起改。
- `src-tauri/capabilities/desktop.json` 放桌面专属的 updater、autostart 和 window-state 权限；不要把移动端能力混进来。

## 数据和配置

`src/services/todos.ts` 里的 SQL 都用参数绑定。改表结构要扩展 migration，不要再塞一个只执行一次的
`CREATE TABLE`。

TanStack Query 负责服务端和数据库状态；新增、删除、切换之后记得让对应 query 失效。演示 API 的
地址和仓库名从 `.env` / `src/config.ts` 来，示例见 `.env.example`，不要把密钥放进仓库。
pnpm 的依赖 override 放在 `pnpm-workspace.yaml`，不是 `package.json`。

## 测试习惯

前端单测和被测文件放在一起，文件名用 `*.test.ts(x)`；E2E 用例放在 `e2e/`，文件名用
`*.spec.ts`。`pnpm run test:e2e` 前先关闭正在运行的 Dahl 实例，single-instance 会让新进程让位给旧进程。
已有 debug 二进制时用 `pnpm run test:e2e:run`，Linux 无显示环境需要 `xvfb-run`。

## 改名和发版

改名时要一起检查 package name、Rust crate、product name、identifier、deep-link scheme、updater
endpoint 和图标。E2E 二进制默认从 `package.json` 取名；Rust crate 名不同才需要设置
`TAURI_BINARY_NAME`。

用户可见的改动带一个 Changeset：

```bash
pnpm run changeset
```

`pnpm run changeset:version` 会通过 `scripts/sync-version.mjs` 同步前端、Tauri、Cargo 和
`Cargo.lock` 的版本。签名私钥、Apple 公证和 Windows 代码签名证书只放 CI Secret。

Changesets workflow 会在 `main` 上生成版本 PR；合并后再推送 `v*` tag，release workflow 才会构建
三平台安装包。release 默认先建 draft，发布 updater 前要确认 draft 已发布。

## CI 对应关系

普通 push/PR 会检查版本与身份、TypeScript、ESLint、Prettier、Rust fmt/clippy、依赖审计和覆盖率；
随后在 Linux 上跑 embedded WebDriver E2E 和构建冒烟。三平台完整打包只在 `v*` tag 上运行。

## 交付前

小的前端改动至少跑：

```bash
pnpm run version:check
pnpm run identity:check
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm run test
```

涉及构建、Rust 或桌面能力时，再补：

```bash
pnpm run test:coverage
pnpm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
pnpm audit
cargo audit
pnpm run test:e2e
```

`pnpm run test:e2e` 会先编译 debug 二进制；已有二进制时可以用
`pnpm run test:e2e:run`。覆盖率阈值不要为了过 CI 而下调，缺什么测试就补什么测试。

提交和推送由任务发起人决定；没有明确要求时，只保留工作区修改。
