import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stack = [
  { name: "React 19", desc: "UI 框架" },
  { name: "TypeScript", desc: "类型系统" },
  { name: "Vite 7", desc: "构建工具" },
  { name: "Tauri 2", desc: "桌面壳 (Rust)" },
  { name: "react-router v8", desc: "路由" },
  { name: "zustand", desc: "客户端状态" },
  { name: "TanStack Query", desc: "服务端状态" },
  { name: "Tailwind v4", desc: "原子化样式" },
  { name: "shadcn/ui", desc: "组件库 (Radix)" },
  { name: "ESLint + Prettier", desc: "代码规范" },
];

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium">{t("home.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("home.desc")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {stack.map(({ name, desc }) => (
          <Card key={name} className="p-4">
            <Badge variant="secondary" className="mb-2">
              {name}
            </Badge>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("home.conventions")}</CardTitle>
          <CardDescription>新增功能时遵循的目录与职责划分</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">routes/</code>{" "}
            页面级组件，一个路由一个文件
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">components/</code>{" "}
            可复用组件（ui/ 放 shadcn 生成的，业务组件放自己的目录）
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">stores/</code> zustand
            全局状态； <code className="rounded bg-muted px-1.5 py-0.5 text-xs">services/</code>{" "}
            数据请求封装； <code className="rounded bg-muted px-1.5 py-0.5 text-xs">hooks/</code>{" "}
            通用 hooks
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
