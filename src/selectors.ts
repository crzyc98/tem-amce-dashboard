import type { Area, KPI, PeriodDocument, RAG } from "./types";

// Helpers that derive views from a PeriodDocument. These are pure read-only
// transforms over the data contract — no business logic that belongs in the
// pipeline (e.g. RAG itself is precomputed upstream).

const RAG_RANK: Record<RAG, number> = { red: 3, amber: 2, green: 1, na: 0 };

// Roll a set of KPIs up to a single status: the worst (most urgent) wins.
export function rollupStatus(kpis: KPI[]): RAG {
  let worst: RAG = "na";
  for (const k of kpis) {
    if (RAG_RANK[k.status] > RAG_RANK[worst]) worst = k.status;
  }
  return worst;
}

export function kpisForArea(doc: PeriodDocument, area: Area): KPI[] {
  // Scorecard + all team KPIs in this area. De-duplicate shared KPIs by id so a
  // shared metric is never counted twice (the report-once rule).
  const all = [...doc.scorecard, ...doc.teams.flatMap((t) => t.kpis)];
  const seen = new Set<string>();
  const out: KPI[] = [];
  for (const k of all) {
    if (k.area !== area || seen.has(k.id)) continue;
    seen.add(k.id);
    out.push(k);
  }
  return out;
}

export interface AreaSummary {
  area: Area;
  label: string;
  impactMeasure: string;
  status: RAG;
  green: number;
  amber: number;
  red: number;
  total: number;
}

export function areaSummaries(doc: PeriodDocument): AreaSummary[] {
  return doc.areas.map((a) => {
    const kpis = kpisForArea(doc, a.id);
    return {
      area: a.id,
      label: a.label,
      impactMeasure: a.impactMeasure,
      status: rollupStatus(kpis),
      green: kpis.filter((k) => k.status === "green").length,
      amber: kpis.filter((k) => k.status === "amber").length,
      red: kpis.filter((k) => k.status === "red").length,
      total: kpis.length,
    };
  });
}

export function countByStatus(kpis: KPI[]): Record<RAG, number> {
  return {
    green: kpis.filter((k) => k.status === "green").length,
    amber: kpis.filter((k) => k.status === "amber").length,
    red: kpis.filter((k) => k.status === "red").length,
    na: kpis.filter((k) => k.status === "na").length,
  };
}
