import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { useSettingsStore } from "@/stores/use-settings";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("light", "dark");
  vi.unstubAllGlobals();
});

const stubMatchMedia = (initial: boolean) => {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    })),
  );
  return {
    setMatches: (next: boolean) => {
      matches = next;
      listeners.forEach((cb) => cb());
    },
  };
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: "light" });
    stubMatchMedia(false);
  });

  it("light 主题应用到 html class", () => {
    useSettingsStore.setState({ theme: "light" });
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("dark 主题应用到 html class", () => {
    useSettingsStore.setState({ theme: "dark" });
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("dark");
  });

  it("system 主题按系统偏好解析", () => {
    stubMatchMedia(true);
    useSettingsStore.setState({ theme: "system" });
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("dark");
  });

  it("system 主题下系统偏好变化时跟随", () => {
    const media = stubMatchMedia(false);
    useSettingsStore.setState({ theme: "system" });
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveClass("light");

    media.setMatches(true);
    expect(document.documentElement).toHaveClass("dark");

    media.setMatches(false);
    expect(document.documentElement).toHaveClass("light");
  });

  it("切换 store 主题后重新应用", () => {
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveClass("light");

    act(() => useSettingsStore.getState().setTheme("dark"));
    expect(document.documentElement).toHaveClass("dark");
  });
});
