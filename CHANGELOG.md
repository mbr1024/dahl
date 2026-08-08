# Changelog

本项目的版本遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与 [语义化版本](https://semver.org/lang/zh-CN/)。版本与变更记录由 [Changesets](https://github.com/changesets/changesets) 自动维护。

## [0.1.0] - 2026-08-08

### Added

- 初始脚手架：Tauri 2 + React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui
- 路由（react-router v8）、状态管理（zustand + TanStack Query）、国际化（react-i18next zh/en）
- 16 个 Tauri 官方插件集成：fs / dialog / store / window-state / clipboard-manager / global-shortcut / notification / single-instance / http / updater / log / autostart / sql(SQLite) / shell / deep-link / opener
- 系统托盘（macOS template 图标）、主窗口毛玻璃（macOS vibrancy）、关闭隐藏到托盘
- 工程化：ESLint 10 flat config、Prettier、husky + lint-staged、Vitest 单元测试、WebdriverIO e2e、三平台 CI 构建
- 零信任权限模型与权限踩坑约定文档
- 图标程序化生成脚本（`scripts/make-app-icon.py`、`scripts/make-tray-template.py`）
