import {
  Users,
  Plus,
  ArrowLeft,
  Mail,
  Shield,
  User,
  Fingerprint,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";

export default async function WorkersListPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: companyId } = await params;
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;

  if (!tenantId) return <div>No autorizado</div>;

  const adminSupabase = getServiceSupabase();

  // 1. Fetch Company Info, ensuring it belongs to the tenant
  const { data: company, error: companyError } = await adminSupabase
    .from("companies")
    .select("*, tenants(name)")
    .eq("id", companyId)
    .eq("tenant_id", tenantId)
    .single();

  if (!company) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "white",
          background: "#1a1a1a",
          borderRadius: "12px",
          margin: "2rem",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>
          Error al cargar la empresa
        </h2>
        <p style={{ opacity: 0.8, marginBottom: "0.5rem" }}>
          ID Buscado: {companyId}
        </p>
        <p style={{ opacity: 0.8, marginBottom: "0.5rem" }}>
          Tenant ID: {tenantId}
        </p>
        <pre
          style={{
            background: "black",
            padding: "1rem",
            borderRadius: "8px",
            overflow: "auto",
            fontSize: "0.8rem",
          }}
        >
          {JSON.stringify(companyError, null, 2)}
        </pre>
      </div>
    );
  }

  // 2. Fetch Workers
  const { data: workers, error: workersError } = await adminSupabase
    .from("toe_workers")
    .select("*")
    .eq("company_id", companyId)
    .order("worker_code", { ascending: true });

  return (
    <div>
      {/* DEBUG HEADER */}
      <div
        style={{
          background: "#000",
          color: "#4ade80",
          padding: "0.5rem 1rem",
          fontSize: "0.7rem",
          fontFamily: "monospace",
          marginBottom: "1rem",
          borderRadius: "8px",
          border: "1px solid #22c55e",
        }}
      >
        [DEBUG] Company ID: {companyId} | Workers Count: {workers?.length || 0}{" "}
        {workersError ? `| Error: ${workersError.message}` : ""}
      </div>
      <header style={{ marginBottom: "2.5rem" }}>
        <Link
          href="/lab/companies"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={18} />
          Volver a Empresas
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
                color: "var(--text-main)",
              }}
            >
              {company?.name}
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Gestión de Personal Ocupacionalmente Expuesto (TOE).
            </p>
          </div>
          <Link
            href={`/lab/companies/${companyId}/workers/new`}
            className="btn btn-primary"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              fontWeight: 700,
            }}
          >
            <Plus size={20} />
            Registrar TOE
          </Link>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {!workers || workers.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "5rem",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <Users
              size={64}
              color="var(--text-muted)"
              style={{ marginBottom: "1.5rem", opacity: 0.2 }}
            />
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              Sin personal registrado
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Esta empresa aún no tiene trabajadores bajo vigilancia.
            </p>
            <Link
              href={`/lab/companies/${companyId}/workers/new`}
              className="btn btn-primary"
            >
              Registrar Primer TOE
            </Link>
          </div>
        ) : (
          workers.map((worker) => (
            <div
              key={worker.id}
              className="glass-panel"
              style={{ background: "rgba(255,255,255,0.03)", padding: "2rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(6, 182, 212, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                  }}
                >
                  <User size={24} />
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.3rem 0.6rem",
                    borderRadius: "6px",
                    background:
                      worker.status === "active"
                        ? "rgba(74, 222, 128, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                    color: worker.status === "active" ? "#4ade80" : "#ef4444",
                  }}
                >
                  {worker.status === "active" ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--primary)",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Fingerprint size={12} />
                  {(company as any)?.tenants?.lab_code || "LAB"}-
                  {(company as any)?.company_code || "EMP"}-
                  {(company as any)?.osr_code || "OSR"}-
                  {worker.worker_code || "000"}
                </div>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    marginBottom: "0.25rem",
                    color: "var(--text-main)",
                  }}
                >
                  {worker.first_name} {worker.last_name}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {worker.ci}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <Shield size={14} />
                  <span>{worker.position || "Cargo no especificado"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <Mail size={14} />
                  <span>{worker.email || "Sin correo electrónico"}</span>
                </div>
              </div>

              <div
                style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}
              >
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  Editar
                </button>
                <Link
                  href={`/lab/toe-consultation/${worker.id}`}
                  className="btn"
                  style={{
                    flex: 1,
                    background: "rgba(6, 182, 212, 0.1)",
                    color: "var(--primary)",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  Ver Historial
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const revalidate = 0;
