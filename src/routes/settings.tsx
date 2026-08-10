import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore, type Language, type Theme } from "@/stores/use-settings";
import { useUpdateStore } from "@/stores/use-update-store";
import { runUpdateCheck, installUpdate } from "@/services/updater";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const themeOptions: { value: Theme; label: string; desc: string }[] = [
  { value: "light", label: "浅色", desc: "始终使用浅色主题" },
  { value: "dark", label: "深色", desc: "始终使用深色主题" },
  { value: "system", label: "跟随系统", desc: "随系统深浅色自动切换" },
];

const languageOptions: { value: Language; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [autoStart, setAutoStart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exePath, setExePath] = useState("");
  const [version, setVersion] = useState("");
  const [platform, setPlatform] = useState("");

  const autoCheck = useUpdateStore((s) => s.autoCheck);
  const setAutoCheck = useUpdateStore((s) => s.setAutoCheck);
  const status = useUpdateStore((s) => s.status);
  const updateVersion = useUpdateStore((s) => s.version);
  const updateError = useUpdateStore((s) => s.error);
  const busy = status === "checking" || status === "installing";

  useEffect(() => {
    void isEnabled()
      .then(setAutoStart)
      .catch(() => setAutoStart(false))
      .finally(() => setLoading(false));
    void invoke<{ exe: string; os: string; arch: string }>("system_info").then((info) => {
      setExePath(info.exe);
      setPlatform(`${info.os}/${info.arch}`);
    });
    void getVersion().then(setVersion);
  }, []);

  const toggleAutoStart = async (checked: boolean) => {
    try {
      if (checked) {
        await enable();
        toast.success("已开启开机自启");
      } else {
        await disable();
        toast.success("已关闭开机自启");
      }
      setAutoStart(checked);
    } catch (e) {
      toast.error(String(e));
    }
  };

  /** 手动检查更新（非静默：完整提示） */
  const handleCheckUpdate = async () => {
    await runUpdateCheck(false);
  };

  /** 重启并安装已下载的更新 */
  const handleInstallUpdate = async () => {
    await installUpdate();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-medium">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">
          主题（zustand 持久化 + 系统深浅色联动）、语言、开机自启、更新检查。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">外观</CardTitle>
          <CardDescription>选择主题模式，偏好会持久化保存</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {themeOptions.map(({ value, label }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "outline"}
              onClick={() => setTheme(value)}
            >
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.language")}</CardTitle>
          <CardDescription>界面语言（react-i18next）</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {languageOptions.map(({ value, label }) => (
            <Button
              key={value}
              variant={language === value ? "default" : "outline"}
              onClick={() => setLanguage(value)}
            >
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">通用</CardTitle>
          <CardDescription>开机自启由 autostart 插件管理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autostart">开机自启</Label>
              <p className="text-xs text-muted-foreground">登录系统后自动启动应用</p>
            </div>
            <Switch
              id="autostart"
              checked={autoStart}
              disabled={loading}
              onCheckedChange={toggleAutoStart}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.update.title")}</CardTitle>
          <CardDescription>{t("settings.update.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-check">{t("settings.update.autoCheck")}</Label>
              <p className="text-xs text-muted-foreground">{t("settings.update.autoCheckDesc")}</p>
            </div>
            <Switch id="auto-check" checked={autoCheck} onCheckedChange={setAutoCheck} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleCheckUpdate} disabled={busy}>
              {status === "checking" ? t("settings.update.checking") : t("settings.update.check")}
            </Button>
            {status === "ready" && (
              <Button onClick={handleInstallUpdate}>{t("settings.update.restartInstall")}</Button>
            )}
            {status === "downloading" && updateVersion && (
              <span className="text-sm text-muted-foreground">
                {t("settings.update.downloading", { version: updateVersion })}
              </span>
            )}
            {status === "ready" && updateVersion && (
              <span className="text-sm text-muted-foreground">
                {t("settings.update.ready", { version: updateVersion })}
              </span>
            )}
            {status === "up-to-date" && (
              <span className="text-sm text-muted-foreground">{t("settings.update.upToDate")}</span>
            )}
            {status === "error" && updateError && (
              <span className="text-sm text-destructive">
                {t("settings.update.failed", { error: updateError })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.about.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge>Dahl v{version}</Badge>
            <Badge variant="secondary">Tauri 2 + React 19</Badge>
            {platform && (
              <Badge variant="outline">
                {t("settings.about.platform")}: {platform}
              </Badge>
            )}
          </div>
          {exePath && <p className="truncate text-xs text-muted-foreground">{exePath}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
