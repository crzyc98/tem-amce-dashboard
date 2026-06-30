import type { KPI } from "../types";
import { formatValue } from "../rag";
import { RagBadge } from "./RagBadge";
import { SharedBadge, TrendArrow, VerifiedBadge } from "./Badges";

// Mirrors the Q2 2026 scorecard layout (PRD §5.1): grouped by the four familiar
// categories, with Actual / Target / vs Goal / vs YoY / QoQ / RAG columns.
const CATEGORY_ORDER = [
  "Grow TEM's Business",
  "Client Retention",
  "Deepen Participant Engagement",
  "Execute on Key Initiatives",
];

export function ScorecardTable({ rows }: { rows: KPI[] }) {
  const groups = groupByCategory(rows);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-2 font-semibold">KPI</th>
            <th className="px-3 py-2 text-right font-semibold">Actual</th>
            <th className="px-3 py-2 text-right font-semibold">Target</th>
            <th className="px-3 py-2 text-right font-semibold">vs Goal</th>
            <th className="px-3 py-2 text-right font-semibold">vs YoY</th>
            <th className="px-3 py-2 text-center font-semibold">QoQ</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORY_ORDER.filter((c) => groups[c]?.length).map((category) => (
            <CategoryGroup key={category} category={category} rows={groups[category]} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryGroup({ category, rows }: { category: string; rows: KPI[] }) {
  return (
    <>
      <tr className="bg-brand/5">
        <td colSpan={7} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-dark">
          {category}
        </td>
      </tr>
      {rows.map((kpi) => (
        <tr key={kpi.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
          <td className="px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink">{kpi.name}</span>
              {kpi.isShared && <SharedBadge />}
              <VerifiedBadge verified={kpi.verified} />
            </div>
            <div className="text-xs text-muted">
              {kpi.ownerTeam}
              {kpi.contributors?.length ? ` · with ${kpi.contributors.join(", ")}` : ""}
            </div>
          </td>
          <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
            {formatValue(kpi.value, kpi.unit)}
          </td>
          <td className="px-3 py-2.5 text-right tabular-nums text-muted">
            {formatValue(kpi.target, kpi.unit)}
          </td>
          <td className="px-3 py-2.5 text-right tabular-nums">{pct(kpi.vsGoalPct)}</td>
          <td className="px-3 py-2.5 text-right tabular-nums">{pct(kpi.vsYoYPct)}</td>
          <td className="px-3 py-2.5 text-center">
            <TrendArrow trend={kpi.qoqTrend} />
          </td>
          <td className="px-3 py-2.5">
            <RagBadge status={kpi.status} size="sm" />
          </td>
        </tr>
      ))}
    </>
  );
}

function pct(v?: number): string {
  return v == null ? "—" : `${v}%`;
}

function groupByCategory(rows: KPI[]): Record<string, KPI[]> {
  const out: Record<string, KPI[]> = {};
  for (const r of rows) {
    const key = r.scorecardLine ?? "Execute on Key Initiatives";
    (out[key] ??= []).push(r);
  }
  return out;
}
