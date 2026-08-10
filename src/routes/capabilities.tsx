import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, message } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { load } from "@tauri-apps/plugin-store";
import { info } from "@tauri-apps/plugin-log";
import Database from "@tauri-apps/plugin-sql";
import { Command } from "@tauri-apps/plugin-shell";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SystemInfo {
  os: string;
  arch: string;
  family: string;
  exe: string;
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function CapabilitiesPage() {
  const { t } = useTranslation();
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [clipboard, setClipboard] = useState("");
  const [storeValue, setStoreValue] = useState<string>("");

  /** Rust 命令调用演示 */
  const handleInvoke = async () => {
    try {
      const result = await invoke<SystemInfo>("system_info");
      setSysInfo(result);
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** 对话框 + 文件系统：选文件并读取内容 */
  const handlePickFile = async () => {
    try {
      const file = await open({
        multiple: false,
        filters: [{ name: "文本", extensions: ["txt", "md", "json", "log"] }],
      });
      if (typeof file !== "string") {
        toast.info(t("capabilities.file.noFile"));
        return;
      }
      const content = await readTextFile(file);
      toast.success(
        t("capabilities.file.readOk", {
          file: file.split("/").pop(),
          content: content.slice(0, 60) + (content.length > 60 ? "…" : ""),
        }),
      );
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** 剪贴板：写入一段文本 */
  const handleWriteClipboard = async () => {
    await writeText(t("capabilities.clipboard.content", { time: new Date().toLocaleTimeString() }));
    setClipboard(await readText());
    toast.success(t("capabilities.clipboard.written"));
  };

  /** 系统通知 */
  const handleNotify = async () => {
    let granted = await isPermissionGranted();
    if (!granted) granted = (await requestPermission()) === "granted";
    if (!granted) {
      toast.error(t("capabilities.notify.denied"));
      return;
    }
    sendNotification({
      title: "Dahl",
      body: t("capabilities.notify.body"),
    });
  };

  /** 本地键值存储（store 插件） */
  const handleStore = async () => {
    const store = await load("demo.json", { autoSave: true });
    const key = "lastClickAt";
    const now = new Date().toLocaleTimeString();
    await store.set(key, now);
    setStoreValue(now);
    toast.success(t("capabilities.store.written", { key, value: now }));
  };

  /** 原生消息框 */
  const handleMessageBox = async () => {
    await message(t("capabilities.message.ok"), { title: "Dahl", kind: "info" });
  };

  /** SQLite：建表、插入、查询 */
  const [todos, setTodos] = useState<{ id: number; title: string }[]>([]);
  const handleSql = async () => {
    try {
      const db = await Database.load("sqlite:dahl.db");
      await db.execute(
        "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL)",
      );
      await db.execute("INSERT INTO todos (title) VALUES ($1)", [`demo-${Date.now() % 10000}`]);
      const rows = await db.select<{ id: number; title: string }[]>(
        "SELECT id, title FROM todos ORDER BY id DESC LIMIT 5",
      );
      setTodos(rows);
      toast.success(t("capabilities.sql.ok", { count: rows.length }));
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** Shell：执行系统命令（权限 scope 限定 open/echo） */
  const handleShell = async () => {
    try {
      const output = await Command.create("echo", ["hello from shell"]).execute();
      toast.success(t("capabilities.shell.ok", { output: output.stdout }));
      info(`shell echo: ${output.stdout}`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** 深链接：监听 dahl:// 唤起事件 */
  const [deepLinks, setDeepLinks] = useState<string[]>([]);
  useEffect(() => {
    const unlisten = onOpenUrl((urls) => {
      setDeepLinks((prev) => [...urls, ...prev].slice(0, 5));
      toast.success(t("capabilities.deeplink.received", { urls: urls.join(", ") }));
    });
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-medium">{t("capabilities.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("capabilities.desc")}</p>
      </header>

      <Section title={t("capabilities.invoke.title")} desc={t("capabilities.invoke.desc")}>
        <div className="space-y-3">
          <Button onClick={handleInvoke}>{t("capabilities.invoke.button")}</Button>
          {sysInfo && (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge>{sysInfo.os}</Badge>
              <Badge>{sysInfo.arch}</Badge>
              <Badge variant="secondary">{sysInfo.family}</Badge>
              <p className="w-full truncate text-xs text-muted-foreground">{sysInfo.exe}</p>
            </div>
          )}
        </div>
      </Section>

      <Section title={t("capabilities.file.title")} desc={t("capabilities.file.desc")}>
        <Button onClick={handlePickFile}>{t("capabilities.file.button")}</Button>
      </Section>

      <Section title={t("capabilities.clipboard.title")} desc={t("capabilities.clipboard.desc")}>
        <div className="space-y-3">
          <Button onClick={handleWriteClipboard}>{t("capabilities.clipboard.button")}</Button>
          {clipboard && (
            <p className="text-sm text-muted-foreground">
              {t("capabilities.clipboard.current", { content: clipboard })}
            </p>
          )}
        </div>
      </Section>

      <Section title={t("capabilities.notify.title")} desc={t("capabilities.notify.desc")}>
        <Button onClick={handleNotify}>{t("capabilities.notify.button")}</Button>
      </Section>

      <Section title={t("capabilities.store.title")} desc={t("capabilities.store.desc")}>
        <div className="space-y-3">
          <Button onClick={handleStore}>{t("capabilities.store.button")}</Button>
          {storeValue && (
            <p className="text-sm text-muted-foreground">
              {t("capabilities.store.last", { value: storeValue })}
            </p>
          )}
        </div>
      </Section>

      <Section title={t("capabilities.message.title")} desc={t("capabilities.message.desc")}>
        <Button onClick={handleMessageBox}>{t("capabilities.message.button")}</Button>
      </Section>

      <Section title={t("capabilities.sql.title")} desc={t("capabilities.sql.desc")}>
        <div className="space-y-3">
          <Button onClick={handleSql}>{t("capabilities.sql.button")}</Button>
          {todos.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {todos.map((t) => (
                <li key={t.id}>
                  #{t.id} {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title={t("capabilities.shell.title")} desc={t("capabilities.shell.desc")}>
        <Button onClick={handleShell}>{t("capabilities.shell.button")}</Button>
      </Section>

      <Section title={t("capabilities.deeplink.title")} desc={t("capabilities.deeplink.desc")}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("capabilities.deeplink.hint", { scheme: "dahl://hello" })}
          </p>
          {deepLinks.length > 0 && (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {deepLinks.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}
