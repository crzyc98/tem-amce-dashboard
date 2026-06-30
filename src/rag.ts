import type { KPI, RAG, Unit } from "./types";

// RAG status is COMPUTED IN THE PIPELINE (PRD §6.2), not in the UI — so the
// deck, dashboard, and any export always agree. This helper exists so the
// pipeline (and tests) can compute it consistently; the UI reads the
// precomputed `status` field and only uses these for presentation.

export function ragFromVsGoal(vsGoalPct: number | undefined): RAG {
  if (vsGoalPct == null || Number.isNaN(vsGoalPct)) return "na";
  if (vsGoalPct >= 95) return "green";
  if (vsGoalPct >= 90) return "amber";
  return "red";
}

export const RAG_LABEL: Record<RAG, string> = {
  green: "On track",
  amber: "At risk",
  red: "Off track",
  na: "No data",
};

// Accessible: each status pairs an icon + label with color so RAG is never
// encoded by color alone (PRD §8, WCAG AA).
export const RAG_ICON: Record<RAG, string> = {
  green: "●",
  amber: "▲",
  red: "■",
  na: "–",
};

export const RAG_CLASSES: Record<RAG, string> = {
  green: "bg-rag-green/10 text-rag-green border-rag-green/30",
  amber: "bg-rag-amber/10 text-rag-amber border-rag-amber/30",
  red: "bg-rag-red/10 text-rag-red border-rag-red/30",
  na: "bg-rag-na/10 text-rag-na border-rag-na/30",
};

export function formatValue(value: number | string, unit: Unit): string {
  if (typeof value === "string") return value;
  switch (unit) {
    case "percent":
      return `${value}%`;
    case "currency":
      return formatCurrency(value);
    case "count":
      return value.toLocaleString("en-US");
    case "ratio":
      return `${value.toLocaleString("en-US")}x`;
    case "score":
      return value.toLocaleString("en-US");
    case "status":
      return String(value);
  }
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString("en-US")}`;
}

export const OWNERSHIP_LABEL: Record<KPI["ownership"], string> = {
  owned: "Owned",
  led_partner: "Led / partner-enabled",
  shared: "Shared AMCE",
  partner_owned: "Partner-owned",
};
