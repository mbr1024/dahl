import { beforeEach, describe, expect, it } from "vitest";
import { useSettingsStore } from "@/stores/use-settings";

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: "system" });
  });

  it("默认主题为 system", () => {
    expect(useSettingsStore.getState().theme).toBe("system");
  });

  it("setTheme 更新主题", () => {
    useSettingsStore.getState().setTheme("dark");
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("setTheme 可切回 light", () => {
    useSettingsStore.getState().setTheme("light");
    expect(useSettingsStore.getState().theme).toBe("light");
  });
});
