import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/error-boundary";
import i18n from "@/i18n";

afterEach(cleanup);

afterEach(() => {
  void i18n.changeLanguage("zh");
});

const Boom = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe("ErrorBoundary", () => {
  it("子组件渲染异常时展示兜底 UI 与错误信息", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom message="page exploded" />
      </ErrorBoundary>,
    );

    expect(screen.getByText("页面出错了")).toBeInTheDocument();
    expect(screen.getByText("page exploded")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重试" })).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith("[ErrorBoundary]", expect.any(Error));

    spy.mockRestore();
  });

  it("子组件正常渲染时透传内容", () => {
    render(
      <ErrorBoundary>
        <div>normal content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("normal content")).toBeInTheDocument();
    expect(screen.queryByText("页面出错了")).not.toBeInTheDocument();
  });

  it("点击重试清除错误并恢复渲染", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    let shouldThrow = true;
    const Flaky = () => {
      if (shouldThrow) throw new Error("flaky");
      return <div>recovered</div>;
    };

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
    expect(screen.getByText("页面出错了")).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "重试" }));

    expect(screen.getByText("recovered")).toBeInTheDocument();
    spy.mockRestore();
  });
});
