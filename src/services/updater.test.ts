import { beforeEach, describe, expect, it, vi } from "vitest";
import { runUpdateCheck, installUpdate } from "./updater";
import { useUpdateStore } from "@/stores/use-update-store";
import "@/i18n";

const { mockCheck, mockIsPermissionGranted, mockSendNotification, mockToast, mockInvoke } =
  vi.hoisted(() => ({
    mockCheck: vi.fn(),
    mockIsPermissionGranted: vi.fn(),
    mockSendNotification: vi.fn(),
    mockToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
    mockInvoke: vi.fn(),
  }));

vi.mock("@tauri-apps/plugin-updater", () => ({ check: mockCheck }));
vi.mock("@tauri-apps/plugin-notification", () => ({
  isPermissionGranted: mockIsPermissionGranted,
  sendNotification: mockSendNotification,
}));
vi.mock("@tauri-apps/api/core", () => ({ invoke: mockInvoke }));
vi.mock("sonner", () => ({ toast: mockToast }));

const makeUpdate = () => ({
  version: "0.3.0",
  download: vi.fn((onEvent: () => void) => {
    onEvent();
    return Promise.resolve(undefined);
  }),
  install: vi.fn().mockResolvedValue(undefined),
});

describe("runUpdateCheck", () => {
  beforeEach(() => {
    useUpdateStore.setState({ status: "idle", version: null, error: null });
    mockCheck.mockReset();
    mockIsPermissionGranted.mockReset();
    mockSendNotification.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.info.mockClear();
  });

  it("check 抛出异常时置为 idle + error，非静默模式弹错误 toast", async () => {
    mockCheck.mockRejectedValue(new Error("network down"));

    await runUpdateCheck(false);

    expect(useUpdateStore.getState().status).toBe("idle");
    expect(useUpdateStore.getState().error).toBe("Error: network down");
    expect(mockToast.error).toHaveBeenCalledWith("检查更新失败：Error: network down");
  });

  it("已有已下载版本（ready）时不重新检查下载", async () => {
    useUpdateStore.setState({ status: "ready", version: "0.3.0" });

    await runUpdateCheck(false);

    expect(mockCheck).not.toHaveBeenCalled();
    expect(useUpdateStore.getState().status).toBe("ready");
    expect(mockToast.info).toHaveBeenCalledWith("v0.3.0 已下载，重启应用完成更新");

    useUpdateStore.setState({ status: "ready" });
    mockToast.info.mockClear();
    await runUpdateCheck(true);
    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it("静默模式下失败不弹 toast", async () => {
    mockCheck.mockRejectedValue(new Error("network down"));

    await runUpdateCheck(true);

    expect(useUpdateStore.getState().status).toBe("idle");
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("无新版本时置为 up-to-date，非静默模式提示", async () => {
    mockCheck.mockResolvedValue(null);

    await runUpdateCheck(false);

    expect(useUpdateStore.getState().status).toBe("up-to-date");
    expect(mockToast.info).toHaveBeenCalledWith("当前已是最新版本");
  });

  it("有新版本时下载并置为 ready，权限已授予时发通知", async () => {
    const update = makeUpdate();
    mockCheck.mockResolvedValue(update);
    mockIsPermissionGranted.mockResolvedValue(true);

    await runUpdateCheck(false);

    expect(useUpdateStore.getState().status).toBe("ready");
    expect(useUpdateStore.getState().version).toBe("0.3.0");
    expect(update.download).toHaveBeenCalledTimes(1);
    expect(mockToast.success).toHaveBeenCalledWith("v0.3.0 已下载，重启应用完成更新");
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
  });

  it("下载失败时置为 idle + error", async () => {
    const update = makeUpdate();
    update.download.mockRejectedValue(new Error("download aborted"));
    mockCheck.mockResolvedValue(update);

    await runUpdateCheck(false);

    expect(useUpdateStore.getState().status).toBe("idle");
    expect(useUpdateStore.getState().error).toBe("Error: download aborted");
  });

  it("权限未授予时不发系统通知", async () => {
    const update = makeUpdate();
    mockCheck.mockResolvedValue(update);
    mockIsPermissionGranted.mockResolvedValue(false);

    await runUpdateCheck(true);

    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});

describe("installUpdate", () => {
  beforeEach(() => {
    useUpdateStore.setState({ status: "idle", version: null, error: null });
    mockCheck.mockReset();
    mockSendNotification.mockClear();
    mockToast.error.mockClear();
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue(undefined);
  });

  it("下载、安装并重启到新版本", async () => {
    const update = makeUpdate();
    mockCheck.mockResolvedValue(update);

    await installUpdate();

    expect(useUpdateStore.getState().status).toBe("installing");
    expect(update.download).toHaveBeenCalledTimes(1);
    expect(update.install).toHaveBeenCalledTimes(1);
    expect(mockInvoke).toHaveBeenCalledWith("restart_app");
  });

  it("无新版本时置为 up-to-date", async () => {
    mockCheck.mockResolvedValue(null);

    await installUpdate();

    expect(useUpdateStore.getState().status).toBe("up-to-date");
  });

  it("安装失败时回退到 ready 并提示", async () => {
    const update = makeUpdate();
    update.download.mockRejectedValue(new Error("no cache"));
    mockCheck.mockResolvedValue(update);

    await installUpdate();

    expect(useUpdateStore.getState().status).toBe("ready");
    expect(useUpdateStore.getState().error).toBe("Error: no cache");
    expect(mockToast.error).toHaveBeenCalledWith("检查更新失败：Error: no cache");
  });
});
