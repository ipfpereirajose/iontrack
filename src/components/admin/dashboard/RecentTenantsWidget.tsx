import { Settings } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import Link from "next/link";

export default async function RecentTenantsWidget() {
  const supabase = getServiceSupabase();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <section style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Laboratorios bajo Gestión</h2>
        <Link href="/admin/tenants" style={{ fontSize: "0.875rem", color: "var(--primary-teal)", textDecoration: "none", fontWeight: 600 }}>
          Ver todos →
        </Link>
      </div>
      <div className="clean-panel" style={{ padding: "0", overflow: "hidden" }}>
        {!tenants || tenants.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <p>No hay laboratorios registrados en el sistema.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 800 }}>Laboratorio</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 800 }}>Slug</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 800 }}>Estatus</th>
                <th style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 800 }}>Tarifa</th>
                <th style={{ padding: "1rem", textAlign: "right", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 800 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{tenant.name}</td>
                  <td style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>{tenant.slug}</td>
                  <td style={{ padding: "1rem" }}>
                    <span className={tenant.billing_status === "active" ? "badge badge-success" : "badge badge-danger"}>
                      {tenant.billing_status === "active" ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 700 }}>
                    ${Number(tenant.monthly_fee).toLocaleString()}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <Link href={`/admin/tenants/${tenant.id}`} className="nav-link" style={{ display: "inline-flex", padding: "0.5rem", width: "auto", color: "var(--text-muted)" }}>
                      <Settings size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
