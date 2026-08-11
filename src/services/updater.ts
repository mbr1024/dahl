import { check, type Update } from "@tauri-apps/plugin-updater";
import { isPermissionGranted, sendNotification } from "@tauri-apps/plugin-notification";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";
import i18n from "@/i18n";
import { useUpdateStore } from "@/stores/use-update-store";

/**
 * 检查并后台下载更新。
 * @param silent 静默模式（自动检查）：不弹"发现新版本/下载中"提示，
 *               只在下载就绪时提醒；手动点击"检查更新"时传 false。
 */
export async function runUpdateCheck(silent: boolean): Promise<void> {
  const store = useUpdateStore.getState();
  // 已有下载完成的版本时直接提示，避免重复下载
  if (store.status === "ready") {
    if (!silent) {
      toast.info(i18n.t("settings.update.ready", { version: store.version }));
    }
    return;
  }
  store.setStatus("checking");
  store.setError(null);

  let update: Update | null;
  try {
    update = await check();
  } catch (e) {
    store.setStatus("idle");
    store.setError(String(e));
    if (!silent) toast.error(i18n.t("settings.update.failed", { error: String(e) }));
    return;
  }

  if (!update) {
    store.setStatus("up-to-date");
    if (!silent) toast.info(i18n.t("settings.update.upToDate"));
    return;
  }

  store.setVersion(update.version);
  store.setStatus("downloading");
  if (!silent) {
    toast.info(i18n.t("settings.update.found", { version: update.version }));
  }

  try {
    await update.download(() => {});
  } catch (e) {
    store.setStatus("idle");
    store.setError(String(e));
    if (!silent) toast.error(i18n.t("settings.update.failed", { error: String(e) }));
    return;
  }

  store.setStatus("ready");
  toast.success(i18n.t("settings.update.ready", { version: update.version }));
  const granted = await isPermissionGranted().catch(() => false);
  if (granted) {
    sendNotification({
      title: i18n.t("settings.update.notifyTitle"),
      body: i18n.t("settings.update.notifyBody", { version: update.version }),
    });
  }
}

/**
 * 重启并安装已下载的更新（updater 缓存了安装包，install 后应用自动重启）。
 */
export async function installUpdate(): Promise<void> {
  const store = useUpdateStore.getState();
  try {
    const update = await check();
    if (!update) {
      store.setStatus("up-to-date");
      return;
    }
    store.setStatus("installing");
    await update.download(() => {});
    await update.install();
    // install 只完成安装，需手动 relaunch 重启到新版本
    await relaunch();
  } catch (e) {
    store.setStatus("ready");
    store.setError(String(e));
    toast.error(i18n.t("settings.update.failed", { error: String(e) }));
  }
}
