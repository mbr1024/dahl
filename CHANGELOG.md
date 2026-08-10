# Changelog

本项目的版本遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与 [语义化版本](https://semver.org/lang/zh-CN/)。版本与变更记录由 [Changesets](https://github.com/changesets/changesets) 自动维护。

## [Unreleased]

### Added

- 静默自动更新与更新状态指示（示例页 i18n 全覆盖）

### Fixed

- 关于区版本号改为运行时读取（`getVersion`），不再硬编码
- release 后自动重写 `latest.json` 下载地址（tauri-action 生成的 API URL 匿名访问 403）
- 补充 `@types/node` 与 `@wdio/types` 显式依赖（pnpm 严格布局下 TS 类型解析）

### Changed

- 包管理器从 npm 迁移至 pnpm；e2e 构建命令适配 pnpm 参数透传（无需 `--`）

## [0.1.1] - 2026-08-08

### Removed

- 移除 macOS 毛玻璃（vibrancy）与全局快捷键（global-shortcut）——避免依赖 macOS 私有 API，确保 App Store 审核合规

### Fixed

- 移除设置页过时的"占位更新配置"提示（updater 已接入 GitHub Releases）

### Added

- 正式 release notes 模板（安装包说明 + 签名提示）
- Vitest 覆盖率统计（`npm run test:coverage`）
- README 快速开始支持 degit 模板分发

## [0.1.0] - 2026-08-08

### Added

- 初始脚手架：Tauri 2 + React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui
- 路由（react-router v8）、状态管理（zustand + TanStack Query）、国际化（react-i18next zh/en）
- 16 个 Tauri 官方插件集成：fs / dialog / store / window-state / clipboard-manager / global-shortcut / notification / single-instance / http / updater / log / autostart / sql(SQLite) / shell / deep-link / opener
- 系统托盘（macOS template 图标）、主窗口毛玻璃（macOS vibrancy）、关闭隐藏到托盘
- 工程化：ESLint 10 flat config、Prettier、husky + lint-staged、Vitest 单元测试、WebdriverIO e2e、三平台 CI 构建
- 零信任权限模型与权限踩坑约定文档
- 图标程序化生成脚本（`scripts/make-app-icon.py`、`scripts/make-tray-template.py`）
