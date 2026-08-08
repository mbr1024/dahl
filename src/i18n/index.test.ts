import { describe, expect, it } from "vitest";
import i18n from "./index";

/** 递归收集翻译对象的所有叶子 key（含嵌套路径），用于对比 zh/en 结构一致性 */
function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return collectKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("i18n 资源", () => {
  it("zh 与 en 的 key 结构完全一致", () => {
    const zhKeys = collectKeys(
      i18n.getResourceBundle("zh", "translation") as Record<string, unknown>,
    );
    const enKeys = collectKeys(
      i18n.getResourceBundle("en", "translation") as Record<string, unknown>,
    );
    expect(zhKeys.sort()).toEqual(enKeys.sort());
  });

  it("默认语言为中文，切换英文后文案变化", async () => {
    expect(i18n.language).toBe("zh");
    expect(i18n.t("nav.home")).toBe("首页");

    await i18n.changeLanguage("en");
    expect(i18n.t("nav.home")).toBe("Home");
    expect(i18n.t("home.title")).toBe("Dahl");
  });

  it("翻译值均为非空字符串", () => {
    const bundles = ["zh", "en"].flatMap((lng) =>
      Object.entries(
        collectKeys(i18n.getResourceBundle(lng, "translation") as Record<string, unknown>),
      ),
    );
    for (const [key] of bundles) {
      const value = i18n.t(key);
      expect(typeof value).toBe("string");
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
