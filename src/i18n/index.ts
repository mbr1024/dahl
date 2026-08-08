import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const zh = {
  nav: { home: "首页", capabilities: "桌面能力", data: "数据请求", settings: "设置" },
  home: {
    title: "Dahl",
    desc: "Tauri 2 + React 桌面应用脚手架，开箱即用的工程化实践。",
    conventions: "脚手架约定",
  },
  settings: { title: "设置", language: "语言" },
};

const en: typeof zh = {
  nav: { home: "Home", capabilities: "Capabilities", data: "Data", settings: "Settings" },
  home: {
    title: "Dahl",
    desc: "Tauri 2 + React desktop scaffold with production-ready conventions.",
    conventions: "Scaffold conventions",
  },
  settings: { title: "Settings", language: "Language" },
};

void i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
