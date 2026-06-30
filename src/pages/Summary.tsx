import { Link } from "react-router-dom";
import { useData } from "../DataContext";
import { areaSummaries, countByStatus } from "../selectors";
import { ScorecardTable } from "../components/ScorecardTable";
import { RagBadge } from "../components/RagBadge";
import type { RAG } from "../types";

export function Summary() {
  const { doc } = useData();
  if (!doc) return null;
  const areas = areaSummaries(doc);
  const headline = doc.scorecard.filter((k) => k.tier === "core").slice(0, 4);
  const counts = countByStatus(doc.scorecard);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-ink">Executive Summary</h2>
          <p className="text-sm text-muted">
            {doc.period} scorecard · {counts.green} on track · {counts.amber} at
            risk · {counts.red} off track
          </p>
        </div>
      </div>

      {/* Three impact scorecards — one per area of focus (PRD §5.1). */}
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
            <div className="mt-3 flex gap-3 text-xs">
              <StatusCount status="green" n={a.green} />
              <StatusCount status="amber" n={a.amber} />
              <StatusCount status="red" n={a.red} />
            </div>
          </Link>
        ))}
      </div>

      {/* Headline KPI strip. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {headline.map((k) => (
          <div key={k.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="text-xs text-muted">{k.name}</div>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-xl font-bold tabular-nums">
                {typeof k.value === "number" ? k.value.toLocaleString() : k.value}
                {k.unit === "percent" ? "%" : ""}
              </span>
              <RagBadge status={k.status} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* What changed narrative. */}
      {doc.narrative && (
        <div className="rounded-lg border-l-4 border-brand bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-ink">What changed this period</h3>
          <p className="mt-1 text-sm text-muted">{doc.narrative}</p>
        </div>
      )}

      {/* Full scorecard table. */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Q{doc.period.split("-Q")[1]} Scorecard
        </h3>
        <ScorecardTable rows={doc.scorecard} />
      </div>
    </div>
  );
}

function StatusCount({ status, n }: { status: RAG; n: number }) {
  const dot = {
    green: "bg-rag-green",
    amber: "bg-rag-amber",
    red: "bg-rag-red",
    na: "bg-rag-na",
  }[status];
  return (
    <span className="inline-flex items-center gap-1 text-muted">
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {n}
    </span>
  );
}
