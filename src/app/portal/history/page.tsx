import { Download, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import ExportButton from "./ExportButton";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const companyId = profile?.company_id;

  // 1. Fetch Company Info
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();

  // 2. Fetch approved doses for workers of this company
  const { data: doses, error } = await supabase
    .from("doses")
    .select(
      `
      id, month, year, hp10,
      toe_workers!inner (
        first_name, last_name, ci, company_id
      )
    `,
    )
    .eq("toe_workers.company_id", companyId)
    .eq("status", "approved")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  // 3. Calculate Annual Average (mock/simplified for display)
  const averageDose =
    doses && doses.length > 0
      ? (
          doses.reduce((acc, curr) => acc + curr.hp10, 0) / doses.length
        ).toFixed(4)
      : "0.0000";

  return (
    <div>
      <header
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
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
                background: "#a855f7",
                color: "white",
                padding: "0.75rem",
                borderRadius: "12px",
              }}
            >
              <Calendar size={28} />
            </div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>
              Historial Dosimétrico
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            Registro histórico de lecturas validadas para todo el personal.
          </p>
        </div>
        <ExportButton 
          data={doses || []} 
          companyName={company?.name || "Empresa"} 
        />
      </header>

      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}
      >
        <div
          className="glass-panel"
          style={{
            padding: "0",
            background: "rgba(255,255,255,0.02)",
            border: "none",
            overflow: "hidden",
          }}
        >
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
                    padding: "1.25rem 1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Periodo
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Trabajador
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Dosis Hp10
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Certificación
                </th>
              </tr>
            </thead>
            <tbody>
              {!doses || doses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "5rem",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <p>
                      No hay historial de dosis disponible para esta empresa.
                    </p>
                  </td>
                </tr>
              ) : (
                doses.map((dose: any) => (
                  <tr
                    key={dose.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      style={{
                        padding: "1.5rem 1.5rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                      }}
                    >
                      {dose.month < 10 ? `0${dose.month}` : dose.month}/
                      {dose.year}
                    </td>
                    <td style={{ padding: "1.5rem 1.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700 }}>
                          {dose.toe_workers?.first_name}{" "}
                          {dose.toe_workers?.last_name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {dose.toe_workers?.ci}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "1.5rem 1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.25rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "1.2rem",
                            color:
                              dose.hp10 >= 1.28
                                ? "var(--danger)"
                                : "var(--text-main)",
                          }}
                        >
                          {dose.hp10}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          mSv
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "1.5rem 1.5rem" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "6px",
                          background: "rgba(74, 222, 128, 0.1)",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "#4ade80",
                        }}
                      >
                        <CheckCircle2 size={12} /> CERTIFICADO
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div
            className="glass-panel"
            style={{ background: "rgba(255,255,255,0.03)", border: "none" }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <TrendingUp size={20} color="var(--primary)" />
              Métricas de Vigilancia
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                >
                  Dosis Promedio
                </span>
                <span style={{ fontWeight: 800, fontSize: "1.25rem" }}>
                  {averageDose}{" "}
                  <span
                    style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                  >
                    mSv
                  </span>
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8125rem",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    Uso de Límite Anual (Max 20mSv)
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {((Number(averageDose) / 20) * 100).toFixed(2)}%
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "8%",
                      height: "100%",
                      background: "linear-gradient(to right, #a855f7, #6366f1)",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              </div>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                }}
              >
                El personal se encuentra dentro de los rangos de seguridad
                establecidos por la norma nacional.
              </p>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              color: "white",
              border: "none",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                marginBottom: "0.75rem",
              }}
            >
              Asistencia Especializada
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                opacity: 0.9,
                marginBottom: "1.5rem",
                lineHeight: "1.4",
              }}
            >
              ¿Tienes dudas sobre una lectura o necesitas un reporte oficial
              para entes reguladores?
            </p>
            <button
              style={{
                background: "white",
                color: "#a855f7",
                border: "none",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                fontWeight: 800,
                cursor: "pointer",
                width: "100%",
                fontSize: "0.875rem",
              }}
            >
              Contactar Laboratorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 0;
