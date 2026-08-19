import { useEffect } from "react";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { toast } from "sonner";
import i18n from "@/i18n";
import { useDeepLinkStore } from "@/stores/use-deep-link-store";

/** Register deep-link handling once at app level, including cold-start URLs. */
export function useDeepLinkListener() {
  useEffect(() => {
    const handleUrls = (urls: string[]) => {
      if (urls.length === 0) return;
      useDeepLinkStore.getState().addUrls(urls);
      toast.success(i18n.t("capabilities.deeplink.received", { urls: urls.join(", ") }));
    };

    const unlisten = onOpenUrl(handleUrls).catch(() => () => {});
    void getCurrent()
      .then((urls) => {
        if (urls) handleUrls(urls);
      })
      .catch(() => undefined);

    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);
}
