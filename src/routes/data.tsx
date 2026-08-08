import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { fetchRepoInfo, queryKeys } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 数据请求演示：TanStack Query + Tauri http 插件。
 * 展示了 loading / error / success 三种状态与手动重取。
 */
export default function DataPage() {
  const query = useQuery({
    queryKey: queryKeys.github,
    queryFn: () => fetchRepoInfo("tauri-apps", "tauri"),
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-medium">数据请求</h1>
        <p className="text-sm text-muted-foreground">
          TanStack Query 管理服务端状态，Tauri http 插件发请求（无 CORS 限制）。示例：拉取
          tauri-apps/tauri 仓库信息。
        </p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">GET api.github.com/repos/tauri-apps/tauri</CardTitle>
            <CardDescription>staleTime 30s，重复进入页面不会重复请求</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />
            重取
          </Button>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ) : query.isError ? (
            <div className="space-y-2">
              <Badge variant="destructive">请求失败</Badge>
              <p className="text-sm text-muted-foreground">{String(query.error)}</p>
              <p className="text-xs text-muted-foreground">
                提示：http 插件默认放行所有 URL；如需收紧，可在 capabilities 中配置 http 的 scope。
              </p>
            </div>
          ) : query.data ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{query.data.full_name}</span>
                <Badge>⭐ {query.data.stargazers_count.toLocaleString()}</Badge>
                <Badge variant="secondary">🍴 {query.data.forks_count.toLocaleString()}</Badge>
                <Badge variant="secondary">issues {query.data.open_issues_count}</Badge>
              </div>
              <p className="text-muted-foreground">{query.data.description}</p>
              <p className="text-xs text-muted-foreground">
                最近更新：{new Date(query.data.updated_at).toLocaleString()}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
