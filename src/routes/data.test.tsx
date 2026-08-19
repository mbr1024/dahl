import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DataPage from "@/routes/data";
import "@/i18n";

const { mockFetchRepoInfo } = vi.hoisted(() => ({ mockFetchRepoInfo: vi.fn() }));

vi.mock("@/services/api", () => ({
  fetchRepoInfo: mockFetchRepoInfo,
  queryKeys: { github: ["github", "repo"] },
}));

afterEach(cleanup);

const repo = {
  full_name: "tauri-apps/tauri",
  description: "Tauri framework",
  stargazers_count: 42000,
  forks_count: 1000,
  open_issues_count: 50,
  updated_at: "2026-08-01T00:00:00Z",
  html_url: "https://github.com/tauri-apps/tauri",
};

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DataPage />
    </QueryClientProvider>,
  );
};

describe("DataPage", () => {
  beforeEach(() => {
    mockFetchRepoInfo.mockReset();
    mockFetchRepoInfo.mockResolvedValue(repo);
  });

  it("加载成功后展示仓库信息", async () => {
    mockFetchRepoInfo.mockResolvedValue(repo);
    renderPage();

    await waitFor(() => expect(screen.getByText("tauri-apps/tauri")).toBeInTheDocument());
    expect(screen.getByText("Tauri framework")).toBeInTheDocument();
    expect(screen.getByText("⭐ 42,000")).toBeInTheDocument();
    expect(screen.getByText("🍴 1,000")).toBeInTheDocument();
    expect(mockFetchRepoInfo).toHaveBeenCalledWith("tauri-apps", "tauri");
  });

  it("请求失败时展示错误状态", async () => {
    mockFetchRepoInfo.mockRejectedValue(new Error("HTTP 500"));
    renderPage();

    await waitFor(() => expect(screen.getByText("请求失败")).toBeInTheDocument());
    expect(screen.getByText("Error: HTTP 500")).toBeInTheDocument();
  });

  it("请求成功但数据为空时不渲染详情", async () => {
    mockFetchRepoInfo.mockResolvedValue(null);
    renderPage();

    await waitFor(() => expect(mockFetchRepoInfo).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("tauri-apps/tauri")).not.toBeInTheDocument();
    expect(screen.queryByText("请求失败")).not.toBeInTheDocument();
  });

  it("点击重取按钮再次请求", async () => {
    mockFetchRepoInfo.mockResolvedValue(repo);
    renderPage();

    await waitFor(() => expect(screen.getByText("tauri-apps/tauri")).toBeInTheDocument());
    expect(mockFetchRepoInfo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "重取" }));
    await waitFor(() => expect(mockFetchRepoInfo).toHaveBeenCalledTimes(2));
  });
});
