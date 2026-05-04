import { UserCircle, Activity, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function WorkersListWidget({ companyId }: { companyId: string }) {
  const supabase = await createClient();

  const { data: workers, error } = await supabase
    .from("toe_workers")
    .select("*")
    .eq("company_id", companyId)
    .order("last_name", { ascending: true });

  if (error) {
    return <div className="p-8 text-red-500">Error al cargar trabajadores: {error.message}</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: "0", background: "rgba(255,255,255,0.02)", border: "none", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Trabajador</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Cédula / ID</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Cargo / Área</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Estatus</th>
            <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {!workers || workers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "5rem", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <UserCircle size={48} style={{ opacity: 0.2 }} />
                  <p>No se han registrado trabajadores todavía.</p>
                </div>
              </td>
            </tr>
          ) : (
            workers.map((worker) => (
              <tr key={worker.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "1.5rem 1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
                      <UserCircle size={24} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-main)" }}>
                      {worker.first_name} {worker.last_name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "1.5rem 1.5rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  {worker.ci}
                </td>
                <td style={{ padding: "1.5rem 1.5rem", fontSize: "0.875rem" }}>
                  {worker.position || "No especificado"}
                </td>
                <td style={{ padding: "1.5rem 1.5rem" }}>
                  <span style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: worker.status === "active" ? "rgba(74, 222, 128, 0.1)" : "rgba(255,255,255,0.05)",
                    color: worker.status === "active" ? "#4ade80" : "var(--text-muted)",
                    textTransform: "uppercase"
                  }}>
                    {worker.status === "active" ? "Vigilancia Activa" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "1.5rem 1.5rem", textAlign: "right" }}>
                  <Link href={`/portal/workers/${worker.id}`} className="btn" style={{ display: "inline-flex", padding: "0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                    <Activity size={18} />
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", color: "var(--text-main)" }}>Ver Dosis</span>
                    <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
