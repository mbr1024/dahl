import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type Language = "zh" | "en";

interface SettingsState {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

/**
 * 全局设置 store（zustand + persist 示例）。
 * 脚手架默认用 localStorage 持久化，桌面场景可无缝切换到
 * @tauri-apps/plugin-store（见 capabilities 页示例）。
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "zh",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: "settings" },
  ),
);
