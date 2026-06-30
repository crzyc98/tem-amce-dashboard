import type { KPI } from "../types";
import { formatValue } from "../rag";
import { RagBadge } from "./RagBadge";
import {
  AreaChip,
  OwnershipChip,
  SharedBadge,
  TrendArrow,
  VerifiedBadge,
} from "./Badges";
import { TrendChart } from "./TrendChart";

// A single KPI card: value, target, RAG, traceability (area / owner / ownership)
// and the verified + shared badges. This is the workhorse tile used across the
// area and team pages.
export function KpiTile({ kpi, showOwner = true }: { kpi: KPI; showOwner?: boolean }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="font-mono">{kpi.id}</span>
            <TrendArrow trend={kpi.qoqTrend} />
          </div>
          <h3 className="mt-0.5 line-clamp-2 font-semibold leading-snug text-ink" title={kpi.name}>
            {kpi.name}
          </h3>
        </div>
        <RagBadge status={kpi.status} size="sm" />
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div>
          <div className="text-2xl font-bold leading-none text-ink">
            {formatValue(kpi.value, kpi.unit)}
          </div>
          <div className="mt-1 text-xs text-muted">
            Target {formatValue(kpi.target, kpi.unit)}
            {kpi.vsGoalPct != null && (
              <span className="ml-1">· {kpi.vsGoalPct}% to goal</span>
            )}
          </div>
        </div>
        <div className="ml-auto w-24">
          <TrendChart kpi={kpi} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <AreaChip area={kpi.area} />
        {showOwner && (
          <span className="rounded bg-brand/10 px-1.5 py-0.5 text-xs text-brand-dark">
            {kpi.ownerTeam}
          </span>
        )}
        <OwnershipChip ownership={kpi.ownership} />
        {kpi.isShared && <SharedBadge />}
        <VerifiedBadge verified={kpi.verified} />
      </div>

      {kpi.note && <p className="mt-2 text-xs italic text-muted">{kpi.note}</p>}
    </div>
  );
}
