import {
  GitBranch,
  Building2,
  Users,
  Activity,
  ArrowRight,
  Layers,
  Database,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function InfrastructurePage() {
  const supabase = await createClient();

  // Fetch hierarchical data
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
              background: "rgba(6, 182, 212, 0.1)",
              color: "var(--primary)",
              padding: "0.75rem",
              borderRadius: "12px",
            }}
          >
            <GitBranch size={28} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>
            Mapa de Infraestructura Lineal
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Visualización de la relación jerárquica entre Laboratorios, Empresas
          Clientes y Volumen de Servicios.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {tenants?.map((tenant) => (
          <div
            key={tenant.id}
            className="clean-panel"
            style={{
              padding: "0",
              overflow: "hidden",
              borderLeft: "4px solid var(--primary-teal)",
            }}
          >
            {/* TENANT HEADER */}
            <div
              style={{
                padding: "1.5rem",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <Layers size={20} color="var(--primary-teal)" />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  {tenant.name}
                </h2>
                <span
                  className={`badge ${tenant.billing_status === "active" ? "badge-success" : "badge-warning"}`}
                >
                  {tenant.billing_status}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Building2 size={14} /> {tenant.companies?.length || 0}{" "}
                  Empresas
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Users size={14} />{" "}
                  {tenant.companies?.reduce(
                    (acc: any, curr: any) =>
                      acc + (curr.toe_workers?.[0]?.count || 0),
                    0,
                  )}{" "}
                  TOEs Totales
                </span>
              </div>
            </div>

            {/* LINEAL FLOW */}
            <div
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "#fcfdfd",
              }}
            >
              {tenant.companies?.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    padding: "2rem",
                  }}
                >
                  Este laboratorio no tiene empresas registradas actualmente.
                </p>
              ) : (
                tenant.companies.map((company: any) => (
                  <div
                    key={company.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {/* Lab Node */}
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "var(--primary-teal)",
                        flexShrink: 0,
                      }}
                    ></div>

                    {/* Connector */}
                    <div
                      style={{
                        width: "40px",
                        height: "2px",
                        background: "var(--border)",
                      }}
                    ></div>

                    {/* Company Node */}
                    <div
                      className="clean-panel"
                      style={{
                        flex: 1,
                        padding: "1rem 1.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <Building2 size={18} color="var(--text-muted)" />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {company.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              fontWeight: 600,
                            }}
                          >
                            RIF: {company.tax_id}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "2rem",
                        }}
                      >
                        <div style={{ textAlign: "right" }}>
                          <p
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                            }}
                          >
                            Servicios Activos
                          </p>
                          <p
                            style={{
                              fontSize: "1rem",
                              fontWeight: 900,
                              color: "var(--primary-teal)",
                            }}
                          >
                            {company.toe_workers?.[0]?.count || 0}{" "}
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              TOEs
                            </span>
                          </p>
                        </div>
                        <ArrowRight size={16} color="var(--text-muted)" />
                        <div style={{ textAlign: "right", minWidth: "100px" }}>
                          <p
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                            }}
                          >
                            Estado de Red
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "0.5rem",
                              color: "var(--state-safe)",
                            }}
                          >
                            <Activity size={14} />
                            <span
                              style={{ fontSize: "0.8rem", fontWeight: 700 }}
                            >
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INFRASTRUCTURE HEALTH CARD */}
      <div
        className="clean-panel"
        style={{
          marginTop: "3rem",
          borderLeft: "4px solid var(--primary-dark)",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <div
          style={{
            background: "rgba(26, 54, 93, 0.05)",
            padding: "1.5rem",
            borderRadius: "16px",
            color: "var(--primary-dark)",
          }}
        >
          <Database size={32} />
        </div>
        <div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              marginBottom: "0.25rem",
            }}
          >
            Salud Global de la Infraestructura
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Todos los nodos de laboratorio y bases de datos regionales están
            sincronizados correctamente. Latencia media: 42ms.
          </p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--text-muted)",
            }}
          >
            UPTIME TOTAL
          </p>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "var(--state-safe)",
            }}
          >
            99.98%
          </p>
        </div>
      </div>
    </div>
  );
}
