import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KPI } from "../types";

// Small trend line for a KPI's short history. Falls back to nothing if there
// aren't at least two points.
export function TrendChart({ kpi, height = 56 }: { kpi: KPI; height?: number }) {
  const data = kpi.trend ?? [];
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <XAxis dataKey="period" hide />
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("en-US")}
          labelStyle={{ fontSize: 12 }}
          contentStyle={{ fontSize: 12, padding: "4px 8px" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#368727"
          strokeWidth={2}
          dot={{ r: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
