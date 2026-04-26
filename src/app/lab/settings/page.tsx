import {
  Settings,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  History,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import ChangeRequestForm from "./ChangeRequestForm";
import PasswordResetForm from "./PasswordResetForm";

export default async function LabSettingsPage() {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) return null;

  const supabase = getServiceSupabase();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  const { data: pendingRequests } = await supabase
    .from("change_requests")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .eq("status", "pending");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Configuración del Laboratorio
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Gestione la identidad de su institución y las credenciales de acceso.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "2rem",
        }}
      >
        {/* SECTION: IDENTIDAD Y CONTACTO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section className="clean-panel">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "1rem",
              }}
            >
              <Building2 size={24} color="var(--primary-teal)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                Información Institucional
              </h2>
            </div>

            {pendingRequests && pendingRequests.length > 0 && (
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.05)",
                  border: "1px solid var(--state-warning)",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <History size={18} color="var(--state-warning)" />
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--state-warning)",
                    }}
                  >
                    Solicitud de cambio pendiente
                  </p>
                  <p
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Tiene una solicitud enviada que está siendo revisada por el
                    SuperAdmin.
                  </p>
                </div>
              </div>
            )}

            <ChangeRequestForm
              tenant={tenant}
              isPending={!!(pendingRequests && pendingRequests.length > 0)}
            />
          </section>

          <section className="clean-panel">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "1rem",
              }}
            >
              <User size={24} color="var(--primary-teal)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                Representante Legal
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div>
                <label style={labelStyle}>Nombre</label>
                <p style={valueStyle}>
                  {tenant.rep_first_name} {tenant.rep_last_name}
                </p>
              </div>
              <div>
                <label style={labelStyle}>Cédula / ID</label>
                <p style={valueStyle}>{tenant.rep_ci}</p>
              </div>
              <div>
                <label style={labelStyle}>Email de Contacto</label>
                <p style={valueStyle}>{tenant.rep_email}</p>
              </div>
              <div>
                <label style={labelStyle}>Teléfono Móvil</label>
                <p style={valueStyle}>{tenant.rep_phone}</p>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION: SEGURIDAD */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section className="clean-panel">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "1rem",
              }}
            >
              <Lock size={24} color="var(--primary-teal)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                Seguridad
              </h2>
            </div>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "1.5rem",
              }}
            >
              Puede actualizar su contraseña de acceso directamente. Se le
              cerrará la sesión después del cambio.
            </p>
            <PasswordResetForm />
          </section>

          <div
            className="clean-panel"
            style={{
              background: "var(--primary-dark)",
              color: "white",
              border: "none",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
              }}
            >
              Ayuda y Soporte
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                opacity: 0.8,
                marginBottom: "1.5rem",
              }}
            >
              Si necesita realizar cambios críticos no permitidos en esta
              interfaz, contacte directamente con el SuperAdmin nacional.
            </p>
            <a
              href="mailto:soporte@iontrack.ve"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 800,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: "0.25rem",
} as any;
const valueStyle = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--text-main)",
} as any;
