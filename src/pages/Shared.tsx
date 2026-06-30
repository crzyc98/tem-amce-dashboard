import { useData } from "../DataContext";
import { formatValue } from "../rag";
import { RagBadge } from "../components/RagBadge";
import { VerifiedBadge } from "../components/Badges";
import { AREA_LABELS } from "../types";

// The de-dup register (PRD §5.4): each shared metric appears ONCE, with one
// accountable owner and the contributing teams listed — so the "report shared
// metrics once" rule is visible and nothing is double-counted.
export function Shared() {
  const { doc } = useData();
  if (!doc) return null;
  const shared = doc.sharedKPIs;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink">Shared AMCE KPIs</h2>
        <p className="text-sm text-muted">
          The de-duplication register. Each shared metric is reported once with a
          single accountable owner; contributing teams show contribution, not a
          separate total.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-2 font-semibold">Shared KPI</th>
              <th className="px-3 py-2 font-semibold">Accountable owner</th>
              <th className="px-3 py-2 font-semibold">Contributors</th>
              <th className="px-3 py-2 font-semibold">Area</th>
              <th className="px-3 py-2 text-right font-semibold">Value</th>
              <th className="px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {shared.map((k) => (
              <tr key={k.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{k.name}</span>
                    <VerifiedBadge verified={k.verified} />
                  </div>
                  <span className="font-mono text-xs text-muted">{k.id}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 text-xs text-brand-dark">
                    {k.ownerTeam}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted">
                  {k.contributors?.join(", ") ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted">
                  {AREA_LABELS[k.area]}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {formatValue(k.value, k.unit)}
                </td>
                <td className="px-3 py-2.5">
                  <RagBadge status={k.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
