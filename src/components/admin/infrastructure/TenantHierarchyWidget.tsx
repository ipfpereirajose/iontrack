import { getServiceSupabase } from "@/lib/supabase";
import TenantGroup from "@/components/admin/TenantGroup";

export default async function TenantHierarchyWidget() {
  const supabase = getServiceSupabase();

  const { data: tenants } = await supabase
    .from("tenants")
    .select(
      `
      id, name, billing_status,
      companies (
        id, name, tax_id,
        toe_workers (count)
      )
    `,
    )
    .order("name");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {tenants?.map((tenant) => (
        <TenantGroup key={tenant.id} tenant={tenant} />
      ))}
      {!tenants || tenants.length === 0 ? (
        <div className="clean-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          No hay infraestructura registrada todavía.
        </div>
      ) : null}
    </div>
  );
}
