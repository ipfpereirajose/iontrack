import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import IncidentsListWidget from "@/components/portal/incidents/IncidentsListWidget";

export default async function B2BIncidentsPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile?.company_id) return null;

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*, toe_workers(first_name, last_name, ci), doses(hp10, month, year)")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

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

      <Suspense fallback={<div style={{ color: "var(--text-main)", padding: "2rem", textAlign: "center", fontWeight: 700 }}>Cargando incidencias...</div>}>
        <IncidentsListWidget initialIncidents={incidents || []} />
      </Suspense>
    </div>
  );
}
