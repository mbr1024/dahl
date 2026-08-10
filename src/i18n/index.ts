import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const zh = {
  nav: { home: "首页", capabilities: "桌面能力", data: "数据请求", settings: "设置" },
  home: {
    title: "Dahl",
    desc: "Tauri 2 + React 桌面应用脚手架，开箱即用的工程化实践。",
    conventions: "脚手架约定",
  },
  settings: {
    title: "设置",
    language: "语言",
    update: {
      title: "更新",
      desc: "updater 插件检查并安装新版本",
      check: "检查更新",
      checking: "检查中…",
      upToDate: "当前已是最新版本",
      found: "发现新版本 {{version}}，开始下载…",
      downloading: "正在后台下载 v{{version}}…",
      ready: "v{{version}} 已下载，重启应用完成更新",
      restartInstall: "重启并安装",
      installing: "安装中…",
      autoCheck: "自动检查更新",
      autoCheckDesc: "启动后静默检查，有新版本自动下载",
      failed: "检查更新失败：{{error}}",
      notifyTitle: "Dahl 更新已就绪",
      notifyBody: "v{{version}} 已下载，重启应用完成更新",
    },
    about: {
      title: "关于",
      platform: "平台",
    },
  },
  capabilities: {
    title: "桌面能力",
    desc: "常用 Tauri 插件开箱即用：Rust 命令、对话框、文件系统、剪贴板、通知、本地存储。",
    invoke: {
      title: "Rust 命令（invoke）",
      desc: "前端调用 Rust 函数，返回结构化数据",
      button: "获取系统信息",
    },
    file: {
      title: "对话框 + 文件系统",
      desc: "dialog 选文件，fs 读取内容",
      button: "选择文件并读取",
      noFile: "未选择文件",
      readOk: "读取 {{file}}：{{content}}",
    },
    clipboard: {
      title: "剪贴板",
      desc: "clipboard-manager 读写系统剪贴板",
      button: "写入剪贴板",
      written: "已写入剪贴板",
      current: "当前内容：{{content}}",
      content: "来自 Dahl 的内容 ✦ {{time}}",
    },
    notify: {
      title: "系统通知",
      desc: "notification 插件发送桌面通知",
      button: "发送通知",
      denied: "通知权限被拒绝",
      body: "这是一条系统通知，来自 notification 插件",
    },
    store: {
      title: "本地存储",
      desc: "store 插件做键值持久化（比 localStorage 更贴近系统）",
      button: "写入当前时间",
      written: "已写入 store：{{key}} = {{value}}",
      last: "上次写入：{{value}}",
    },
    message: {
      title: "原生消息框",
      desc: "dialog 的 message 系列 API",
      button: "弹出消息框",
      ok: "对话框/消息框插件工作正常",
    },
    sql: {
      title: "SQLite",
      desc: "sql 插件本地数据库（建表/插入/查询）",
      button: "插入并查询 todos",
      ok: "SQLite 查询到 {{count}} 条记录",
    },
    shell: {
      title: "Shell 命令",
      desc: "shell 插件执行系统命令（scope 限定 echo）",
      button: "执行 echo",
      ok: "echo 输出：{{output}}",
    },
    deeplink: {
      title: "深链接",
      desc: "deep-link 插件监听 dahl:// 唤起（dev 下需注册 scheme）",
      hint: "在浏览器打开 {{scheme}} 可唤起应用",
      received: "收到深链接：{{urls}}",
    },
  },
};

const en: typeof zh = {
  nav: { home: "Home", capabilities: "Capabilities", data: "Data", settings: "Settings" },
  home: {
    title: "Dahl",
    desc: "Tauri 2 + React desktop scaffold with production-ready conventions.",
    conventions: "Scaffold conventions",
  },
  settings: {
    title: "Settings",
    language: "Language",
    update: {
      title: "Update",
      desc: "Check and install new versions via the updater plugin",
      check: "Check for updates",
      checking: "Checking…",
      upToDate: "You're up to date",
      found: "New version {{version}} found, downloading…",
      downloading: "Downloading v{{version}} in the background…",
      ready: "v{{version}} downloaded — restart the app to finish",
      restartInstall: "Restart & install",
      installing: "Installing…",
      autoCheck: "Check for updates automatically",
      autoCheckDesc: "Check silently on launch and download new versions",
      failed: "Update check failed: {{error}}",
      notifyTitle: "Dahl update ready",
      notifyBody: "v{{version}} downloaded — restart the app to finish",
    },
    about: {
      title: "About",
      platform: "Platform",
    },
  },
  capabilities: {
    title: "Capabilities",
    desc: "Tauri plugins ready out of the box: Rust commands, dialogs, filesystem, clipboard, notifications, local storage.",
    invoke: {
      title: "Rust command (invoke)",
      desc: "Call Rust functions from the frontend, returning structured data",
      button: "Get system info",
    },
    file: {
      title: "Dialog + filesystem",
      desc: "Pick a file with dialog, read it with fs",
      button: "Pick file & read",
      noFile: "No file selected",
      readOk: "Read {{file}}: {{content}}",
    },
    clipboard: {
      title: "Clipboard",
      desc: "Read/write the system clipboard via clipboard-manager",
      button: "Write to clipboard",
      written: "Copied to clipboard",
      current: "Current content: {{content}}",
      content: "Content from Dahl ✦ {{time}}",
    },
    notify: {
      title: "System notification",
      desc: "Send desktop notifications via the notification plugin",
      button: "Send notification",
      denied: "Notification permission denied",
      body: "A system notification from the notification plugin",
    },
    store: {
      title: "Local storage",
      desc: "Key-value persistence via the store plugin (closer to the system than localStorage)",
      button: "Write current time",
      written: "Store written: {{key}} = {{value}}",
      last: "Last written: {{value}}",
    },
    message: {
      title: "Native message box",
      desc: "The message family of dialog APIs",
      button: "Show message box",
      ok: "Dialog/message-box plugin works",
    },
    sql: {
      title: "SQLite",
      desc: "Local database via the sql plugin (create/insert/query)",
      button: "Insert & query todos",
      ok: "SQLite: {{count}} rows returned",
    },
    shell: {
      title: "Shell commands",
      desc: "Execute system commands via the shell plugin (scope: echo)",
      button: "Run echo",
      ok: "echo output: {{output}}",
    },
    deeplink: {
      title: "Deep link",
      desc: "Listen for dahl:// launches via the deep-link plugin (register the scheme first in dev)",
      hint: "Open {{scheme}} in a browser to launch the app",
      received: "Deep link received: {{urls}}",
    },
  },
};

void i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: "zh",
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
});

export default i18n;
