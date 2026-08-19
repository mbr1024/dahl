const env = import.meta.env;

export const appConfig = {
  githubApiBaseUrl: (env.VITE_GITHUB_API_URL || "https://api.github.com").replace(/\/$/, ""),
  demoRepoOwner: env.VITE_DEMO_REPO_OWNER || "tauri-apps",
  demoRepoName: env.VITE_DEMO_REPO_NAME || "tauri",
};
