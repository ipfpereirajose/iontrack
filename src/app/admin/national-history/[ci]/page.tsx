import {
  ArrowLeft,
  User,
  Calendar,
  Building2,
  Activity,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";

export default async function WorkerDetailPage({
  params,
}: {
  params: { ci: string };
}) {
  const supabase = getServiceSupabase();
  const { ci } = await params;

  // 1. Get Worker Info (from any of their records)
  const { data: workerInfo } = await supabase
    .from("toe_workers")
    .select("first_name, last_name, ci, sex, birth_year")
    .eq("ci", ci)
    .limit(1)
    .single();

  // 2. Get Detailed Timeline of Doses
  const { data: doses } = await supabase
    .from("doses")
    .select(
      `
      *,
      toe_workers!inner(
        ci,
        companies(name, company_code, state, municipality)
      )
    `,
    )
    .eq("toe_workers.ci", ci)
    .eq("status", "approved")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (!workerInfo) return <div>Trabajador no encontrado</div>;

  // Calculate totals
  const totalHp10 = doses?.reduce((sum, d) => sum + Number(d.hp10), 0) || 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Link
        href="/admin/national-history"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--primary-teal)",
          textDecoration: "none",
          marginBottom: "2rem",
          fontWeight: 700,
        }}
      >
        <ArrowLeft size={18} /> Volver al Historial Nacional
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 3fr",
          gap: "2.5rem",
        }}
      >
        {/* PROFILE CARD */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div
            className="clean-panel"
            style={{ textAlign: "center", padding: "2.5rem" }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(0, 168, 181, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <User size={40} color="var(--primary-teal)" />
            </div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                marginBottom: "0.25rem",
              }}
            >
              {workerInfo.first_name} {workerInfo.last_name}
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
              }}
            >
              CI: {workerInfo.ci}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1.5rem",
              }}
            >
              <div>
                <label style={miniLabelStyle}>Sexo</label>
                <div style={{ fontWeight: 800 }}>{workerInfo.sex}</div>
              </div>
              <div>
                <label style={miniLabelStyle}>Nacimiento</label>
                <div style={{ fontWeight: 800 }}>{workerInfo.birth_year}</div>
              </div>
            </div>
          </div>

          <div
            className="clean-panel"
            style={{ background: "var(--primary-dark)", color: "white" }}
          >
            <label
              style={{ ...miniLabelStyle, color: "rgba(255,255,255,0.6)" }}
            >
              Dosis Vida Acumulada
            </label>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                marginTop: "0.5rem",
              }}
            >
              {totalHp10.toFixed(4)}{" "}
              <span style={{ fontSize: "1rem", opacity: 0.8 }}>mSv</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "1rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                color:
                  totalHp10 < 20 ? "var(--state-safe)" : "var(--state-warning)",
              }}
            >
              <ShieldCheck size={16} />
              {totalHp10 < 20 ? "DENTRO DE LÍMITES" : "NIVEL DE ALERTA ALTO"}
            </div>
          </div>
        </div>

        {/* TIMELINE TABLE */}
        <div
          className="clean-panel"
          style={{ padding: "0", overflow: "hidden" }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid var(--border)",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 900 }}>
              Trazabilidad Detallada por Mes y Año
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div
                style={{
                  padding: "0.25rem 0.75rem",
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {doses?.length || 0} Registros
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Instalación / Empresa</th>
                  <th>Ubicación</th>
                  <th>Hp(10) mSv</th>
                  <th>Hp(0,07) mSv</th>
                  <th>Hp(3) mSv</th>
                  <th>Neutrones</th>
                </tr>
              </thead>
              <tbody>
                {doses?.map((dose: any) => (
                  <tr key={dose.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: 800,
                        }}
                      >
                        <Calendar size={14} color="var(--primary-teal)" />
                        {dose.month.toString().padStart(2, "0")}-{dose.year}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Building2 size={14} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                            {dose.toe_workers.companies.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.65rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            COD: {dose.toe_workers.companies.company_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      {dose.toe_workers.companies.state}
                    </td>
                    <td
                      style={{
                        fontWeight: 800,
                        color:
                          dose.hp10 > 1.66 ? "var(--state-danger)" : "inherit",
                      }}
                    >
                      {dose.hp10.toFixed(4)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{dose.hp007.toFixed(4)}</td>
                    <td style={{ fontWeight: 600 }}>{dose.hp3.toFixed(4)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {dose.hp10_neu.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const miniLabelStyle = {
  fontSize: "0.6rem",
  fontWeight: 900,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "1px",
} as any;
