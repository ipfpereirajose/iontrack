import {
  ShieldCheck,
  BarChart3,
  UserCheck,
  Server,
  ArrowRight,
  Zap,
  LayoutDashboard,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";

export default async function LandingHUB() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminSupabase = getServiceSupabase();

  let dashboardUrl = null;
  if (user) {
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "superadmin") dashboardUrl = "/admin";
    else if (["lab_admin", "lab_tech"].includes(profile?.role))
      dashboardUrl = "/lab";
    else if (["company_manager", "toe"].includes(profile?.role))
      dashboardUrl = "/portal";
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="hero-gradient"></div>

      {/* Navbar */}
      <nav style={{ padding: "2rem 0", zIndex: 10 }}>
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                background: "var(--primary)",
                padding: "0.5rem",
                borderRadius: "10px",
                color: "#000",
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              ION<span className="text-gradient">TRACK</span>
            </span>
          </div>
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            SaaS v1.0 • Multi-Tenant
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "4rem 0",
        }}
      >
        <div className="container">
          <div
            style={{
              textAlign: "center",
              marginBottom: "5rem",
              position: "relative",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(6, 182, 212, 0.1)",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--primary)",
                marginBottom: "1.5rem",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                animation: "fadeInUp 0.6s ease-out",
              }}
            >
              <Zap size={14} />
              SISTEMA DE GESTIÓN DOSIMÉTRICA NACIONAL
            </div>
            <h1
              style={{
                fontSize: "4.5rem",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "1.5rem",
                letterSpacing: "-0.05em",
                animation: "fadeInUp 0.8s ease-out",
              }}
            >
              Seleccione su <br />
              <span className="text-gradient">Puerta de Enlace</span>
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                maxWidth: "650px",
                margin: "0 auto",
                fontSize: "1.25rem",
                lineHeight: 1.6,
                marginBottom: "3rem",
                animation: "fadeInUp 1s ease-out",
              }}
            >
              Plataforma modular para la trazabilidad total de la exposición
              radiológica ocupacional bajo estándares internacionales.
            </p>

            {dashboardUrl && (
              <div style={{ animation: "fadeInUp 1.2s ease-out" }}>
                <Link
                  href={dashboardUrl}
                  className="btn btn-primary"
                  style={{
                    padding: "1.25rem 3rem",
                    fontSize: "1.1rem",
                    borderRadius: "14px",
                    boxShadow: "0 10px 25px rgba(0, 168, 181, 0.25)",
                  }}
                >
                  <LayoutDashboard size={22} />
                  Continuar a mi Panel de Control
                  <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </div>

          <div
            className="hub-grid"
            style={{ animation: "fadeInUp 1.4s ease-out" }}
          >
            {/* Lab Module Card */}
            <Link
              href="/lab/login"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="hub-card">
                <div className="hub-icon">
                  <BarChart3 size={32} />
                </div>
                <h2 className="hub-title">Laboratorio</h2>
                <p className="hub-description">
                  Gestión técnica de dosis, validación de lecturas del Agente
                  Local y certificación de reportes oficiales.
                </p>
                <div
                  className="btn"
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    width: "100%",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                >
                  Ingresar al Módulo
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* B2B Portal Card */}
            <Link
              href="/portal/login"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="hub-card">
                <div
                  className="hub-icon"
                  style={{
                    color: "#a855f7",
                    background: "rgba(168, 85, 247, 0.1)",
                  }}
                >
                  <UserCheck size={32} />
                </div>
                <h2 className="hub-title">Empresas (B2B)</h2>
                <p className="hub-description">
                  Portal de vigilancia para oficiales de seguridad radiológica y
                  consulta de historial de trabajadores.
                </p>
                <div
                  className="btn"
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    width: "100%",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                >
                  Acceso Corporativo
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* SuperAdmin Card */}
            <Link
              href="/admin/login"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="hub-card">
                <div
                  className="hub-icon"
                  style={{
                    color: "#f59e0b",
                    background: "rgba(245, 158, 11, 0.1)",
                  }}
                >
                  <Server size={32} />
                </div>
                <h2 className="hub-title">Infraestructura</h2>
                <p className="hub-description">
                  Control administrativo global, gestión de contratos SaaS,
                  auditoría de seguridad y mapa de red nacional.
                </p>
                <div
                  className="btn"
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    width: "100%",
                    justifyContent: "center",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                >
                  Administración Central
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* TOE Portal Card */}
            <Link
              href="/toe-portal"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="hub-card">
                <div
                  className="hub-icon"
                  style={{
                    color: "var(--primary-teal)",
                    background: "rgba(0, 168, 181, 0.1)",
                  }}
                >
                  <Activity size={32} />
                </div>
                <h2 className="hub-title">Trabajadores (TOE)</h2>
                <p className="hub-description">
                  Consulta rápida de dosis mensual e historial acumulado (Dosis Vida) mediante identidad y verificación.
                </p>
                <div
                  className="btn"
                  style={{
                    background: "rgba(0, 168, 181, 0.05)",
                    width: "100%",
                    justifyContent: "center",
                    border: "1px solid var(--primary-teal)",
                    color: "var(--primary-teal)",
                    borderRadius: "12px",
                    fontWeight: 800,
                  }}
                >
                  Consultar mis Dosis
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .hub-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 2rem;
              margin-top: 3rem;
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `,
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "3rem 0",
          borderTop: "1px solid var(--border)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            © 2026 I.O.N.T.R.A.C.K. • Seguridad Radiológica Avanzada
          </div>
          <div style={{ display: "flex", gap: "2rem", fontSize: "0.8125rem" }}>
            <Link
              href="#"
              style={{ color: "var(--text-muted)", textDecoration: "none" }}
            >
              Privacidad
            </Link>
            <Link
              href="#"
              style={{ color: "var(--text-muted)", textDecoration: "none" }}
            >
              Términos
            </Link>
            <Link
              href="#"
              style={{ color: "var(--text-muted)", textDecoration: "none" }}
            >
              Soporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
