import Database from "@tauri-apps/plugin-sql";

/**
 * 待办示例：SQLite 持久化的完整 CRUD（建表/列表/新建/切换/删除/导出）。
 * 展示脚手架约定的服务层写法：db 操作收在 services/，组件用 TanStack Query 消费。
 */
export interface Todo {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
}

/** TanStack Query 的缓存键（组件侧 import 使用） */
export const todosQueryKey = ["todos"] as const;

let dbPromise: Promise<Database> | null = null;

async function migrate(db: Database): Promise<void> {
  await db.execute(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL)",
  );
  const applied = await db.select<{ version: number }[]>(
    "SELECT version FROM schema_migrations ORDER BY version ASC",
  );
  const appliedVersions = new Set((applied ?? []).map(({ version }) => version));

  if (!appliedVersions.has(1)) {
    await db.execute(
      "CREATE TABLE IF NOT EXISTS todo_items (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "title TEXT NOT NULL, " +
        "done INTEGER NOT NULL DEFAULT 0, " +
        "created_at TEXT NOT NULL)",
    );
    await db.execute("INSERT INTO schema_migrations (version) VALUES ($1)", [1]);
  }
}

function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:dahl.db")
      .then(async (db) => {
        await migrate(db);
        return db;
      })
      .catch((error) => {
        dbPromise = null;
        throw error;
      });
  }
  return dbPromise;
}

function rowToTodo(row: { id: number; title: string; done: number; created_at: string }): Todo {
  return { id: row.id, title: row.title, done: row.done === 1, created_at: row.created_at };
}

export async function fetchTodos(): Promise<Todo[]> {
  const db = await getDb();
  const rows = await db.select<{ id: number; title: string; done: number; created_at: string }[]>(
    "SELECT id, title, done, created_at FROM todo_items ORDER BY done ASC, created_at DESC",
  );
  return rows.map(rowToTodo);
}

export async function createTodo(title: string): Promise<void> {
  const db = await getDb();
  await db.execute("INSERT INTO todo_items (title, done, created_at) VALUES ($1, 0, $2)", [
    title.trim(),
    new Date().toISOString(),
  ]);
}

export async function toggleTodo(id: number, done: boolean): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE todo_items SET done = $1 WHERE id = $2", [done ? 1 : 0, id]);
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM todo_items WHERE id = $1", [id]);
}

/** 导出全部待办为 JSON 文本（写入路径由 dialog save 选定，fs 权限随选择自动授予） */
export async function exportTodosJson(): Promise<string> {
  const todos = await fetchTodos();
  return JSON.stringify(todos, null, 2);
}
