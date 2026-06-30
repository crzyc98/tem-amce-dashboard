import { NavLink, Outlet } from "react-router-dom";
import { useData } from "../DataContext";

const NAV = [
  { to: "/", label: "Executive Summary", end: true },
  { to: "/areas", label: "Areas of Focus" },
  { to: "/teams", label: "Teams" },
  { to: "/shared", label: "Shared KPIs" },
];

export function Layout() {
  const { manifest, period, setPeriod, doc } = useData();

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-ink">
              TEM <span className="text-brand">AMCE</span> Executive Dashboard
            </h1>
            <p className="text-xs text-muted">
              Analytics · Marketing · Communications · Events
            </p>
          </div>
          <div className="flex items-center gap-3">
            {doc && (
              <span className="hidden text-xs text-muted sm:inline">
                Generated {new Date(doc.generatedAt).toLocaleDateString()}
              </span>
            )}
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Period</span>
              <select
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm font-medium"
                value={period ?? ""}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {(manifest?.periods ?? []).map((p) => (
                  <option key={p} value={p}>
                    {p}
                    {p === manifest?.current ? " (current)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-2">
          <ul className="flex flex-wrap gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `inline-block border-b-2 px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "border-brand text-brand-dark"
                        : "border-transparent text-muted hover:text-ink"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted">
        Prototype · mock data conforming to the PRD data contract. RAG status is
        precomputed in the data file, not in the UI.
      </footer>
    </div>
  );
}
