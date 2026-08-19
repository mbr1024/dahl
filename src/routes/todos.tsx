import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  createTodo,
  deleteTodo,
  exportTodosJson,
  fetchTodos,
  toggleTodo,
  todosQueryKey,
} from "@/services/todos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

/**
 * 待办示例：SQLite 持久化的完整 CRUD。
 * 展示脚手架约定：service 层收 SQL，组件用 TanStack Query 管理服务端状态，
 * 变更后 invalidate 重取，i18n 文案全量中英。
 */
export default function TodosPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const todosQuery = useQuery({ queryKey: todosQueryKey, queryFn: fetchTodos });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: todosQueryKey });

  const createMutation = useMutation({
    mutationFn: () => createTodo(draft),
    onSuccess: () => {
      setDraft("");
      toast.success(t("todos.created"));
      void invalidate();
    },
    onError: (e) => toast.error(String(e)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) => toggleTodo(id, done),
    onSuccess: () => void invalidate(),
    onError: (e) => toast.error(String(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      toast.success(t("todos.deleted"));
      void invalidate();
    },
    onError: (e) => toast.error(String(e)),
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const path = await save({ defaultPath: "dahl-todos.json" });
      if (!path) {
        return false;
      }
      await writeTextFile(path, await exportTodosJson());
      return true;
    },
    onSuccess: (exported) => {
      if (exported) toast.success(t("todos.exported"));
    },
    onError: (e) => toast.error(String(e)),
  });

  const todos = todosQuery.data ?? [];
  const doneCount = todos.filter((todo) => todo.done).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || createMutation.isPending) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-medium">{t("todos.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("todos.desc")}</p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">{t("todos.list")}</CardTitle>
            <CardDescription>
              {t("todos.count", { total: todos.length, done: doneCount })}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending || todos.length === 0}
          >
            {t("todos.export")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("todos.placeholder")}
              maxLength={100}
              aria-label={t("todos.placeholder")}
            />
            <Button type="submit" disabled={createMutation.isPending || !draft.trim()}>
              {t("todos.add")}
            </Button>
          </form>

          {todosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("todos.loading")}</p>
          ) : todosQuery.isError ? (
            <p className="text-sm text-destructive">
              {t("todos.failed", { error: String(todosQuery.error) })}
            </p>
          ) : todos.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("todos.empty")}</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: todo.id, done: checked === true })
                    }
                    aria-label={`${todo.title} ${todo.done ? t("todos.markUndone") : t("todos.markDone")}`}
                  />
                  <span
                    className={
                      "flex-1 truncate text-sm " +
                      (todo.done ? "text-muted-foreground line-through" : "")
                    }
                  >
                    {todo.title}
                  </span>
                  {todo.done && <Badge variant="secondary">{t("todos.completed")}</Badge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(todo.id)}
                    aria-label={`${t("todos.delete")} ${todo.title}`}
                  >
                    {t("todos.delete")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
