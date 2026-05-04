import { Suspense } from "react";
import { Users, UserPlus, Search, Filter } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import WorkersListWidget from "@/components/portal/workers/WorkersListWidget";

export default async function WorkersPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const companyId = profile?.company_id;

  return (
    <div>
      <header
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
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
              <Users size={28} />
            </div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-main)" }}>
              Directorio de Personal (TOE)
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            Gestión y vigilancia radiológica de los trabajadores ocupacionalmente expuestos.
          </p>
        </div>
        <Link
          href="/portal/workers/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            background: "var(--primary)",
            color: "var(--primary-dark)",
            borderRadius: "12px",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          <UserPlus size={18} />
          Registrar TOE
        </Link>
      </header>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div
          className="glass-panel"
          style={{
            flex: 1,
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            style={{
              border: "none",
              background: "none",
              outline: "none",
              width: "100%",
              fontSize: "0.875rem",
              color: "var(--text-main)",
            }}
          />
        </div>
        <button
          className="btn"
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: "12px",
            fontWeight: 600,
          }}
        >
          <Filter size={18} />
          Filtrar
        </button>
      </div>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando directorio de personal...</div>}>
        {companyId ? <WorkersListWidget companyId={companyId} /> : <div className="p-8 text-red-500">Error: Perfil incompleto.</div>}
      </Suspense>
    </div>
  );
}

export const revalidate = 0;
