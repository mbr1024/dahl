# Changelog

## 0.3.4

### Patch Changes

- 8e42a00: perf: 「重启并安装」复用已下载的安装包缓存，不再重复下载（点安装立即进入安装+重启）

## 0.3.3

### Patch Changes

- 0370da7: fix: 更新后重启改用「先 destroy single-instance 锁再 request_restart」——取代 v0.3.2 的延迟启动器方案（固定 sleep 是时序巧合、Windows 分支不可用）

## 0.3.2

### Patch Changes

- f74731e: fix: 更新安装后重启改用自定义 restart_app（延迟启动器模式）——直接 relaunch 会被 single-instance 让位，导致重启后仍运行旧版本

## 0.3.1

### Patch Changes

- 1fa1b5f: fix: 「重启并安装」安装完成后调用 relaunch 真正重启到新版本（Tauri install 不会自动重启，需接入 process 插件）

## 0.3.0

### Minor Changes

- edcbaea: feat: 新增「待办」示例页——SQLite 持久化的完整 CRUD（列表/新建/勾选/删除/导出 JSON），示范 service 层 + TanStack Query + i18n 全链路约定

## 0.2.1

### Patch Changes

- bbd65da: fix: 更新已下载（ready）状态下重复检查更新不再重复下载，直接提示重启安装

## 0.2.0

### Minor Changes

- 5779be5: feat: 启动时静默检查更新（后台下载 + 就绪通知 + 设置页"重启并安装"）
  feat: 设置页新增自动检查更新开关与更新状态指示
  feat: 桌面能力示例页文案 i18n 全覆盖（zh/en）
  fix: 关于区版本号改为运行时读取（getVersion），不再硬编码

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
