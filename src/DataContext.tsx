import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadManifest, loadPeriod } from "./dataLoader";
import { useLocalStorage } from "./useLocalStorage";
import type { Manifest, PeriodDocument } from "./types";

interface DataState {
  manifest: Manifest | null;
  doc: PeriodDocument | null;
  period: string | null;
  setPeriod: (p: string) => void;
  loading: boolean;
  error: string | null;
}

const Ctx = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [doc, setDoc] = useState<PeriodDocument | null>(null);
  const [period, setPeriod] = useLocalStorage<string | null>(
    "amce.period",
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the manifest once, then resolve the period to show: a previously
  //    selected one (if still valid) or the manifest's current period.
  useEffect(() => {
    let cancelled = false;
    loadManifest()
      .then((m) => {
        if (cancelled) return;
        setManifest(m);
        setPeriod((prev) =>
          prev && m.periods.includes(prev) ? prev : m.current,
        );
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errMsg(e));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Whenever the resolved period changes, load that period's document.
  useEffect(() => {
    if (!period) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadPeriod(period)
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errMsg(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const value = useMemo<DataState>(
    () => ({
      manifest,
      doc,
      period,
      setPeriod: (p: string) => setPeriod(p),
      loading,
      error,
    }),
    [manifest, doc, period, loading, error, setPeriod],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
