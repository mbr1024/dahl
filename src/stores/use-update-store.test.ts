import { beforeEach, describe, expect, it } from "vitest";
import { useUpdateStore } from "@/stores/use-update-store";

describe("useUpdateStore", () => {
  beforeEach(() => {
    useUpdateStore.setState({ status: "idle", version: null, error: null });
  });

  it("默认开启自动检查", () => {
    expect(useUpdateStore.getState().autoCheck).toBe(true);
  });

  it("setAutoCheck 切换自动检查偏好", () => {
    useUpdateStore.getState().setAutoCheck(false);
    expect(useUpdateStore.getState().autoCheck).toBe(false);
  });

  it("setStatus/setVersion 记录更新流程状态", () => {
    useUpdateStore.getState().setStatus("ready");
    useUpdateStore.getState().setVersion("0.2.0");
    expect(useUpdateStore.getState().status).toBe("ready");
    expect(useUpdateStore.getState().version).toBe("0.2.0");
  });
});
