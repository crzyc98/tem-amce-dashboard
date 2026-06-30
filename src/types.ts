// The data contract. Mirrors PRD §6. The prototype's mock JSON and the
// production pipeline output both conform to these types — the UI never
// changes when the data source changes.

export type RAG = "green" | "amber" | "red" | "na";

export type Area =
  | "growth_retention"
  | "participant_engagement"
  | "scale_resiliency";

export type LeadLag = "leading" | "lagging";

export type Ownership = "owned" | "led_partner" | "shared" | "partner_owned";

export type Unit =
  | "percent"
  | "currency"
  | "count"
  | "ratio"
  | "score"
  | "status";

export interface KPI {
  id: string; // "TEM-01"
  name: string; // "HC/HE Market Share"
  area: Area;
  scorecardLine?: string; // "Grow TEM's Business"
  ownerTeam: string; // "Analytics" | "B2C Marketing" | ...
  ownership: Ownership;
  leadLag: LeadLag;
  tier: "core" | "strategic" | "pilot";
  unit: Unit;
  value: number | string;
  target: number | string;
  vsGoalPct?: number; // 100 = on target
  vsYoYPct?: number;
  status: RAG; // precomputed in the pipeline
  priorPeriodValue?: number | string;
  qoqTrend?: "up" | "down" | "flat";
  priorYTD?: number | string;
  // Optional short trend series (oldest → newest) for sparkline/trend charts.
  trend?: { period: string; value: number }[];
  isShared?: boolean;
  contributors?: string[]; // teams contributing to a shared KPI
  source?: string; // system of record
  refreshCadence?: "monthly" | "quarterly";
  verified?: boolean; // false until reconciled to source
  note?: string;
}

export interface AreaMeta {
  id: Area;
  label: string;
  impactMeasure: string;
}

export interface Team {
  id: string;
  label: string;
  lead: string;
  kpis: KPI[];
}

export interface PeriodDocument {
  period: string; // "2026-Q2"
  generatedAt: string; // ISO timestamp
  areas: AreaMeta[];
  scorecard: KPI[]; // executive scorecard lines
  teams: Team[];
  sharedKPIs: KPI[]; // the de-dup register
  narrative?: string; // "what changed this period"
}

export interface Manifest {
  current: string; // "2026-Q2"
  periods: string[]; // ["2026-Q1","2026-Q2", ...]
  schemaVersion: string; // "1.0"
}

export const AREA_LABELS: Record<Area, string> = {
  growth_retention: "Growth & Retention",
  participant_engagement: "Participant Engagement",
  scale_resiliency: "Scale & Resiliency",
};
