#!/usr/bin/env node
// Validate the data files against the PRD data contract BEFORE publishing.
//
// This is the guardrail that makes "refresh by replacing a JSON file" safe:
// run it on every edit so a transcription slip can't reach leadership. It is
// zero-dependency (plain Node) so it runs anywhere — laptop, CI, or the
// monthly pipeline's final step.
//
//   node scripts/validate-data.mjs          # validate all periods in manifest
//   node scripts/validate-data.mjs 2026-Q2  # validate one period
//
// Exits non-zero on any error so it can gate a publish/commit.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data");

const RAG = new Set(["green", "amber", "red", "na"]);
const AREAS = new Set(["growth_retention", "participant_engagement", "scale_resiliency"]);
const LEADLAG = new Set(["leading", "lagging"]);
const OWNERSHIP = new Set(["owned", "led_partner", "shared", "partner_owned"]);
const TIER = new Set(["core", "strategic", "pilot"]);
const UNIT = new Set(["percent", "currency", "count", "ratio", "score", "status"]);

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`✗ ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`⚠ ${where}: ${msg}`);

// RAG rule from PRD §6.2 — recomputed here so the published status can never
// silently disagree with vsGoalPct.
function expectedRag(vsGoalPct) {
  if (vsGoalPct == null || Number.isNaN(vsGoalPct)) return "na";
  if (vsGoalPct >= 95) return "green";
  if (vsGoalPct >= 90) return "amber";
  return "red";
}

function validateKpi(kpi, where) {
  for (const f of ["id", "name", "area", "ownerTeam", "ownership", "leadLag", "tier", "unit", "value", "target", "status"]) {
    if (kpi[f] === undefined) err(where, `missing required field "${f}"`);
  }
  if (kpi.area && !AREAS.has(kpi.area)) err(where, `invalid area "${kpi.area}"`);
  if (kpi.status && !RAG.has(kpi.status)) err(where, `invalid status "${kpi.status}"`);
  if (kpi.leadLag && !LEADLAG.has(kpi.leadLag)) err(where, `invalid leadLag "${kpi.leadLag}"`);
  if (kpi.ownership && !OWNERSHIP.has(kpi.ownership)) err(where, `invalid ownership "${kpi.ownership}"`);
  if (kpi.tier && !TIER.has(kpi.tier)) err(where, `invalid tier "${kpi.tier}"`);
  if (kpi.unit && !UNIT.has(kpi.unit)) err(where, `invalid unit "${kpi.unit}"`);

  // RAG must match vsGoalPct (the single source of truth for status).
  if (kpi.vsGoalPct != null && kpi.status) {
    const exp = expectedRag(kpi.vsGoalPct);
    if (exp !== kpi.status) {
      err(where, `status "${kpi.status}" disagrees with vsGoalPct ${kpi.vsGoalPct} (expected "${exp}")`);
    }
  }
  if (kpi.isShared && !(kpi.contributors?.length > 1)) {
    warn(where, `isShared but has fewer than 2 contributors`);
  }
  if (kpi.verified === false) {
    warn(where, `unverified — will show the "Unverified" badge until reconciled`);
  }
}

async function validatePeriod(period) {
  const path = join(DATA_DIR, `${period}.json`);
  let doc;
  try {
    doc = JSON.parse(await readFile(path, "utf8"));
  } catch (e) {
    err(period, `cannot read/parse ${period}.json — ${e.message}`);
    return;
  }

  if (doc.period !== period) err(period, `"period" field is "${doc.period}", file is ${period}.json`);
  if (!Array.isArray(doc.areas) || doc.areas.length !== 3) err(period, `expected 3 areas`);
  for (const arr of ["scorecard", "teams", "sharedKPIs"]) {
    if (!Array.isArray(doc[arr])) err(period, `"${arr}" must be an array`);
  }

  const allKpis = [
    ...(doc.scorecard ?? []).map((k) => [k, `${period} scorecard ${k.id}`]),
    ...(doc.teams ?? []).flatMap((t) => (t.kpis ?? []).map((k) => [k, `${period} team:${t.id} ${k.id}`])),
    ...(doc.sharedKPIs ?? []).map((k) => [k, `${period} shared ${k.id}`]),
  ];
  for (const [kpi, where] of allKpis) validateKpi(kpi, where);

  // The report-once rule: a KPI id that appears in more than one place must be
  // identical everywhere (same value/status), so it's never double-counted with
  // conflicting numbers.
  const byId = new Map();
  for (const [kpi, where] of allKpis) {
    const seen = byId.get(kpi.id);
    if (seen && (seen.kpi.value !== kpi.value || seen.kpi.status !== kpi.status)) {
      err(where, `id ${kpi.id} has different value/status than ${seen.where} — shared KPIs must match`);
    }
    if (!seen) byId.set(kpi.id, { kpi, where });
  }

  // Every shared KPI should be registered in sharedKPIs (the de-dup register).
  const sharedIds = new Set((doc.sharedKPIs ?? []).map((k) => k.id));
  for (const [kpi, where] of allKpis) {
    if (kpi.isShared && !sharedIds.has(kpi.id)) {
      warn(where, `isShared but not listed in sharedKPIs register`);
    }
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(join(DATA_DIR, "manifest.json"), "utf8"));
  if (!manifest.periods?.includes(manifest.current)) {
    err("manifest", `current "${manifest.current}" not in periods [${manifest.periods}]`);
  }
  const requested = process.argv[2];
  const periods = requested ? [requested] : manifest.periods;
  for (const p of periods) {
    if (!manifest.periods.includes(p)) warn("manifest", `validating ${p} which is not in manifest.periods`);
    await validatePeriod(p);
  }

  for (const w of warnings) console.warn(w);
  if (errors.length) {
    for (const e of errors) console.error(e);
    console.error(`\n✗ ${errors.length} error(s) — fix before publishing.`);
    process.exit(1);
  }
  console.log(`✓ Data valid (${periods.join(", ")})${warnings.length ? ` — ${warnings.length} warning(s)` : ""}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
