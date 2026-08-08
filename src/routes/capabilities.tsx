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
        toast.info("未选择文件");
        return;
      }
      const content = await readTextFile(file);
      toast.success(
        `读取 ${file.split("/").pop()}：${content.slice(0, 60)}${content.length > 60 ? "…" : ""}`,
      );
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** 剪贴板：写入一段文本 */
  const handleWriteClipboard = async () => {
    await writeText("来自 Dahl 的内容 ✦ " + new Date().toLocaleTimeString());
    setClipboard(await readText());
    toast.success("已写入剪贴板");
  };

  /** 系统通知 */
  const handleNotify = async () => {
    let granted = await isPermissionGranted();
    if (!granted) granted = (await requestPermission()) === "granted";
    if (!granted) {
      toast.error("通知权限被拒绝");
      return;
    }
    sendNotification({
      title: "Dahl",
      body: "这是一条系统通知，来自 notification 插件",
    });
  };

  /** 本地键值存储（store 插件） */
  const handleStore = async () => {
    const store = await load("demo.json", { autoSave: true });
    const key = "lastClickAt";
    const now = new Date().toLocaleTimeString();
    await store.set(key, now);
    setStoreValue(now);
    toast.success(`已写入 store：${key} = ${now}`);
  };

  /** 原生消息框 */
  const handleMessageBox = async () => {
    await message("对话框/消息框插件工作正常", { title: "Dahl", kind: "info" });
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
      toast.success(`SQLite 查询到 ${rows.length} 条记录`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** Shell：执行系统命令（权限 scope 限定 open/echo） */
  const handleShell = async () => {
    try {
      const output = await Command.create("echo", ["hello from shell"]).execute();
      toast.success(`echo 输出：${output.stdout}`);
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
      toast.success(`收到深链接：${urls.join(", ")}`);
    });
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-medium">桌面能力</h1>
        <p className="text-sm text-muted-foreground">
          常用 Tauri 插件开箱即用：Rust 命令、对话框、文件系统、剪贴板、通知、本地存储。
        </p>
      </header>

      <Section title="Rust 命令（invoke）" desc="前端调用 Rust 函数，返回结构化数据">
        <div className="space-y-3">
          <Button onClick={handleInvoke}>获取系统信息</Button>
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

      <Section title="对话框 + 文件系统" desc="dialog 选文件，fs 读取内容">
        <Button onClick={handlePickFile}>选择文件并读取</Button>
      </Section>

      <Section title="剪贴板" desc="clipboard-manager 读写系统剪贴板">
        <div className="space-y-3">
          <Button onClick={handleWriteClipboard}>写入剪贴板</Button>
          {clipboard && <p className="text-sm text-muted-foreground">当前内容：{clipboard}</p>}
        </div>
      </Section>

      <Section title="系统通知" desc="notification 插件发送桌面通知">
        <Button onClick={handleNotify}>发送通知</Button>
      </Section>

      <Section title="本地存储" desc="store 插件做键值持久化（比 localStorage 更贴近系统）">
        <div className="space-y-3">
          <Button onClick={handleStore}>写入当前时间</Button>
          {storeValue && <p className="text-sm text-muted-foreground">上次写入：{storeValue}</p>}
        </div>
      </Section>

      <Section title="原生消息框" desc="dialog 的 message 系列 API">
        <Button onClick={handleMessageBox}>弹出消息框</Button>
      </Section>

      <Section title="SQLite" desc="sql 插件本地数据库（建表/插入/查询）">
        <div className="space-y-3">
          <Button onClick={handleSql}>插入并查询 todos</Button>
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

      <Section title="Shell 命令" desc="shell 插件执行系统命令（scope 限定 echo）">
        <Button onClick={handleShell}>执行 echo</Button>
      </Section>

      <Section title="深链接" desc="deep-link 插件监听 dahl:// 唤起（dev 下需注册 scheme）">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            在浏览器打开 <Badge variant="secondary">dahl://hello</Badge> 可唤起应用
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
