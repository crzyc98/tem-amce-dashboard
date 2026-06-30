import type { Manifest, PeriodDocument } from "./types";

// Runtime fetch (not build-time embed): the app fetches manifest.json then the
// selected period's JSON. This lets non-engineers refresh data by replacing a
// file, and lets users switch historical periods without a rebuild (PRD §4.2).

// BASE_URL respects Vite's `base`, so the app works from any CDN sub-path.
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

async function fetchJson<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${DATA_BASE}${path}`, opts);
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

// manifest.json is the only short-TTL file (cache-busting). Period files are
// immutable and long-cached, so we skip the cache only for the manifest.
export function loadManifest(): Promise<Manifest> {
  return fetchJson<Manifest>("manifest.json", { cache: "no-cache" });
}

export function loadPeriod(period: string): Promise<PeriodDocument> {
  return fetchJson<PeriodDocument>(`${period}.json`);
}
