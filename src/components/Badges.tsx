import type { KPI } from "../types";
import { AREA_LABELS } from "../types";
import { OWNERSHIP_LABEL } from "../rag";

// "Unverified — transcribed" badge. Shown until each number is reconciled to
// source (PRD §6.3): verified === false surfaces this.
export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (verified) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800"
      title="Value transcribed from the scorecard and not yet reconciled to source"
    >
      ⚠ Unverified
    </span>
  );
}

export function SharedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-indigo-300 bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-800"
      title="Shared AMCE KPI — reported once with one accountable owner"
    >
      ⇄ Shared
    </span>
  );
}

export function AreaChip({ area }: { area: KPI["area"] }) {
  return (
    <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-muted">
      {AREA_LABELS[area]}
    </span>
  );
}

export function OwnershipChip({ ownership }: { ownership: KPI["ownership"] }) {
  return (
    <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-muted">
      {OWNERSHIP_LABEL[ownership]}
    </span>
  );
}

export function TrendArrow({ trend }: { trend?: KPI["qoqTrend"] }) {
  if (!trend) return null;
  const map = {
    up: { icon: "▲", cls: "text-rag-green", label: "Up vs prior" },
    down: { icon: "▼", cls: "text-rag-red", label: "Down vs prior" },
    flat: { icon: "▬", cls: "text-rag-na", label: "Flat vs prior" },
  } as const;
  const m = map[trend];
  return (
    <span className={`text-xs ${m.cls}`} title={m.label} aria-label={m.label}>
      {m.icon}
    </span>
  );
}
