import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("合并字符串类名", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("过滤 falsy 值", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("合并条件对象", () => {
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });

  it("tailwind-merge 处理冲突类", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
