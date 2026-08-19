import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stack = [
  { name: "React 19", descKey: "home.stack.ui" },
  { name: "TypeScript", descKey: "home.stack.types" },
  { name: "Vite 7", descKey: "home.stack.build" },
  { name: "Tauri 2", descKey: "home.stack.desktop" },
  { name: "react-router v8", descKey: "home.stack.routing" },
  { name: "zustand", descKey: "home.stack.clientState" },
  { name: "TanStack Query", descKey: "home.stack.serverState" },
  { name: "Tailwind v4", descKey: "home.stack.styling" },
  { name: "shadcn/ui", descKey: "home.stack.components" },
  { name: "ESLint + Prettier", descKey: "home.stack.quality" },
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
        {stack.map(({ name, descKey }) => (
          <Card key={name} className="p-4">
            <Badge variant="secondary" className="mb-2">
              {name}
            </Badge>
            <p className="text-xs text-muted-foreground">{t(descKey)}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("home.conventions")}</CardTitle>
          <CardDescription>{t("home.conventionsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">routes/</code>{" "}
            {t("home.routes")}
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">components/</code>{" "}
            {t("home.components")}
          </p>
          <p>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">stores/</code> zustand
            {t("home.state")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
