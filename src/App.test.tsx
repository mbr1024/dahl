import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "@/App";
import "@/i18n";

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
});
