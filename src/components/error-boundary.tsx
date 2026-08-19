import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import i18n from "@/i18n";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 全局错误边界：页面渲染出错时兜底展示，避免白屏。
 * 用法：<ErrorBoundary><Page /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // 生产环境可在这里上报错误
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="size-10 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-lg font-medium">{i18n.t("error.title")}</h2>
            <p className="max-w-md text-sm text-muted-foreground">{this.state.error.message}</p>
          </div>
          <Button onClick={() => this.setState({ error: null })}>{i18n.t("error.retry")}</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
