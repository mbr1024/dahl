import { useEffect } from "react";
import { useUpdateStore } from "@/stores/use-update-store";
import { runUpdateCheck } from "@/services/updater";

/** 启动 N 秒后静默检查更新（开发模式跳过：location 指向 dev server） */
const CHECK_DELAY_MS = 5000;

export function useAutoUpdate() {
  const autoCheck = useUpdateStore((s) => s.autoCheck);
  const isDevServer = window.location.protocol === "http:" || window.location.protocol === "https:";

  useEffect(() => {
    if (!autoCheck || isDevServer) return;
    const timer = setTimeout(() => {
      void runUpdateCheck(true).catch(() => {
        // 静默模式：失败不打扰，仅重置状态
        useUpdateStore.getState().setStatus("idle");
      });
    }, CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoCheck, isDevServer]);
}
