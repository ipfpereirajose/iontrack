import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import GlobalStatsWidget from "@/components/admin/dashboard/GlobalStatsWidget";
import RecentTenantsWidget from "@/components/admin/dashboard/RecentTenantsWidget";

export default async function SuperAdminHomePage() {
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
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontWeight: 900 }}>
            Bienvenido, SuperAdmin
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Estado global de la infraestructura I.O.N.T.R.A.C.K.
          </p>
        </div>
        <Link href="/admin/tenants/new" className="btn btn-primary">
          <Plus size={20} />
          Nuevo Laboratorio
        </Link>
      </header>

      <Suspense fallback={<div className="clean-panel">Cargando estadísticas globales...</div>}>
        <GlobalStatsWidget />
      </Suspense>

      <Suspense fallback={<div className="clean-panel" style={{ marginTop: "3rem" }}>Cargando laboratorios recientes...</div>}>
        <RecentTenantsWidget />
      </Suspense>
    </div>
  );
}
