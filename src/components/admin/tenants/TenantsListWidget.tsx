import { Shield, Settings } from "lucide-react";
import Link from "next/link";
import ResetPasswordButton from "@/components/admin/ResetPasswordButton";
import { getServiceSupabase } from "@/lib/supabase";

export default async function TenantsListWidget() {
  const supabase = getServiceSupabase();
  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="badge badge-danger" style={{ width: "100%", padding: "1rem", marginBottom: "2rem", borderRadius: "12px" }}>
        Error al cargar laboratorios: {error.message}
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: "0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Nombre del Laboratorio</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Contacto / Email</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Estatus</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>Tarifa</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {!tenants || tenants.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No hay laboratorios registrados todavía.
              </td>
            </tr>
          ) : (
            tenants.map((tenant) => (
              <tr key={tenant.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="glass-panel" style={{ width: "32px", height: "32px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "rgba(255,255,255,0.05)" }}>
                      <Shield size={16} color="var(--primary)" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{tenant.name}</span>
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{tenant.email}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {tenant.rep_first_name} {tenant.rep_last_name}
                  </div>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  <span className={`badge ${tenant.billing_status === "active" ? "badge-success" : "badge-danger"}`}>
                    {tenant.billing_status}
                  </span>
                </td>
                <td style={{ padding: "1.25rem 1.5rem" }}>
                  ${tenant.monthly_fee}/mes
                </td>
                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <ResetPasswordButton email={tenant.email} />
                    <Link href={`/admin/tenants/${tenant.id}`} className="nav-link" style={{ display: "inline-flex", padding: "0.5rem", width: "auto" }}>
                      <Settings size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
