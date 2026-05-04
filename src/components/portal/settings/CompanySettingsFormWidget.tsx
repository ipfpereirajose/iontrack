import { Building2, Save, User, Lock, Shield, History } from "lucide-react";
import { requestChangeAction } from "@/app/portal/settings/actions";
import { getServiceSupabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";

export default async function CompanySettingsFormWidget() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const serviceSupabase = getServiceSupabase();
  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  const company = profile?.companies;

  const { data: pendingRequests } = await serviceSupabase
    .from("change_requests")
    .select("*")
    .eq("entity_id", company?.id)
    .eq("status", "pending");

  return (
    <>
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="clean-panel" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--state-warning)", marginBottom: "2.5rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <History size={32} color="var(--state-warning)" />
          <div>
            <h4 style={{ fontWeight: 800, color: "var(--state-warning)" }}>Solicitud de Actualización Pendiente</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Usted tiene una solicitud de cambio de datos enviada. El SuperAdmin la revisará en breve.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
        {/* EDIT FORM */}
        <div className="clean-panel">
          <form action={requestChangeAction}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <Building2 size={20} color="var(--primary-teal)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Información de la Entidad</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div className="input-group">
                <label style={labelStyle}>Razón Social (Entidad)</label>
                <input name="name" defaultValue={company?.name} style={inputStyle} />
              </div>
              <div className="input-group">
                <label style={labelStyle}>RIF</label>
                <input name="tax_id" defaultValue={company?.tax_id} style={inputStyle} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Dirección Fiscal</label>
              <textarea name="address" defaultValue={company?.address} style={{ ...inputStyle, height: "80px", resize: "none" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
              <div className="input-group">
                <label style={labelStyle}>Teléfono Local</label>
                <input name="phone_local" defaultValue={company?.phone_local} style={inputStyle} />
              </div>
              <div className="input-group">
                <label style={labelStyle}>Teléfono Móvil</label>
                <input name="phone_mobile" defaultValue={company?.phone_mobile} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <User size={20} color="var(--primary-teal)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Oficial de Seguridad (OSR)</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div className="input-group">
                <label style={labelStyle}>Nombres del OSR</label>
                <input name="rep_first_name" defaultValue={company?.rep_first_name} style={inputStyle} />
              </div>
              <div className="input-group">
                <label style={labelStyle}>Apellidos del OSR</label>
                <input name="rep_last_name" defaultValue={company?.rep_last_name} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
              <div className="input-group">
                <label style={labelStyle}>Correo OSR</label>
                <input name="rep_email" type="email" defaultValue={company?.rep_email} style={inputStyle} />
              </div>
              <div className="input-group">
                <label style={labelStyle}>Teléfono OSR</label>
                <input name="rep_phone" defaultValue={company?.rep_phone} style={inputStyle} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "1rem" }}>
              <Save size={20} /> Solicitar Actualización de Datos
            </button>
          </form>
        </div>

        {/* SIDEBAR: SECURITY & NOTICES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section className="clean-panel">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Lock size={20} color="var(--state-warning)" />
              <h4 style={{ fontWeight: 800 }}>Seguridad</h4>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              Por motivos de seguridad, los cambios en la Razón Social, RIF o Dirección deben ser validados por la administración central.
            </p>
            <button className="btn" style={{ width: "100%", background: "#f1f5f9", fontSize: "0.85rem" }}>
              Cambiar Contraseña
            </button>
          </section>

          <div className="clean-panel" style={{ background: "var(--primary-dark)", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <Shield size={20} />
              <h4 style={{ fontWeight: 800 }}>Nivel de Confianza</h4>
            </div>
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              Su cuenta se encuentra verificada y vinculada a la infraestructura nacional de dosimetría.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const labelStyle = { display: "block", fontSize: "0.65rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" } as any;
const inputStyle = { width: "100%", padding: "0.75rem 1rem", background: "#f8fafc", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 600 } as any;
