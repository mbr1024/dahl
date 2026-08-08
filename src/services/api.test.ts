import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRepoInfo } from "./api";

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }));

vi.mock("@tauri-apps/plugin-http", () => ({
  fetch: mockFetch,
}));

describe("fetchRepoInfo", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("请求成功时返回仓库信息", async () => {
    const repo = {
      full_name: "mbr1024/dahl",
      description: "scaffold",
      stargazers_count: 42,
      forks_count: 3,
      open_issues_count: 1,
      updated_at: "2026-08-08T00:00:00Z",
      html_url: "https://github.com/mbr1024/dahl",
    };
    mockFetch.mockResolvedValue({ ok: true, json: async () => repo });

    await expect(fetchRepoInfo("mbr1024", "dahl")).resolves.toEqual(repo);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/mbr1024/dahl",
      expect.objectContaining({
        method: "GET",
        headers: { Accept: "application/vnd.github+json" },
      }),
    );
  });

  it("HTTP 非 2xx 时抛出包含状态码的错误", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    await expect(fetchRepoInfo("no-such", "repo")).rejects.toThrow("HTTP 404");
  });

  it("网络异常时向上抛出", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    await expect(fetchRepoInfo("a", "b")).rejects.toThrow("network down");
  });
});
