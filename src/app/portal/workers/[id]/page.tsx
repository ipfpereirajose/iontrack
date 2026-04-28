import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ArrowLeft, User, Activity, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  // 1. Fetch Worker Info
  const { data: worker, error: workerError } = await supabase
    .from("toe_workers")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile?.company_id)
    .single();

  if (workerError || !worker) return notFound();

  // 2. Fetch Doses
  const { data: doses } = await supabase
    .from("doses")
    .select("*")
    .eq("toe_worker_id", id)
    .eq("status", "approved")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const totalAccumulated = doses?.reduce((acc, d) => acc + d.hp10, 0) || 0;
  const lastDose = doses && doses.length > 0 ? doses[0].hp10 : 0;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <Link
          href="/portal/workers"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Volver al directorio
        </Link>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              Perfil del Trabajador
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Vigilancia radiológica individual y seguimiento de dosis.
            </p>
          </div>
          <span style={{
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            background: "rgba(74, 222, 128, 0.1)",
            color: "#4ade80",
            fontWeight: 800,
            fontSize: "0.8rem",
            textTransform: "uppercase"
          }}>
            Vigilancia Activa
          </span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Left Col: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "rgba(168, 85, 247, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a855f7",
              margin: "0 auto 1.5rem auto"
            }}>
              <User size={40} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
              {worker.first_name} {worker.last_name}
            </h2>
            <p style={{ color: "var(--text-muted)", fontWeight: 600, marginBottom: "1.5rem" }}>
              {worker.ci}
            </p>
            
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Cargo</label>
                <div style={{ fontWeight: 700 }}>{worker.position}</div>
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Práctica</label>
                <div style={{ fontWeight: 700 }}>{worker.practice}</div>
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Nacimiento</label>
                <div style={{ fontWeight: 700 }}>
                  {worker.birth_date ? worker.birth_date.split('-').reverse().join('/') : worker.birth_year}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <ShieldCheck size={20} />
              <span style={{ fontWeight: 800 }}>Estado de Seguridad</span>
            </div>
            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
              El trabajador se encuentra dentro de los niveles de dosis permitidos por la normativa vigente.
            </p>
          </div>
        </div>

        {/* Right Col: Stats & History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                Dosis Acumulada
              </label>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 900 }}>{totalAccumulated.toFixed(4)}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>mSv</span>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                Última Lectura
              </label>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: lastDose >= 1.28 ? "var(--state-danger)" : "inherit" }}>
                  {lastDose.toFixed(4)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>mSv</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Activity size={20} color="var(--primary)" />
              <h3 style={{ fontWeight: 800 }}>Historial de Lecturas</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem" }}>Periodo</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem" }}>Dosis Hp10</th>
                  <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem" }}>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {!doses || doses.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      No hay registros de dosis aprobados.
                    </td>
                  </tr>
                ) : (
                  doses.map((dose) => (
                    <tr key={dose.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 700 }}>
                        {dose.month.toString().padStart(2, '0')}/{dose.year}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 800 }}>
                        {dose.hp10.toFixed(4)} <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>mSv</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "6px",
                          background: "rgba(74, 222, 128, 0.1)",
                          color: "#4ade80",
                          fontSize: "0.65rem",
                          fontWeight: 800
                        }}>CERTIFICADO</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
