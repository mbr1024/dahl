import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

/**
 * 数据请求层。
 *
 * 桌面环境用 tauri 的 http 插件发起请求（原生网络栈、无 CORS 限制），
 * 搭配 TanStack Query 做缓存/重取/loading 状态。Web 端调试时可将
 * `tauriFetch` 换成浏览器原生 `fetch`。
 */

export const queryKeys = {
  github: ["github", "repo"] as const,
};

export interface RepoInfo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  html_url: string;
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const res = await tauriFetch(`https://api.github.com/repos/${owner}/${repo}`, {
    method: "GET",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`请求失败：HTTP ${res.status}`);
  return res.json() as Promise<RepoInfo>;
}
