import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAutoUpdate } from "@/hooks/use-auto-update";
import { useUpdateStore } from "@/stores/use-update-store";

const { mockRunUpdateCheck } = vi.hoisted(() => ({ mockRunUpdateCheck: vi.fn() }));

vi.mock("@/services/updater", () => ({ runUpdateCheck: mockRunUpdateCheck }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  mockRunUpdateCheck.mockReset();
  useUpdateStore.setState({ autoCheck: true, status: "idle" });
});

describe("useAutoUpdate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("location", { protocol: "tauri:" });
  });

  it("autoCheck 关闭时不调度检查", () => {
    useUpdateStore.setState({ autoCheck: false });
    renderHook(() => useAutoUpdate());

    act(() => vi.advanceTimersByTime(10_000));
    expect(mockRunUpdateCheck).not.toHaveBeenCalled();
  });

  it("开发模式（http/https）下不调度检查", () => {
    vi.stubGlobal("location", { protocol: "http:" });
    useUpdateStore.setState({ autoCheck: true });
    renderHook(() => useAutoUpdate());

    act(() => vi.advanceTimersByTime(10_000));
    expect(mockRunUpdateCheck).not.toHaveBeenCalled();
  });

  it("启动 5 秒后静默检查一次", () => {
    mockRunUpdateCheck.mockResolvedValue(undefined);
    useUpdateStore.setState({ autoCheck: true });
    renderHook(() => useAutoUpdate());

    act(() => vi.advanceTimersByTime(5_000));
    expect(mockRunUpdateCheck).toHaveBeenCalledTimes(1);
    expect(mockRunUpdateCheck).toHaveBeenCalledWith(true);

    act(() => vi.advanceTimersByTime(5_000));
    expect(mockRunUpdateCheck).toHaveBeenCalledTimes(1);
  });

  it("检查失败时重置状态（静默容错）", async () => {
    mockRunUpdateCheck.mockRejectedValue(new Error("boom"));
    useUpdateStore.setState({ autoCheck: true });
    renderHook(() => useAutoUpdate());

    await act(async () => {
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    expect(useUpdateStore.getState().status).toBe("idle");
  });

  it("卸载时清除定时器", () => {
    useUpdateStore.setState({ autoCheck: true });
    const { unmount } = renderHook(() => useAutoUpdate());

    unmount();
    act(() => vi.advanceTimersByTime(10_000));
    expect(mockRunUpdateCheck).not.toHaveBeenCalled();
  });
});
