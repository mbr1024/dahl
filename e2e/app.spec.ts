import { browser, expect } from "@wdio/globals";

/**
 * Dahl 冒烟测试：验证应用启动、路由导航、Rust 命令 invoke、SQLite、i18n。
 * 运行前需先构建 debug 二进制：npm run tauri build -- --debug --no-bundle
 */
describe("Dahl 冒烟测试", () => {
  it("应用启动并渲染首页", async () => {
    const title = await browser.tauri.execute(() => document.title);
    expect(title).toContain("Dahl");

    const heading = await browser.$("h1");
    await heading.waitForDisplayed({ timeout: 10000 });
    expect(await heading.getText()).toBe("Dahl");
    await expect(browser.$('nav a[href="/home"]')).toBeDisplayed();
  });

  it("Rust 命令 system_info 返回平台信息", async () => {
    const info = await browser.tauri.execute(
      ({ core }) => core.invoke("system_info") as Promise<Record<string, string>>,
    );
    expect(info.os).toBeTruthy();
    expect(info.arch).toBeTruthy();
    expect(info.family).toBeTruthy();
    expect(info.exe).toBeTruthy();
  });

  it("桌面能力页：Rust 命令 invoke 并渲染结果", async () => {
    await browser.$('nav a[href="/capabilities"]').click();
    const heading = await browser.$("h1");
    await heading.waitForDisplayed({ timeout: 10000 });
    // 标题文案随默认语言（en）或持久化偏好变化，不断言具体文案
    expect(await heading.isDisplayed()).toBe(true);

    await browser.$("button=获取系统信息").click();
    // 结果区展示可执行文件路径（含 dahl，跨语言跨平台一致）
    await expect(browser.$("main")).toHaveText(expect.stringContaining("dahl"));
  });

  it("桌面能力页：SQLite 建表/插入/查询", async () => {
    await browser.$("button=插入并查询 todos").click();
    await expect(browser.$("main ul li")).toBePresent();
  });

  it("设置页：切换语言后导航文案更新", async () => {
    await browser.$('nav a[href="/settings"]').click();

    // 先切回中文（消除上次运行 persist 的残留状态），再切 English
    await browser.$("button=中文").click();
    await expect(browser.$("h1")).toHaveText("设置");

    await browser.$("button=English").click();
    await expect(browser.$('nav a[href="/home"]')).toHaveText("Home");
  });

  it("首页导航：English 下首页展示英文描述", async () => {
    await browser.$('nav a[href="/settings"]').click();
    await browser.$("button=English").click();
    await browser.$('nav a[href="/home"]').click();
    await expect(browser.$("h1")).toHaveText("Dahl");
    await expect(browser.$("main")).toHaveText(expect.stringContaining("desktop scaffold"));
  });
});
