import { Link, useParams } from "react-router-dom";
import { useData } from "../DataContext";
import { areaSummaries, kpisForArea } from "../selectors";
import { KpiTile } from "../components/KpiTile";
import { RagBadge } from "../components/RagBadge";
import type { Area as AreaId } from "../types";

export function AreasIndex() {
  const { doc } = useData();
  if (!doc) return null;
  const areas = areaSummaries(doc);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-ink">Areas of Focus</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {areas.map((a) => (
          <Link
            key={a.area}
            to={`/areas/${a.area}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand/40 hover:shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink">{a.label}</h3>
              <RagBadge status={a.status} size="sm" />
            </div>
            <p className="mt-1 text-xs text-muted">{a.impactMeasure}</p>
            <p className="mt-3 text-sm text-muted">{a.total} KPIs →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AreaDetail() {
  const { areaId } = useParams<{ areaId: AreaId }>();
  const { doc } = useData();
  if (!doc || !areaId) return null;
  const meta = doc.areas.find((a) => a.id === areaId);
  if (!meta) return <Link to="/areas" className="text-brand">← Areas</Link>;

  const kpis = kpisForArea(doc, areaId);
  // Hero = the lagging outcome (PRD §5.2); contributors = leading indicators.
  const hero = kpis.find((k) => k.leadLag === "lagging") ?? kpis[0];
  const leading = kpis.filter((k) => k.id !== hero?.id);

  // Group leading indicators by contributing team.
  const byTeam = new Map<string, typeof leading>();
  for (const k of leading) {
    const arr = byTeam.get(k.ownerTeam) ?? [];
    arr.push(k);
    byTeam.set(k.ownerTeam, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/areas" className="text-sm text-brand hover:underline">
          ← Areas of Focus
        </Link>
        <h2 className="mt-1 text-xl font-bold text-ink">{meta.label}</h2>
        <p className="text-sm text-muted">{meta.impactMeasure}</p>
      </div>

      {hero && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Lagging outcome
          </h3>
          <div className="md:max-w-md">
            <KpiTile kpi={hero} />
          </div>
        </div>
      )}

      {[...byTeam.entries()].map(([team, teamKpis]) => (
        <div key={team}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Leading indicators · {team}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teamKpis.map((k) => (
              <KpiTile key={k.id} kpi={k} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
