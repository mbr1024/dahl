import { useEffect } from "react";
import i18n from "@/i18n";
import { useSettingsStore } from "@/stores/use-settings";

/** 将 store 中的语言偏好同步到 i18n（含持久化恢复场景） */
export function LanguageSync() {
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  return null;
}
