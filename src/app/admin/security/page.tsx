import {
  ShieldAlert,
  Lock,
  Globe,
  FileWarning,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { SecuritySentinel } from "@/lib/security_sentinel";

export const revalidate = 0;

export default async function CyberSecurityPage() {
  const threats = await SecuritySentinel.getRecentThreats(15);

  const stats = [
    { name: "Intentos Bloqueados", value: "142", icon: Lock, color: "#f87171" },
    { name: "IPs en Lista Negra", value: "12", icon: Globe, color: "#fbbf24" },
    {
      name: "Archivos Escaneados",
      value: "1,240",
      icon: ShieldCheck,
      color: "#34d399",
    },
    { name: "Integridad DB", value: "100%", icon: Activity, color: "#60a5fa" },
  ];

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              padding: "0.75rem",
              borderRadius: "12px",
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>
            Centinela de Ciberseguridad
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Monitoreo en tiempo real de amenazas, integridad de datos y accesos no
          autorizados.
        </p>
      </header>

      {/* STATS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="glass-panel"
            style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
          >
            <div
              style={{
                background: `${stat.color}15`,
                color: stat.color,
                padding: "1rem",
                borderRadius: "16px",
              }}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.name}
              </p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900 }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
      >
        {/* THREAT LOG */}
        <div
          className="glass-panel"
          style={{ padding: "0", overflow: "hidden" }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              Registro de Amenazas Recientes
            </h3>
            <span className="badge badge-success">Sistema Activo</span>
          </div>
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    Evento
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    Nivel
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    Origen (IP)
                  </th>
                  <th
                    style={{
                      padding: "1rem 1.5rem",
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {threats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No se han detectado amenazas críticas en las últimas 24
                      horas.
                    </td>
                  </tr>
                ) : (
                  threats.map((threat) => (
                    <tr
                      key={threat.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <FileWarning
                            size={16}
                            color={
                              threat.new_data?.threat_level === "critical"
                                ? "#ef4444"
                                : "#fbbf24"
                            }
                          />
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {threat.action.replace("SECURITY_", "")}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {threat.new_data?.details}
                        </p>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <span
                          className={`badge ${threat.new_data?.threat_level === "critical" ? "badge-danger" : "badge-warning"}`}
                        >
                          {threat.new_data?.threat_level}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "1.25rem 1.5rem",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        {threat.ip_address}
                      </td>
                      <td
                        style={{
                          padding: "1.25rem 1.5rem",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {new Date(threat.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECURITY SETTINGS / ACTIONS */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="glass-panel">
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                marginBottom: "1.25rem",
              }}
            >
              Estado de Blindaje
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.875rem" }}>
                  Escaneo de Archivos (Real-time)
                </span>
                <div
                  style={{
                    width: "40px",
                    height: "20px",
                    background: "var(--primary)",
                    borderRadius: "20px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "2px",
                      top: "2px",
                      width: "16px",
                      height: "16px",
                      background: "#000",
                      borderRadius: "50%",
                    }}
                  ></div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.875rem" }}>
                  Protección Brute-Force
                </span>
                <div
                  style={{
                    width: "40px",
                    height: "20px",
                    background: "var(--primary)",
                    borderRadius: "20px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "2px",
                      top: "2px",
                      width: "16px",
                      height: "16px",
                      background: "#000",
                      borderRadius: "50%",
                    }}
                  ></div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.875rem" }}>
                  Encriptación de Dosis
                </span>
                <div
                  style={{
                    width: "40px",
                    height: "20px",
                    background: "var(--primary)",
                    borderRadius: "20px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "2px",
                      top: "2px",
                      width: "16px",
                      height: "16px",
                      background: "#000",
                      borderRadius: "50%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "2rem",
                justifyContent: "center",
              }}
            >
              Reiniciar Protocolos de Seguridad
            </button>
          </div>

          <div
            className="glass-panel"
            style={{
              border: "1px solid rgba(234, 179, 8, 0.3)",
              background: "rgba(234, 179, 8, 0.05)",
            }}
          >
            <div
              style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}
            >
              <AlertTriangle color="#fbbf24" size={20} />
              <h4 style={{ color: "#fbbf24", fontWeight: 800 }}>
                Recomendación
              </h4>
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              Se detectó un patrón de acceso inusual desde una subred en China.
              Se recomienda habilitar el bloqueo por región (Geo-Fencing) para
              el módulo de facturación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
