import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SettingsPage from "@/routes/settings";
import "@/i18n";
import { useSettingsStore } from "@/stores/use-settings";
import { useUpdateStore } from "@/stores/use-update-store";

const {
  mockInvoke,
  mockGetVersion,
  mockIsEnabled,
  mockEnable,
  mockDisable,
  mockRunUpdateCheck,
  mockInstallUpdate,
  mockToast,
} = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockGetVersion: vi.fn(),
  mockIsEnabled: vi.fn(),
  mockEnable: vi.fn(),
  mockDisable: vi.fn(),
  mockRunUpdateCheck: vi.fn(),
  mockInstallUpdate: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@tauri-apps/api/core", () => ({ invoke: mockInvoke }));
vi.mock("@tauri-apps/api/app", () => ({ getVersion: mockGetVersion }));
vi.mock("@tauri-apps/plugin-autostart", () => ({
  isEnabled: mockIsEnabled,
  enable: mockEnable,
  disable: mockDisable,
}));
vi.mock("@/services/updater", () => ({
  runUpdateCheck: mockRunUpdateCheck,
  installUpdate: mockInstallUpdate,
}));
vi.mock("sonner", () => ({ toast: mockToast }));

afterEach(cleanup);

const renderPage = () =>
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );

describe("SettingsPage", () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: "light", language: "zh" });
    useUpdateStore.setState({ status: "idle", version: null, error: null });
    mockInvoke.mockResolvedValue({ exe: "/app/dahl", os: "macos", arch: "aarch64" });
    mockGetVersion.mockResolvedValue("0.2.0");
    mockIsEnabled.mockResolvedValue(false);
    mockEnable.mockResolvedValue(undefined);
    mockDisable.mockResolvedValue(undefined);
    mockRunUpdateCheck.mockResolvedValue(undefined);
    mockInstallUpdate.mockResolvedValue(undefined);
  });

  it("渲染各设置卡片与运行时信息", async () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("设置");
    expect(screen.getByText("外观")).toBeInTheDocument();
    expect(screen.getByText("通用")).toBeInTheDocument();
    expect(screen.getByText("更新")).toBeInTheDocument();
    expect(screen.getByText("关于")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Dahl v0.2.0")).toBeInTheDocument());
    expect(screen.getByText(/macos\/aarch64/)).toBeInTheDocument();
    expect(screen.getByText("/app/dahl")).toBeInTheDocument();
  });

  it("点击主题按钮更新主题偏好", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "深色" }));
    expect(useSettingsStore.getState().theme).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "跟随系统" }));
    expect(useSettingsStore.getState().theme).toBe("system");
  });

  it("点击语言按钮更新语言偏好", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(useSettingsStore.getState().language).toBe("en");
  });

  it("切换开机自启开关调用 enable/disable", async () => {
    renderPage();
    const sw = await screen.findByRole("switch", { name: "开机自启" });
    expect(sw).toBeEnabled();

    fireEvent.click(sw);
    await waitFor(() => expect(mockEnable).toHaveBeenCalledTimes(1));
    expect(sw).toBeChecked();

    fireEvent.click(sw);
    await waitFor(() => expect(mockDisable).toHaveBeenCalledTimes(1));
    expect(sw).not.toBeChecked();
  });

  it("自动开启自启失败时提示错误", async () => {
    mockEnable.mockRejectedValue(new Error("perm denied"));
    renderPage();

    const sw = await screen.findByRole("switch", { name: "开机自启" });
    fireEvent.click(sw);

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Error: perm denied"));
    expect(sw).not.toBeChecked();
  });

  it("点击检查更新调用非静默检查", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "检查更新" }));
    await waitFor(() => expect(mockRunUpdateCheck).toHaveBeenCalledWith(false));
  });

  it("更新就绪时显示重启安装按钮并触发安装", async () => {
    useUpdateStore.setState({ status: "ready", version: "0.3.0" });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "重启并安装" }));
    await waitFor(() => expect(mockInstallUpdate).toHaveBeenCalledTimes(1));
  });

  it("各更新状态文案正确渲染", () => {
    useUpdateStore.setState({ status: "up-to-date" });
    const { rerender } = renderPage();
    expect(screen.getByText("当前已是最新版本")).toBeInTheDocument();

    useUpdateStore.setState({ status: "downloading", version: "0.3.0" });
    rerender(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("正在后台下载 v0.3.0…")).toBeInTheDocument();

    useUpdateStore.setState({ status: "error", error: "boom" });
    rerender(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("检查更新失败：boom")).toBeInTheDocument();
  });
});
