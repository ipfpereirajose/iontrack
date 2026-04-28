"use client";

import { useState } from "react";
import { Building2, Users, Layers, ChevronDown, ChevronUp, ArrowRight, Activity } from "lucide-react";

interface TenantGroupProps {
  tenant: any;
}

export default function TenantGroup({ tenant }: TenantGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className="clean-panel"
      style={{
        padding: "0",
        overflow: "hidden",
        borderLeft: "4px solid var(--primary-teal)",
        transition: "all 0.3s ease"
      }}
    >
      {/* TENANT HEADER */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "1.5rem",
          background: "#f8fafc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: isExpanded ? "1px solid var(--border)" : "none",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Layers size={20} color="var(--primary-teal)" />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
            {tenant.name}
          </h2>
          <span
            className={`badge ${tenant.billing_status === "active" ? "badge-success" : "badge-warning"}`}
          >
            {tenant.billing_status}
          </span>
          {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
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
            <Building2 size={14} /> {tenant.companies?.length || 0} Empresas
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
              (acc: any, curr: any) => acc + (curr.toe_workers?.[0]?.count || 0),
              0
            )}{" "}
            TOEs Totales
          </span>
        </div>
      </div>

      {/* LINEAL FLOW (Collapsible) */}
      <div
        style={{
          maxHeight: isExpanded ? "2000px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0, 1, 0, 1)",
          background: "#fcfdfd",
        }}
      >
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                        <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
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
    </div>
  );
}
