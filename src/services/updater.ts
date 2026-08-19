import { check, type Update } from "@tauri-apps/plugin-updater";
import { isPermissionGranted, sendNotification } from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import i18n from "@/i18n";
import { useUpdateStore } from "@/stores/use-update-store";

/** 下载完成且可安装的 Update（内存缓存：避免点"重启并安装"时重复下载） */
let cachedUpdate: Update | null = null;

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

  cachedUpdate = update;
  store.setStatus("ready");
  toast.success(i18n.t("settings.update.ready", { version: update.version }));
  const granted = await isPermissionGranted().catch(() => false);
  if (granted) {
    await Promise.resolve(
      sendNotification({
        title: i18n.t("settings.update.notifyTitle"),
        body: i18n.t("settings.update.notifyBody", { version: update.version }),
      }),
    ).catch(() => undefined);
  }
}

/**
 * 重启并安装已下载的更新：优先复用 runUpdateCheck 下载好的安装包，
 * 无缓存时才重新检查下载。
 */
export async function installUpdate(): Promise<void> {
  const store = useUpdateStore.getState();
  try {
    const update = cachedUpdate ?? (await check());
    if (!update) {
      store.setStatus("up-to-date");
      return;
    }
    store.setStatus("installing");
    if (!cachedUpdate) {
      await update.download(() => {});
    }
    await update.install();
    // install 只完成安装；restart_app 先解除 single-instance 锁再重启，
    // 否则新实例会被让位导致旧版本继续运行
    await invoke("restart_app");
  } catch (e) {
    store.setStatus("ready");
    store.setError(String(e));
    toast.error(i18n.t("settings.update.failed", { error: String(e) }));
  }
}
