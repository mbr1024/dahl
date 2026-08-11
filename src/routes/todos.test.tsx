import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodosPage from "@/routes/todos";
import "@/i18n";

const {
  mockFetchTodos,
  mockCreateTodo,
  mockToggleTodo,
  mockDeleteTodo,
  mockExportTodosJson,
  mockSave,
  mockWriteTextFile,
  mockToast,
} = vi.hoisted(() => ({
  mockFetchTodos: vi.fn(),
  mockCreateTodo: vi.fn(),
  mockToggleTodo: vi.fn(),
  mockDeleteTodo: vi.fn(),
  mockExportTodosJson: vi.fn(),
  mockSave: vi.fn(),
  mockWriteTextFile: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/services/todos", () => ({
  fetchTodos: mockFetchTodos,
  createTodo: mockCreateTodo,
  toggleTodo: mockToggleTodo,
  deleteTodo: mockDeleteTodo,
  exportTodosJson: mockExportTodosJson,
  todosQueryKey: ["todos"],
}));
vi.mock("@tauri-apps/plugin-dialog", () => ({ save: mockSave }));
vi.mock("@tauri-apps/plugin-fs", () => ({ writeTextFile: mockWriteTextFile }));
vi.mock("sonner", () => ({ toast: mockToast }));

afterEach(cleanup);

const open = { id: 1, title: "买牛奶", done: false, created_at: "2026-08-11T00:00:00Z" };
const done = { id: 2, title: "写文档", done: true, created_at: "2026-08-11T01:00:00Z" };

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TodosPage />
    </QueryClientProvider>,
  );
};

describe("TodosPage", () => {
  beforeEach(() => {
    mockFetchTodos.mockReset();
    mockCreateTodo.mockReset();
    mockToggleTodo.mockReset();
    mockDeleteTodo.mockReset();
    mockExportTodosJson.mockReset();
    mockSave.mockReset();
    mockWriteTextFile.mockReset();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockFetchTodos.mockResolvedValue([open, done]);
    mockCreateTodo.mockResolvedValue(undefined);
    mockToggleTodo.mockResolvedValue(undefined);
    mockDeleteTodo.mockResolvedValue(undefined);
  });

  it("加载后渲染待办列表与统计", async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText("买牛奶")).toBeInTheDocument());
    expect(screen.getByText("写文档")).toBeInTheDocument();
    expect(screen.getByText("共 2 项，已完成 1 项")).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
  });

  it("提交输入框新建待办并清空输入（trim 由 service 层负责）", async () => {
    renderPage();
    const input = await screen.findByLabelText("要做点什么？");

    fireEvent.change(input, { target: { value: "  遛狗  " } });
    fireEvent.click(screen.getByRole("button", { name: "添加" }));

    await waitFor(() => expect(mockCreateTodo).toHaveBeenCalledWith("  遛狗  "));
    expect(mockToast.success).toHaveBeenCalledWith("已添加");
    expect(input).toHaveValue("");
  });

  it("空白输入时禁止提交", async () => {
    renderPage();
    const input = await screen.findByLabelText("要做点什么？");

    expect(screen.getByRole("button", { name: "添加" })).toBeDisabled();

    fireEvent.change(input, { target: { value: "   " } });
    expect(screen.getByRole("button", { name: "添加" })).toBeDisabled();
  });

  it("勾选复选框切换完成状态", async () => {
    renderPage();
    await screen.findByText("买牛奶");

    fireEvent.click(screen.getByLabelText("买牛奶 标记完成"));
    await waitFor(() => expect(mockToggleTodo).toHaveBeenCalledWith(1, true));
  });

  it("删除待办并提示", async () => {
    renderPage();
    await screen.findByText("买牛奶");

    fireEvent.click(screen.getByRole("button", { name: "删除 买牛奶" }));
    await waitFor(() => expect(mockDeleteTodo).toHaveBeenCalledWith(1));
    expect(mockToast.success).toHaveBeenCalledWith("已删除");
  });

  it("导出 JSON：选择路径后写入文件", async () => {
    mockSave.mockResolvedValue("/tmp/todos.json");
    mockExportTodosJson.mockResolvedValue('[{"id":1}]');
    renderPage();
    await screen.findByText("买牛奶");

    fireEvent.click(screen.getByRole("button", { name: "导出 JSON" }));

    await waitFor(() =>
      expect(mockWriteTextFile).toHaveBeenCalledWith("/tmp/todos.json", '[{"id":1}]'),
    );
    expect(mockToast.success).toHaveBeenCalledWith("已导出到文件");
  });

  it("导出时取消选择路径则不写文件", async () => {
    mockSave.mockResolvedValue(null);
    renderPage();
    await screen.findByText("买牛奶");

    fireEvent.click(screen.getByRole("button", { name: "导出 JSON" }));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockWriteTextFile).not.toHaveBeenCalled();
  });

  it("空列表时展示空态", async () => {
    mockFetchTodos.mockResolvedValue([]);
    renderPage();

    await waitFor(() => expect(screen.getByText("暂无待办，添加第一条吧")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "导出 JSON" })).toBeDisabled();
  });

  it("加载失败时展示错误", async () => {
    mockFetchTodos.mockRejectedValue(new Error("db broken"));
    renderPage();

    await waitFor(() => expect(screen.getByText("加载失败：Error: db broken")).toBeInTheDocument());
  });

  it("新建失败时提示错误", async () => {
    mockCreateTodo.mockRejectedValue(new Error("disk full"));
    renderPage();
    const input = await screen.findByLabelText("要做点什么？");

    fireEvent.change(input, { target: { value: "新任务" } });
    fireEvent.click(screen.getByRole("button", { name: "添加" }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Error: disk full"));
  });
});
