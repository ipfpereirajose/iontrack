"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  name: string;
  approved?: number;
  pending?: number;
  projected?: number;
  value?: number; // Fallback for old usage
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

  // Determine if we are using the multi-series format or the legacy format
  const isMultiSeries = data.some(d => d.approved !== undefined || d.pending !== undefined);

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
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
          />
          
          {isMultiSeries ? (
            <>
              <Bar dataKey="approved" name="Aprobado" stackId="a" fill="var(--primary-teal)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" name="Pendiente" stackId="a" fill="var(--state-warning)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="projected" name="Proyectado" stackId="a" fill="rgba(0, 168, 181, 0.2)" stroke="var(--primary-teal)" strokeDasharray="4 4" radius={[6, 6, 0, 0]} />
            </>
          ) : (
            <Bar dataKey="value" name="Dosis Total" fill="var(--primary-teal)" radius={[6, 6, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
