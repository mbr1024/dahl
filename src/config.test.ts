import { describe, expect, it } from "vitest";
import { appConfig } from "@/config";

describe("appConfig", () => {
  it("provides safe defaults for the demo API", () => {
    expect(appConfig.githubApiBaseUrl).toBe("https://api.github.com");
    expect(appConfig.demoRepoOwner).toBe("tauri-apps");
    expect(appConfig.demoRepoName).toBe("tauri");
  });
});
