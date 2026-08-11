import { Navigate, Route, Routes } from "react-router";
import AppLayout from "@/components/layout/app-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAutoUpdate } from "@/hooks/use-auto-update";
import HomePage from "@/routes/home";
import CapabilitiesPage from "@/routes/capabilities";
import DataPage from "@/routes/data";
import SettingsPage from "@/routes/settings";
import TodosPage from "@/routes/todos";

export default function App() {
  useAutoUpdate();
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
