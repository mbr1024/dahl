# 安全策略

## 报告漏洞

**请不要在公开的 Issue 中提交安全漏洞细节。**

优先使用 GitHub 的私有漏洞报告功能（仓库页面 → Settings → Security → Private vulnerability reporting）；若未启用，请通过仓库主页标注的联系方式直接联系维护者。

我们会承诺：

- 收到报告后 **72 小时内**确认收悉
- 评估影响并给出修复计划
- 修复完成后发布安全公告（GitHub Security Advisory）

## 本项目与安全相关的设计

- **权限模型**：基于 Tauri 2 的 zero-trust 权限模型，所有能力默认拒绝，仅在 `src-tauri/capabilities/` 按需放开（`allow-*`）
- **更新签名**：`updater` 使用 minisign 签名，客户端校验公钥（正式部署步骤见 [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)）
- **CSP**：`tauri.conf.json` 中配置了严格的 Content Security Policy，限制脚本、样式与网络请求来源
- **测试插件隔离**：WebdriverIO 测试插件仅在 `debug_assertions`（dev 构建）下注册，不会进入 release 产物
- **网络**：HTTP 请求默认走 `@tauri-apps/plugin-http`，`capabilities` 中显式约束允许访问的 URL

## 依赖漏洞

- 前端依赖使用 `pnpm audit` 定期检查
- Rust 依赖建议使用 `cargo audit` 检查
- 含安全修复的上游版本更新会优先合入

## 分支支持

当前处于 0.x 阶段（脚手架），仅维护 `main` 分支；1.0 之后将按语义化版本维护策略执行。
