import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import TenantsListWidget from "@/components/admin/tenants/TenantsListWidget";

export default async function TenantsPage() {
  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Laboratorios (Tenants)
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Gestión global de los centros de dosimetría afiliados.
          </p>
        </div>
        <Link href="/admin/tenants/new" className="btn btn-primary">
          <Plus size={20} />
          Nuevo Laboratorio
        </Link>
      </header>

      <Suspense fallback={<div className="glass-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando lista de laboratorios...</div>}>
        <TenantsListWidget />
      </Suspense>
    </div>
  );
}

// Re-fetch data on every request for this dashboard page
export const revalidate = 0;
