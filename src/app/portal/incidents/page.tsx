"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { closeIncidentAction } from "./actions";

export default function B2BIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    setLoading(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .single();
    if (!profile?.company_id) return;

    const { data } = await supabase
      .from("incidents")
      .select(
        `
        *,
        toe_workers (first_name, last_name, ci),
        doses (hp10, month, year)
      `,
      )
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    setIncidents(data || []);
    setLoading(false);
  }

  const handleCloseIncident = async (id: string) => {
    setSubmitting(true);
    try {
      await closeIncidentAction(id, correctiveAction);
      setCorrectiveAction("");
      setSelectedIncident(null);
      await fetchIncidents();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <ShieldAlert size={28} color="var(--state-danger)" />
          Gestión de Incidencias Radiológicas
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Módulo de cumplimiento normativo y cierre de ciclo (Write-back).
        </p>
      </header>

      {loading ? (
        <div style={{ color: "var(--text-main)" }}>Cargando incidencias...</div>
      ) : incidents.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <CheckCircle2
            size={48}
            style={{
              margin: "0 auto 1rem",
              opacity: 0.5,
              color: "var(--state-safe)",
            }}
          />
          <h3
            style={{
              fontSize: "1.25rem",
              color: "var(--text-main)",
              marginBottom: "0.5rem",
            }}
          >
            Excelente cumplimiento
          </h3>
          <p>
            Su empresa no tiene incidencias ni sobre-exposiciones registradas.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="glass-panel"
              style={{
                borderLeft: `4px solid ${incident.status === "open" ? "var(--state-danger)" : "var(--state-safe)"}`,
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
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
                    {incident.status === "open" ? (
                      <div className="badge badge-danger">
                        <AlertTriangle
                          size={14}
                          style={{ marginRight: "0.4rem" }}
                        />{" "}
                        TICKET ABIERTO
                      </div>
                    ) : (
                      <div className="badge badge-success">
                        <CheckCircle2
                          size={14}
                          style={{ marginRight: "0.4rem" }}
                        />{" "}
                        CERRADO
                      </div>
                    )}
                    <span
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      Generado:{" "}
                      {new Date(incident.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.25rem",
                      color: "var(--text-main)",
                      fontWeight: 700,
                      margin: "0.5rem 0",
                    }}
                  >
                    {incident.toe_workers?.first_name}{" "}
                    {incident.toe_workers?.last_name} (
                    {incident.toe_workers?.ci})
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Lectura de{" "}
                    <strong style={{ color: "var(--text-main)" }}>
                      {incident.doses?.hp10} mSv
                    </strong>{" "}
                    en el periodo {incident.doses?.month}/{incident.doses?.year}
                    .
                  </p>
                </div>

                {incident.status === "open" && (
                  <button
                    onClick={() =>
                      setSelectedIncident(
                        selectedIncident === incident.id ? null : incident.id,
                      )
                    }
                    className="btn btn-primary"
                  >
                    Resolver Incidencia <ChevronDown size={16} />
                  </button>
                )}
              </div>

              {/* WRITE-BACK FORM */}
              {selectedIncident === incident.id &&
                incident.status === "open" && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <h4
                      style={{
                        color: "var(--text-main)",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <FileText size={18} color="var(--primary)" />
                      Acción Correctiva OSR
                    </h4>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        marginBottom: "1rem",
                      }}
                    >
                      Para cerrar este ticket, documente la justificación de la
                      sobreexposición y las medidas preventivas adoptadas. Esta
                      información se guardará en el rastro de auditoría
                      inmutable.
                    </p>
                    <textarea
                      value={correctiveAction}
                      onChange={(e) => setCorrectiveAction(e.target.value)}
                      placeholder="Ej. El trabajador participó en un procedimiento de fluoroscopia prolongado de emergencia. Se evaluaron sus EPP y se rotará de área por el próximo mes."
                      style={{
                        width: "100%",
                        minHeight: "100px",
                        background: "rgba(0,0,0,0.05)",
                        border: "1px solid var(--border)",
                        color: "var(--text-main)",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "1rem",
                      }}
                    >
                      <button
                        onClick={() => setSelectedIncident(null)}
                        className="btn"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleCloseIncident(incident.id)}
                        disabled={
                          submitting || correctiveAction.trim().length < 10
                        }
                        className="btn btn-primary"
                      >
                        {submitting
                          ? "Guardando Audit Trail..."
                          : "Documentar y Cerrar Ticket"}
                      </button>
                    </div>
                  </div>
                )}

              {/* CLOSED TICKET INFO */}
              {incident.status === "closed" && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    background: "rgba(0,0,0,0.2)",
                    padding: "1rem",
                    borderRadius: "8px",
                    borderLeft: "2px solid var(--state-safe)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    Acción Correctiva Documentada:
                  </span>
                  <p
                    style={{
                      color: "var(--text-main)",
                      fontSize: "0.9rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {incident.corrective_action_text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
