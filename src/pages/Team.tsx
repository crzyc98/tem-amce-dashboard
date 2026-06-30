import { Link, useParams } from "react-router-dom";
import { useData } from "../DataContext";
import { rollupStatus } from "../selectors";
import { KpiTile } from "../components/KpiTile";
import { RagBadge } from "../components/RagBadge";
import { AREA_LABELS } from "../types";

export function TeamsIndex() {
  const { doc } = useData();
  if (!doc) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-ink">Teams</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doc.teams.map((t) => (
          <Link
            key={t.id}
            to={`/teams/${t.id}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand/40 hover:shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-ink">{t.label}</h3>
                <p className="text-xs text-muted">Lead: {t.lead}</p>
              </div>
              <RagBadge status={rollupStatus(t.kpis)} size="sm" />
            </div>
            <p className="mt-3 text-sm text-muted">{t.kpis.length} KPIs →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const { doc } = useData();
  if (!doc || !teamId) return null;
  const team = doc.teams.find((t) => t.id === teamId);
  if (!team) return <Link to="/teams" className="text-brand">← Teams</Link>;

  // "Contributes to" tags: which areas of focus this team's KPIs feed.
  const contributesTo = [...new Set(team.kpis.map((k) => k.area))];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/teams" className="text-sm text-brand hover:underline">
          ← Teams
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-ink">{team.label}</h2>
          <RagBadge status={rollupStatus(team.kpis)} size="sm" />
        </div>
        <p className="text-sm text-muted">Lead: {team.lead}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted">Contributes to:</span>
          {contributesTo.map((a) => (
            <span key={a} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-muted">
              {AREA_LABELS[a]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {team.kpis.map((k) => (
          <KpiTile key={k.id} kpi={k} showOwner={false} />
        ))}
      </div>
    </div>
  );
}
