import { CheckCircle, AlertTriangle } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function BillingDashboardWidget() {
  const supabase = getServiceSupabase();
  const { data: tenants } = await supabase.from("tenants").select("*");

  // Calculate stats
  const activeTenants = tenants?.filter(t => t.billing_status === "active") || [];
  const totalRevenue = activeTenants.reduce((acc, curr) => acc + (Number(curr.monthly_fee) || 0), 0);
  const pendingPayments = tenants?.filter(t => t.billing_status !== "active").length || 0;

  return (
    <>
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <span className="stat-label">Recaudación Mensual</span>
          <span className="stat-value">${totalRevenue.toLocaleString()}</span>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Mes en curso
          </span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-label">Pagos Pendientes</span>
          <span className="stat-value" style={{ color: "var(--accent)" }}>
            {pendingPayments}
          </span>
          <span style={{ fontSize: "0.875rem", color: "var(--accent)" }}>
            Laboratorios en mora
          </span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-label">Ingresos Anuales Proyectados</span>
          <span className="stat-value">${(totalRevenue * 12).toLocaleString()}</span>
          <span style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
            Año en curso
          </span>
        </div>
      </div>

      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
          Estado de Mensualidades
        </h2>
        <div className="glass-panel" style={{ padding: "0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Laboratorio</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Tarifa</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Estatus de Pago</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Próximo Vencimiento</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                  <td style={{ padding: "1.25rem 1.5rem", fontWeight: 600 }}>{tenant.name}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>${tenant.monthly_fee}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {tenant.billing_status === "active" ? (
                        <CheckCircle size={14} color="var(--secondary)" />
                      ) : (
                        <AlertTriangle size={14} color="var(--danger)" />
                      )}
                      <span className={`badge ${tenant.billing_status === "active" ? "badge-success" : "badge-warning"}`}>
                        {tenant.billing_status === "active" ? "Al día" : "En Mora"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)" }}>05/05/2026</td>
                  <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                    <button className="nav-link" style={{ display: "inline-flex", padding: "0.5rem 1rem", border: "1px solid var(--border-glass)", background: "none" }}>
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
