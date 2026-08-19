import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import App from "@/App";
import "@/i18n";

vi.mock("@tauri-apps/plugin-deep-link", () => ({
  getCurrent: vi.fn().mockResolvedValue(null),
  onOpenUrl: vi.fn().mockResolvedValue(() => {}),
}));

afterEach(cleanup);

describe("App 冒烟渲染", () => {
  it("根路径重定向到 /home 并渲染首页", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dahl"),
    );
    // 默认语言为中文
    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("桌面能力")).toBeInTheDocument();
  });

  it("未知路径回退到首页", async () => {
    render(
      <MemoryRouter initialEntries={["/does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dahl"),
    );
  });

  it("按路由懒加载所有示例页面", async () => {
    const routes = [
      ["/capabilities", "桌面能力"],
      ["/data", "数据请求"],
      ["/todos", "待办"],
      ["/settings", "设置"],
    ] as const;

    for (const [path, title] of routes) {
      cleanup();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[path]}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title),
      );
    }
  });
});
