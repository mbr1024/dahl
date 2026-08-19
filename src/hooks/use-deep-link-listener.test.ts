import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDeepLinkStore } from "@/stores/use-deep-link-store";

const { mockGetCurrent, mockOnOpenUrl, mockToast } = vi.hoisted(() => ({
  mockGetCurrent: vi.fn(),
  mockOnOpenUrl: vi.fn(),
  mockToast: { success: vi.fn() },
}));

vi.mock("@tauri-apps/plugin-deep-link", () => ({
  getCurrent: mockGetCurrent,
  onOpenUrl: mockOnOpenUrl,
}));
vi.mock("sonner", () => ({ toast: mockToast }));

import { useDeepLinkListener } from "./use-deep-link-listener";

describe("useDeepLinkListener", () => {
  beforeEach(() => {
    useDeepLinkStore.setState({ urls: [] });
    mockGetCurrent.mockReset();
    mockGetCurrent.mockResolvedValue(null);
    mockOnOpenUrl.mockReset();
    mockOnOpenUrl.mockResolvedValue(() => {});
    mockToast.success.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles a URL received on cold start", async () => {
    mockGetCurrent.mockResolvedValue(["dahl://startup"]);

    renderHook(() => useDeepLinkListener());

    await vi.waitFor(() => expect(useDeepLinkStore.getState().urls).toEqual(["dahl://startup"]));
    expect(mockToast.success).toHaveBeenCalledWith("收到深链接：dahl://startup");
  });

  it("handles URLs received while the app is running and unregisters on unmount", async () => {
    let callback: ((urls: string[]) => void) | undefined;
    const unlisten = vi.fn();
    mockOnOpenUrl.mockImplementation((handler: (urls: string[]) => void) => {
      callback = handler;
      return Promise.resolve(unlisten);
    });

    const { unmount } = renderHook(() => useDeepLinkListener());
    act(() => callback?.(["dahl://hello", "dahl://world"]));

    expect(useDeepLinkStore.getState().urls).toEqual(["dahl://hello", "dahl://world"]);
    expect(mockToast.success).toHaveBeenCalledWith("收到深链接：dahl://hello, dahl://world");

    unmount();
    await vi.waitFor(() => expect(unlisten).toHaveBeenCalledTimes(1));
  });

  it("ignores empty and unavailable deep-link values", async () => {
    mockGetCurrent.mockRejectedValue(new Error("not running in Tauri"));
    let callback: ((urls: string[]) => void) | undefined;
    mockOnOpenUrl.mockImplementation((handler: (urls: string[]) => void) => {
      callback = handler;
      return Promise.resolve(() => {});
    });

    renderHook(() => useDeepLinkListener());
    act(() => callback?.([]));
    await Promise.resolve();

    expect(useDeepLinkStore.getState().urls).toEqual([]);
    expect(mockToast.success).not.toHaveBeenCalled();
  });
});
