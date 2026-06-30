import { Navigate, Route, Routes } from "react-router-dom";
import { DataProvider, useData } from "./DataContext";
import { Layout } from "./components/Layout";
import { Summary } from "./pages/Summary";
import { AreasIndex, AreaDetail } from "./pages/Area";
import { TeamsIndex, TeamDetail } from "./pages/Team";
import { Shared } from "./pages/Shared";

// Gate the routed content on data load so every page can assume `doc` exists.
function Gate({ children }: { children: React.ReactNode }) {
  const { loading, error, doc } = useData();
  if (error) {
    return (
      <div className="rounded-lg border border-rag-red/30 bg-rag-red/5 p-6 text-rag-red">
        <p className="font-semibold">Could not load dashboard data.</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }
  if (loading || !doc) {
    return <div className="p-6 text-muted">Loading…</div>;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Gate><Summary /></Gate>} />
          <Route path="areas" element={<Gate><AreasIndex /></Gate>} />
          <Route path="areas/:areaId" element={<Gate><AreaDetail /></Gate>} />
          <Route path="teams" element={<Gate><TeamsIndex /></Gate>} />
          <Route path="teams/:teamId" element={<Gate><TeamDetail /></Gate>} />
          <Route path="shared" element={<Gate><Shared /></Gate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}
