import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import AppLayout from "@/components/layout/app-layout";
import "@/i18n";
import { useSettingsStore } from "@/stores/use-settings";

afterEach(cleanup);

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={["/home"]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="home" element={<div>home content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("AppLayout", () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: "light" });
  });

  it("渲染导航项与主题按钮", () => {
    renderLayout();

    expect(screen.getByText("Dahl")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "首页" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "桌面能力" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "数据请求" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "设置" })).toBeInTheDocument();
    expect(screen.getByText("主题：浅色")).toBeInTheDocument();
    expect(screen.getByText("home content")).toBeInTheDocument();
  });

  it("通过下拉菜单切换主题", async () => {
    renderLayout();

    fireEvent.pointerDown(screen.getByRole("button", { name: "主题：浅色" }));
    fireEvent.click(await screen.findByText("深色"));
    expect(useSettingsStore.getState().theme).toBe("dark");
    expect(screen.getByText("主题：深色")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "主题：深色" }));
    fireEvent.click(await screen.findByText("跟随系统"));
    expect(useSettingsStore.getState().theme).toBe("system");
    expect(screen.getByText("主题：跟随系统")).toBeInTheDocument();
  });
});
