import { Calendar } from "lucide-react";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import ExportButton from "@/app/portal/history/ExportButton";
import HistoryListWidget from "@/components/portal/history/HistoryListWidget";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile?.company_id) return null;

  const companyId = profile.company_id;

  // Fetch Company Info and doses in parallel
  const [
    { data: company },
    { data: doses }
  ] = await Promise.all([
    supabase.from("companies").select("name").eq("id", companyId).single(),
    supabase.from("doses").select("id, month, year, hp10, toe_workers!inner(first_name, last_name, ci, company_id)").eq("toe_workers.company_id", companyId).eq("status", "approved").order("year", { ascending: false }).order("month", { ascending: false })
  ]);

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

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando historial...</div>}>
        <HistoryListWidget companyId={companyId} />
      </Suspense>
    </div>
  );
}

export const revalidate = 0;
