---
"dahl": minor
---

feat: 深链接监听提升为应用级（`use-deep-link-listener` + `use-deep-link-store`），支持冷启动 URL 与后续唤起统一收集，示例页改为读取该 store

feat: 页面路由改为 `React.lazy` + `Suspense` 按需加载，首屏更轻

feat: 数据请求与示例 API 地址集中到 `src/config.ts`，由 `.env`（`VITE_GITHUB_API_URL` 等）驱动；HTTP 权限收窄到 `https://api.github.com/**`

feat: 新增 `scripts/sync-version.mjs`，`changeset:version` 自动同步 package.json / Cargo.toml / tauri.conf.json / Cargo.lock 版本；新增 `identity:check` 扫描改名后残留的模板上游引用

refactor: 页面/设置文案 i18n 全覆盖（zh/en），移除 JSX 中的硬编码文案；CSP 收紧移除 `unsafe-eval` / `unsafe-inline`

fix: 通知、消息框、键值存储、deep-link 等异步操作补 try/catch，避免未捕获拒绝
