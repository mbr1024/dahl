import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CapabilitiesPage from "@/routes/capabilities";
import "@/i18n";

const {
  mockInvoke,
  mockOpen,
  mockMessage,
  mockReadTextFile,
  mockReadText,
  mockWriteText,
  mockIsPermissionGranted,
  mockRequestPermission,
  mockSendNotification,
  mockLoadStore,
  mockInfo,
  mockDatabaseLoad,
  mockCommandCreate,
  mockOnOpenUrl,
  mockToast,
} = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOpen: vi.fn(),
  mockMessage: vi.fn(),
  mockReadTextFile: vi.fn(),
  mockReadText: vi.fn(),
  mockWriteText: vi.fn(),
  mockIsPermissionGranted: vi.fn(),
  mockRequestPermission: vi.fn(),
  mockSendNotification: vi.fn(),
  mockLoadStore: vi.fn(),
  mockInfo: vi.fn(),
  mockDatabaseLoad: vi.fn(),
  mockCommandCreate: vi.fn(),
  mockOnOpenUrl: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@tauri-apps/api/core", () => ({ invoke: mockInvoke }));
vi.mock("@tauri-apps/plugin-dialog", () => ({ open: mockOpen, message: mockMessage }));
vi.mock("@tauri-apps/plugin-fs", () => ({ readTextFile: mockReadTextFile }));
vi.mock("@tauri-apps/plugin-clipboard-manager", () => ({
  readText: mockReadText,
  writeText: mockWriteText,
}));
vi.mock("@tauri-apps/plugin-notification", () => ({
  isPermissionGranted: mockIsPermissionGranted,
  requestPermission: mockRequestPermission,
  sendNotification: mockSendNotification,
}));
vi.mock("@tauri-apps/plugin-store", () => ({ load: mockLoadStore }));
vi.mock("@tauri-apps/plugin-log", () => ({ info: mockInfo }));
vi.mock("@tauri-apps/plugin-sql", () => ({ default: { load: mockDatabaseLoad } }));
vi.mock("@tauri-apps/plugin-shell", () => ({ Command: { create: mockCommandCreate } }));
vi.mock("@tauri-apps/plugin-deep-link", () => ({ onOpenUrl: mockOnOpenUrl }));
vi.mock("sonner", () => ({ toast: mockToast }));

afterEach(cleanup);

const renderPage = () =>
  render(
    <MemoryRouter>
      <CapabilitiesPage />
    </MemoryRouter>,
  );

describe("CapabilitiesPage", () => {
  beforeEach(() => {
    mockOnOpenUrl.mockResolvedValue(() => {});
    mockInvoke.mockReset();
    mockOpen.mockReset();
    mockReadTextFile.mockReset();
    mockWriteText.mockReset();
    mockReadText.mockReset();
    mockDatabaseLoad.mockReset();
    mockCommandCreate.mockReset();
    mockLoadStore.mockReset();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.info.mockClear();
  });

  it("渲染全部能力 section", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("桌面能力");
    expect(screen.getByText("Rust 命令（invoke）")).toBeInTheDocument();
    expect(screen.getByText("对话框 + 文件系统")).toBeInTheDocument();
    expect(screen.getByText("剪贴板")).toBeInTheDocument();
    expect(screen.getByText("系统通知")).toBeInTheDocument();
    expect(screen.getByText("本地存储")).toBeInTheDocument();
    expect(screen.getByText("原生消息框")).toBeInTheDocument();
    expect(screen.getByText("SQLite")).toBeInTheDocument();
    expect(screen.getByText("Shell 命令")).toBeInTheDocument();
    expect(screen.getByText("深链接")).toBeInTheDocument();
  });

  it("invoke 成功后展示系统信息徽章", async () => {
    mockInvoke.mockResolvedValue({
      os: "macos",
      arch: "aarch64",
      family: "unix",
      exe: "/app/dahl",
    });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "获取系统信息" }));

    await waitFor(() => expect(screen.getByText("macos")).toBeInTheDocument());
    expect(screen.getByText("aarch64")).toBeInTheDocument();
    expect(screen.getByText("unix")).toBeInTheDocument();
    expect(screen.getByText("/app/dahl")).toBeInTheDocument();
    expect(mockInvoke).toHaveBeenCalledWith("system_info");
  });

  it("invoke 失败时 toast 错误", async () => {
    mockInvoke.mockRejectedValue(new Error("command not found"));
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "获取系统信息" }));
    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Error: command not found"));
  });

  it("选择文件后读取内容并提示", async () => {
    mockOpen.mockResolvedValue("/tmp/note.md");
    mockReadTextFile.mockResolvedValue("hello dahl");
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "选择文件并读取" }));

    await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith("读取 note.md：hello dahl"));
  });

  it("未选择文件时提示", async () => {
    mockOpen.mockResolvedValue(null);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "选择文件并读取" }));

    await waitFor(() => expect(mockToast.info).toHaveBeenCalledWith("未选择文件"));
  });

  it("写入剪贴板后回读并展示", async () => {
    mockWriteText.mockResolvedValue(undefined);
    mockReadText.mockResolvedValue("来自 Dahl 的内容 ✦ 12:00:00");
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "写入剪贴板" }));

    await waitFor(() => expect(screen.getByText(/当前内容：来自 Dahl 的内容/)).toBeInTheDocument());
    expect(mockToast.success).toHaveBeenCalledWith("已写入剪贴板");
  });

  it("SQLite 插入查询后展示 todo 列表", async () => {
    const db = {
      execute: vi.fn().mockResolvedValue(undefined),
      select: vi.fn().mockResolvedValue([
        { id: 1, title: "demo-123" },
        { id: 2, title: "demo-456" },
      ]),
    };
    mockDatabaseLoad.mockResolvedValue(db);
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "插入并查询 todos" }));

    await waitFor(() => expect(screen.getByText("#1 demo-123")).toBeInTheDocument());
    expect(screen.getByText("#2 demo-456")).toBeInTheDocument();
    expect(mockToast.success).toHaveBeenCalledWith("SQLite 查询到 2 条记录");
  });

  it("SQLite 出错时 toast 错误", async () => {
    mockDatabaseLoad.mockRejectedValue(new Error("db locked"));
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "插入并查询 todos" }));
    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Error: db locked"));
  });

  it("执行 shell echo 并提示输出", async () => {
    mockCommandCreate.mockReturnValue({
      execute: vi.fn().mockResolvedValue({ stdout: "hello from shell" }),
    });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "执行 echo" }));

    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith("echo 输出：hello from shell"),
    );
    expect(mockInfo).toHaveBeenCalledWith("shell echo: hello from shell");
  });
});
