import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UpdateStatus =
  "idle" | "checking" | "up-to-date" | "downloading" | "ready" | "installing" | "error";

interface UpdateState {
  /** 启动后静默检查（持久化） */
  autoCheck: boolean;
  status: UpdateStatus;
  version: string | null;
  error: string | null;
  setAutoCheck: (autoCheck: boolean) => void;
  setStatus: (status: UpdateStatus) => void;
  setVersion: (version: string | null) => void;
  setError: (error: string | null) => void;
}

/**
 * 更新流程状态（静默检查/下载/安装）。
 * 只持久化 autoCheck 偏好；status 为会话态，重启后回到 idle。
 */
export const useUpdateStore = create<UpdateState>()(
  persist(
    (set) => ({
      autoCheck: true,
      status: "idle",
      version: null,
      error: null,
      setAutoCheck: (autoCheck) => set({ autoCheck }),
      setStatus: (status) => set({ status }),
      setVersion: (version) => set({ version }),
      setError: (error) => set({ error }),
    }),
    {
      name: "update-settings",
      partialize: (state) => ({ autoCheck: state.autoCheck }),
    },
  ),
);
