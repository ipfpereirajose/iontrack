import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import UserForm from "./UserForm";
import SyncButton from "./SyncButton";
import ActiveAccountsWidget from "@/components/lab/users/ActiveAccountsWidget";
import { Suspense } from "react";

export default async function UsersManagementPage() {
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;
  if (!tenantId) return <div>No autorizado</div>;

  const adminSupabase = getServiceSupabase();

  const { data: companies = [] } = await adminSupabase
    .from("companies")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("name");

  const totalCompanies = (companies || []).length;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Gestión de Accesos
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          Controla quién puede acceder a los portales de tus empresas clientes.
        </p>
        <SyncButton tenantId={tenantId} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
        {/* LEFT: FORM */}
        <UserForm companies={companies || []} tenantId={tenantId} />

        {/* RIGHT: LIST */}
        <Suspense fallback={<div className="clean-panel">Cargando cuentas activas...</div>}>
          <ActiveAccountsWidget tenantId={tenantId} totalCompanies={totalCompanies} />
        </Suspense>
      </div>
    </div>
  );
}
