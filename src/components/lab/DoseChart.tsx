"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

export default function DoseChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        No hay registros para este periodo.
      </div>
    );
  }

  return (
    <div style={{ height: "350px", width: "100%", marginTop: "1.5rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}
            unit=" mSv"
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 168, 181, 0.05)" }}
            contentStyle={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              color: "var(--text-main)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.value >= 1.66
                    ? "var(--state-danger)"
                    : entry.value >= 1.66 * 0.8
                      ? "var(--state-warning)"
                      : "var(--primary-teal)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
