# 贡献指南

感谢你有兴趣为 Dahl 贡献！Dahl 是一个 Tauri 2 + React 19 桌面应用**脚手架**，目标是成为"开箱即用的工程化样板"。我们特别欢迎以下方向的贡献：

- 修复 Bug 或补齐缺失的工程化实践
- 新增 Tauri 插件 / 桌面能力的示例与文档
- 补充单元测试与 e2e 测试，提升覆盖率
- 完善文档、注释与脚手架约定

## 开发环境

- Node.js 22+
- Rust stable（建议通过 [rustup](https://rustup.rs/) 安装）
- 平台依赖：请参考 Tauri 官方 [Prerequisites](https://tauri.app/start/prerequisites/)（macOS 需要 Xcode Command Line Tools；Linux 需要 WebKitGTK 等）

## 常用命令

| 命令                                        | 说明                                            |
| ------------------------------------------- | ----------------------------------------------- |
| `pnpm run dev`                              | 仅前端 dev server（端口 1420）                  |
| `pnpm run tauri dev`                        | 开发模式运行桌面应用（首次编译 Rust 较慢）      |
| `pnpm run typecheck`                        | TypeScript 类型检查                             |
| `pnpm run lint` / `pnpm run lint:fix`       | ESLint 检查 / 自动修复                          |
| `pnpm run format` / `pnpm run format:check` | Prettier 格式化 / 检查                          |
| `pnpm run test`                             | Vitest 单元测试                                 |
| `pnpm run test:e2e`                         | WebdriverIO 端到端测试（会先构建 debug 二进制） |
| `pnpm run tauri build`                      | 打包安装包                                      |

## 代码规范

- **格式**：统一由 Prettier 处理（`.prettierrc`），提交前会自动执行（husky + lint-staged）
- **Lint**：ESLint flat config（`eslint.config.js`），TypeScript 相关规则见 `typescript-eslint`
- **目录职责**：请遵循 [`README.md`](../README.md) 中的脚手架约定——`routes/` 一个路由一个文件，`components/ui/` 为 shadcn 生成组件（**勿手改**），业务组件放自己的目录，逻辑抽到 `hooks/`、`lib/`、`services/`
- **语言**：文案一律走 `i18n/`（zh/en），不要硬编码

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```
feat: 新增 xxx 插件示例
fix: 修复托盘图标在深色模式下的显示
docs: 补充 updater 部署文档
refactor: 重构 system_info 命令
test: 为 api 层补充单元测试
ci: 在 CI 中启用 e2e 测试
chore: 升级依赖
```

## 分支与 PR 流程

1. Fork 本仓库，从 `main` 切出特性分支（如 `feat/xxx`）
2. 本地提交时保持 Conventional Commits 风格，一个 PR 尽量只做一件事
3. 推送后创建 Pull Request，关联相关 Issue（如 `Closes #12`）
4. 确保 CI 全绿：`typecheck`、`lint`、单元测试、e2e（Linux）、三平台构建
5. 等待维护者 review；根据反馈修改后，用 `git commit --amend` 或新增提交均可

> 第一次贡献者不用有压力——小修小补、文档改进都非常欢迎。

## 版本变更集（Changesets）

本项目用 [Changesets](https://github.com/changesets/changesets) 管理版本与 CHANGELOG。**凡是对用户可见的行为变更**（新功能、修复、破坏性改动），功能 PR 必须附带一个变更集：

```bash
pnpm changeset
```

交互式选择变更类型（major / minor / patch）并填写描述，会生成一个 `.changeset/xxx.md` 文件，随 PR 一起提交。变更集是"发布说明草稿"，不会立即改版本号。

- 纯内部改动（重构、文档、CI、依赖升级）不需要变更集
- 描述面向最终用户，说明"做了什么、影响什么"，而不是复述代码
- 一个变更集对应一个用户可感知的变化；一个 PR 可包含多个变更集

## 测试约定

- 单元测试放在被测文件同目录，命名 `*.test.ts(x)`，运行 `pnpm run test`
- e2e 用例放在 `e2e/`，命名 `*.spec.ts`，运行 `pnpm run test:e2e`
- e2e 基于 Tauri 官方 embedded WebDriver 方案（`tauri-plugin-wdio-webdriver`），无需安装外部 driver；Linux 无显示环境需用 `xvfb-run`

## 开源许可

提交即表示你同意你的贡献以 [MIT License](../LICENSE) 授权。
