import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import { Users, Shield, Trash2, Mail, Building } from "lucide-react";
import UserForm from "./UserForm";
import SyncButton from "./SyncButton";
import { deleteCompanyUser } from "./actions";

export default async function UsersManagementPage() {
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;
  if (!tenantId) return <div>No autorizado</div>;

  const adminSupabase = getServiceSupabase();

  // 1. Fetch Companies for the form
  const { data: companies = [] } = await adminSupabase
    .from("companies")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("name");

  // 2. Fetch Existing Company Users
  const { data: users = [] } = await adminSupabase
    .from("profiles")
    .select("id, first_name, last_name, role, company_id, companies(name)")
    .eq("tenant_id", tenantId)
    .eq("role", "company_manager");

  const uniqueCompaniesWithAccess = new Set(users.map(u => u.company_id)).size;
  const totalCompanies = companies.length;
  const coveragePercent = totalCompanies > 0 ? (uniqueCompaniesWithAccess / totalCompanies) * 100 : 0;

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
        <div className="clean-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} color="var(--primary-teal)" />
              <h3 style={{ fontWeight: 800 }}>Cuentas Activas</h3>
            </div>
            
            <div style={{ 
              background: 'rgba(6, 182, 212, 0.1)', 
              padding: '0.5rem 1rem', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cobertura de Acceso</p>
                <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-teal)' }}>
                  {uniqueCompaniesWithAccess} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>/ {totalCompanies}</span>
                </p>
              </div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 900,
                color: 'var(--primary-teal)'
              }}>
                {Math.round(coveragePercent)}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {users?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '16px' }}>
                <Users size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600 }}>No hay cuentas de empresa creadas.</p>
              </div>
            ) : (
              users?.map(user => (
                <div key={user.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800 }}>{user.first_name} {user.last_name}</p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                         <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                           <Building size={12} /> {(user.companies as any)?.name}
                         </span>
                         <span style={{ fontSize: '0.7rem', color: 'var(--primary-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                           Gestor de Empresa
                         </span>
                      </div>
                    </div>
                  </div>
                  
                  <form action={async () => {
                    "use server";
                    await deleteCompanyUser(user.id);
                  }}>
                    <button type="submit" className="btn" style={{ padding: '0.5rem', color: 'var(--state-danger)' }}>
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
