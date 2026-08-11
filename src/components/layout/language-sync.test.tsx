import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { LanguageSync } from "@/components/layout/language-sync";
import i18n from "@/i18n";
import { useSettingsStore } from "@/stores/use-settings";

afterEach(() => {
  cleanup();
  useSettingsStore.setState({ language: "zh" });
});

describe("LanguageSync", () => {
  it("渲染为 null 且不产生 DOM", () => {
    const { container } = render(<LanguageSync />);
    expect(container.firstChild).toBeNull();
  });

  it("mount 时同步当前语言，随后跟随 store 变化", () => {
    const spy = vi.spyOn(i18n, "changeLanguage");
    useSettingsStore.setState({ language: "en" });
    render(<LanguageSync />);
    expect(spy).toHaveBeenCalledWith("en");

    act(() => useSettingsStore.getState().setLanguage("zh"));
    expect(spy).toHaveBeenCalledWith("zh");
    spy.mockRestore();
  });
});
