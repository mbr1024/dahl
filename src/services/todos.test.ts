import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDatabaseLoad } = vi.hoisted(() => ({ mockDatabaseLoad: vi.fn() }));

vi.mock("@tauri-apps/plugin-sql", () => ({ default: { load: mockDatabaseLoad } }));

const makeDb = () => ({
  execute: vi.fn().mockResolvedValue(undefined),
  select: vi.fn(),
});

describe("todos service", () => {
  let todos: typeof import("./todos");

  beforeEach(async () => {
    mockDatabaseLoad.mockReset();
    // 重置模块缓存，让 db 单例（dbPromise）每个用例重新创建
    vi.resetModules();
    todos = await import("./todos");
  });

  it("首次调用时建表", async () => {
    const db = makeDb();
    db.select.mockResolvedValue([]);
    mockDatabaseLoad.mockResolvedValue(db);

    await todos.fetchTodos();

    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS todo_items"),
    );
    expect(mockDatabaseLoad).toHaveBeenCalledWith("sqlite:dahl.db");
  });

  it("数据库初始化失败后允许下一次调用重试", async () => {
    const db = makeDb();
    db.select.mockResolvedValue([]);
    mockDatabaseLoad.mockRejectedValueOnce(new Error("database unavailable")).mockResolvedValue(db);

    await expect(todos.fetchTodos()).rejects.toThrow("database unavailable");
    await expect(todos.fetchTodos()).resolves.toEqual([]);
    expect(mockDatabaseLoad).toHaveBeenCalledTimes(2);
  });

  it("查询结果映射为 done 布尔（排序由 SQL 负责）", async () => {
    const db = makeDb();
    db.select.mockResolvedValue([
      { id: 2, title: "open item", done: 0, created_at: "2026-08-11T01:00:00Z" },
      { id: 1, title: "done item", done: 1, created_at: "2026-08-11T00:00:00Z" },
    ]);
    mockDatabaseLoad.mockResolvedValue(db);

    const result = await todos.fetchTodos();

    expect(result).toEqual([
      { id: 2, title: "open item", done: false, created_at: "2026-08-11T01:00:00Z" },
      { id: 1, title: "done item", done: true, created_at: "2026-08-11T00:00:00Z" },
    ]);
    expect(db.select).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY done ASC, created_at DESC"),
    );
  });

  it("createTodo 插入并 trim 标题", async () => {
    const db = makeDb();
    mockDatabaseLoad.mockResolvedValue(db);

    await todos.createTodo("  买牛奶  ");

    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO todo_items"), [
      "买牛奶",
      expect.any(String),
    ]);
  });

  it("toggleTodo 用 0/1 更新 done", async () => {
    const db = makeDb();
    mockDatabaseLoad.mockResolvedValue(db);

    await todos.toggleTodo(3, true);

    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE todo_items SET done = $1"),
      [1, 3],
    );
  });

  it("deleteTodo 按 id 删除", async () => {
    const db = makeDb();
    mockDatabaseLoad.mockResolvedValue(db);

    await todos.deleteTodo(7);

    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM todo_items"), [7]);
  });

  it("exportTodosJson 返回格式化 JSON", async () => {
    const db = makeDb();
    db.select.mockResolvedValue([{ id: 1, title: "a", done: 0, created_at: "t" }]);
    mockDatabaseLoad.mockResolvedValue(db);

    const json = await todos.exportTodosJson();

    expect(JSON.parse(json)).toEqual([{ id: 1, title: "a", done: false, created_at: "t" }]);
  });
});
