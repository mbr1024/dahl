# AI 代理指南

## 项目

- 本仓库是一个桌面应用脚手架，技术栈：Tauri 2、Rust 1.95.0、React 19、TypeScript、Vite、Tailwind CSS v4、Zustand、TanStack Query、react-i18next。
- 支持平台为桌面端：macOS、Windows、Linux。虽包含移动端素材，但移动端构建不在支持范围内。
- 使用 pnpm 10.14.0、Node.js 22.12.0，以及 `.node-version` 和 `rust-toolchain.toml` 中声明的工具链版本。

## 编辑前

- 修改脚手架约定前，先阅读 `README.md` 和 `docs/WALKTHROUGH.md` 的相应章节。
- 先执行 `git status --short`。不要回退或覆盖工作区中与本任务无关的改动。
- 改动发布或包元数据时，运行 `pnpm run version:check`。
- 为脚手架改名生成新应用后，运行 `pnpm run identity:check`。模板仓库在 fork 之前预期会保留部分指向上游的 `mbr1024/dahl` 引用。

## 源码结构

- 页面级组件放在 `src/routes/`，一个路由对应一个文件。
- 可复用业务组件放在 `src/components/ui/` 之外；`src/components/ui/` 存放 shadcn 生成的组件，不要手改。
- 共享的 React 行为放在 `src/hooks/`，客户端状态放在 `src/stores/`，数据库与网络访问放在 `src/services/`，小的纯工具函数放在 `src/lib/`。
- 在 `src/App.tsx` 注册路由，在 `src/components/layout/app-layout.tsx` 注册导航项。
- 面向用户的文案要同时写入 `src/i18n/index.ts` 的 `zh` 与 `en` 资源。不要在页面或组件 JSX 中硬编码 UI 文案。
- 通过 `LanguageSync` 保持文档语言与标题同步。

## Tauri 规则

- 每个原生能力都需要 Rust/npm 插件接线，以及在 `src-tauri/capabilities/` 中的显式权限。
- 保持权限最小化。HTTP 示例仅允许 `https://api.github.com/**`；API 配置变化时同步更新。不要为了方便添加宽泛的 HTTP 或明文 HTTP 访问。
- Shell 命令放行列表保持在最小范围，命令与参数范围尽可能小。
- `withGlobalTauri` 目前是嵌入式 WebDriver 桥接所必需。在没有同步更新 E2E 配置前不要移除。
- deep-link 监听是全局的，位于 `src/hooks/use-deep-link-listener.ts`；URL 列表通过 `src/stores/use-deep-link-store.ts` 暴露。要同时处理 `getCurrent()` 的冷启动 URL 与 `onOpenUrl()` 的后续 URL。
- Rust 命令注册在 `src-tauri/src/lib.rs`，并返回可序列化、带类型的结果。

## 数据与配置

- 在 `src/services/todos.ts` 中使用参数化 SQL；通过扩展迁移流程来加 schema 变更，不要做一次性改动。
- 用 TanStack Query 管理服务端/数据库状态，并在变更后使相关 query 失效。
- 运行时演示 API 值来自 `.env` 变量，见 `.env.example` 说明。绝不提交密钥；`.env` 文件已被忽略。
- 用 `src/config.ts` 做应用级、基于环境的配置，不要把 URL 或仓库名散落在组件里。

## 发布与版本

- 用户可见的改动应通过 `pnpm run changeset` 记录变更集。
- `pnpm run changeset:version` 会通过 `scripts/sync-version.mjs` 同步 `package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json` 与 `src-tauri/Cargo.lock`。
- 改名后要保持 updater endpoint、deep-link scheme、包名、Rust crate 名、product name、identifier 与图标一致。
- 签名密钥与各平台公证/代码签名证书属于 CI 密钥，绝不能放进仓库。

## 校验

编辑后运行相关检查。改动较大时，全部运行：

```bash
pnpm run version:check
pnpm run identity:check
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

- `pnpm run test:e2e` 会先构建 debug 二进制；`pnpm run test:e2e:run` 假定它已存在。
- 不要为让改动通过而降低覆盖率阈值，应新增或更新测试。
- 除非用户明确要求，否则不要提交、amend 或推送。
