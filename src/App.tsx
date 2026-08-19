import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { useTranslation } from "react-i18next";
import AppLayout from "@/components/layout/app-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAutoUpdate } from "@/hooks/use-auto-update";
import { useDeepLinkListener } from "@/hooks/use-deep-link-listener";

const HomePage = lazy(() => import("@/routes/home"));
const CapabilitiesPage = lazy(() => import("@/routes/capabilities"));
const DataPage = lazy(() => import("@/routes/data"));
const SettingsPage = lazy(() => import("@/routes/settings"));
const TodosPage = lazy(() => import("@/routes/todos"));

function RouteFallback() {
  const { t } = useTranslation();
  return <div className="p-8 text-sm text-muted-foreground">{t("app.loading")}</div>;
}

export default function App() {
  useAutoUpdate();
  useDeepLinkListener();
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="capabilities" element={<CapabilitiesPage />} />
            <Route path="data" element={<DataPage />} />
            <Route path="todos" element={<TodosPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
