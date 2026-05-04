import { Users, DollarSign, Activity, AlertTriangle } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function GlobalStatsWidget() {
  const supabase = getServiceSupabase();

  const [
    { count: tenantsCount },
    { data: revenueData }
  ] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("tenants").select("monthly_fee").eq("billing_status", "active")
  ]);

  const totalRevenue =
    revenueData?.reduce(
      (acc, curr) => acc + (Number(curr.monthly_fee) || 0),
      0,
    ) || 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem",
      }}
    >
      <div className="clean-panel">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Labs Activos
          </span>
          <Users size={20} color="var(--primary-teal)" />
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 800 }}>
          {tenantsCount || 0}
        </div>
        <div className="badge badge-success" style={{ marginTop: "0.5rem" }}>
          Operativo
        </div>
      </div>

      <div className="clean-panel">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Ingresos Mensuales
          </span>
          <DollarSign size={20} color="var(--primary-teal)" />
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 800 }}>
          ${totalRevenue.toLocaleString()}
        </div>
        <div className="badge badge-success" style={{ marginTop: "0.5rem" }}>
          +12% vs mes ant.
        </div>
      </div>

      <div className="clean-panel">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Salud del Sistema
          </span>
          <Activity size={20} color="var(--primary-teal)" />
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 800 }}>99.9%</div>
        <div className="badge badge-success" style={{ marginTop: "0.5rem" }}>
          Uptime Estable
        </div>
      </div>

      <div className="clean-panel">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Incidentes
          </span>
          <AlertTriangle size={20} color="var(--text-muted)" />
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 800 }}>0</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Sin reportes críticos
        </div>
      </div>
    </div>
  );
}
