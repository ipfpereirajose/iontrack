import {
  Building2,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Download,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import DoseChart from "@/components/lab/DoseChart";
import YearSelector from "@/components/lab/YearSelector";

export default async function LabHomePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const { year: selectedYear } = await searchParams;
  const targetYear = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();
  const tenantId = profile?.tenant_id;
  const adminSupabase = getServiceSupabase();

  // 0. Fetch company IDs for this tenant to use as a reliable filter
  const { data: tenantCompanies } = await adminSupabase
    .from("companies")
    .select("id")
    .eq("tenant_id", tenantId);
  const companyIds = tenantCompanies?.map((c) => c.id) || [];

  if (companyIds.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <Building2 size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
        <h2 style={{ fontWeight: 800 }}>Bienvenido a IonTrack</h2>
        <p style={{ color: 'var(--text-muted)' }}>Para comenzar, carga tus empresas clientes en la sección de Empresas.</p>
        <Link href="/lab/bulk-import" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Ir a Carga Masiva
        </Link>
      </div>
    );
  }

  // 0b. Fetch all worker IDs for these companies
  const { data: tenantWorkers } = await adminSupabase
    .from("toe_workers")
    .select("id")
    .in("company_id", companyIds);
  const workerIds = tenantWorkers?.map(w => w.id) || [];

  // 1. Fetch Doses in batches of 100 to avoid URL length limits
  const allYearDoses: any[] = [];
  const BATCH_SIZE = 100;
  for (let i = 0; i < workerIds.length; i += BATCH_SIZE) {
    const chunk = workerIds.slice(i, i + BATCH_SIZE);
    const { data: chunkDoses } = await adminSupabase
      .from("doses")
      .select("hp10, month, year, status, toe_worker_id")
      .in("toe_worker_id", chunk)
      .eq("year", targetYear)
      .in("status", ["approved", "pending"]);
    if (chunkDoses) allYearDoses.push(...chunkDoses);
  }

  // 2. Fetch Stats & Remaining Data
  const [
    { count: companiesCount = 0 } = {},
    { count: workersCount = 0 } = {},
    { data: pendingDoses = [], count: pendingCount = 0 } = {},
    { data: criticalDoses = [] } = {},
    { data: recentAudit = [] } = {},
  ] = await Promise.all([
    adminSupabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    adminSupabase
      .from("toe_workers")
      .select("id", { count: "exact", head: true })
      .in("company_id", companyIds),
    adminSupabase
      .from("doses")
      .select("id, month, year, hp10, status, toe_workers!inner(first_name, last_name, ci)")
      .eq("status", "pending")
      .in("toe_worker_id", workerIds.slice(0, 100))
      .limit(10),
    adminSupabase
      .from("doses")
      .select("id, hp10, month, year, status, toe_workers!inner(id, first_name, last_name, company_id)")
      .in("toe_worker_id", workerIds.slice(0, 100))
      .eq("year", targetYear)
      .gte("hp10", 1.6)
      .order("hp10", { ascending: false })
      .limit(10),
    adminSupabase
      .from("audit_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allYearData = allYearDoses;

  // Process Chart Data (Average Dose per Worker)
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  const chartData = months.map((name, index) => {
    const month = index + 1;
    const monthDoses = allYearData?.filter((d) => d.month === month) || [];
    
    // Number of unique workers with data in this month
    const activeWorkers = new Set(monthDoses.map(d => (d.toe_workers as any)?.id)).size;
    
    const approvedTotal = monthDoses
      .filter(d => d.status === 'approved')
      .reduce((acc, curr) => acc + (Number(curr.hp10) || 0), 0);
      
    const pendingTotal = monthDoses
      .filter(d => d.status === 'pending')
      .reduce((acc, curr) => acc + (Number(curr.hp10) || 0), 0);

    // Calculate Averages
    const approved = activeWorkers > 0 ? approvedTotal / activeWorkers : 0;
    const pending = activeWorkers > 0 ? pendingTotal / activeWorkers : 0;

    return { 
      name, 
      approved: parseFloat(approved.toFixed(4)), 
      pending: parseFloat(pending.toFixed(4)),
      projected: 0,
      activeWorkers
    };
  });

  // Calculate Projections per Worker
  const workerDosesMap = new Map<string, { worker: any; doses: any[] }>();
  allYearData?.forEach((d) => {
    const wId = (d.toe_workers as any).id;
    if (!workerDosesMap.has(wId)) {
      workerDosesMap.set(wId, { worker: d.toe_workers, doses: [] });
    }
    workerDosesMap.get(wId)!.doses.push({ hp10: d.hp10, month: d.month });
  });

  const { calculateDoseProjection } = await import("@/utils/analytics");
  
  // Get all projections and sort by projected dose (not just at risk)
  const workerProjections = Array.from(workerDosesMap.values())
    .map(({ worker, doses }) => {
      const projection = calculateDoseProjection(doses, targetYear);
      return { worker, projection };
    })
    .sort((a, b) => b.projection.projected - a.projection.projected);

  // Top 5 workers for the "At Risk" / "High Trend" section
  const atRiskWorkers = workerProjections.slice(0, 5);

  // Add projections to chart data if we are in the current year
  if (targetYear === new Date().getFullYear()) {
    // Calculate global AVERAGE velocity per worker
    const avgVelocity = workerProjections.length > 0 
      ? workerProjections.reduce((acc, curr) => acc + curr.projection.velocity, 0) / workerProjections.length
      : 0;
      
    const lastMonthWithData = Math.max(...(allYearData?.map(d => d.month) || [0]));
    
    chartData.forEach((d, i) => {
      const monthNum = i + 1;
      if (monthNum > lastMonthWithData && d.approved === 0 && d.pending === 0) {
        d.projected = parseFloat(avgVelocity.toFixed(4));
      }
    });
  }

  // Calculate Projected Annual Average for the whole lab
  const projectedAnnualAvg = workerProjections.length > 0
    ? workerProjections.reduce((acc, curr) => acc + curr.projection.projected, 0) / workerProjections.length
    : 0;

  return (
    <div>
      <header
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard General
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Estado operativo y vigilancia dosimétrica del laboratorio.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <YearSelector currentYear={targetYear} />
          <button
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Calendar size={18} />
            Periodo Actual
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div className="clean-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Empresas
            </span>
            <Building2 size={18} color="var(--primary-teal)" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900 }}>
            {companiesCount || 0}
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--state-safe)",
              marginTop: "0.5rem",
              fontWeight: 700,
            }}
          >
            ● Clientes Activos
          </p>
        </div>

        <div className="clean-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Personal TOE
            </span>
            <Users size={18} color="var(--primary-teal)" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900 }}>
            {workersCount || 0}
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--state-safe)",
              marginTop: "0.5rem",
              fontWeight: 700,
            }}
          >
            ● Vigilancia Activa
          </p>
        </div>

        <div className="clean-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Pendientes
            </span>
            <div
              style={{
                background: "var(--state-warning)",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                fontSize: "0.7rem",
                fontWeight: 900,
              }}
            >
              ACCION
            </div>
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900 }}>
            {pendingCount || 0}
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color:
                pendingCount && pendingCount > 0
                  ? "var(--state-warning)"
                  : "var(--state-safe)",
              marginTop: "0.5rem",
              fontWeight: 700,
            }}
          >
            {pendingCount && pendingCount > 0
              ? "⚠️ Acción Requerida"
              : "✓ Al día"}
          </p>
        </div>

        <div
          className="clean-panel"
          style={{
            border: "1px solid var(--primary-teal)",
            background: "rgba(0, 168, 181, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Proyección Anual (Promedio)
            </span>
            <TrendingUp size={18} color="var(--primary-teal)" />
          </div>
          <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "var(--primary-teal)" }}>
            {projectedAnnualAvg.toFixed(2)}
            <span style={{ fontSize: "1rem", marginLeft: "0.25rem" }}>mSv</span>
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.5rem",
              fontWeight: 700,
            }}
          >
            Est. acumulado a fin de año
          </p>
        </div>

        <div
          className="clean-panel"
          style={{
            borderLeft: `4px solid ${criticalDoses?.length ? "var(--state-danger)" : "var(--state-safe)"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Alertas Críticas
            </span>
            <AlertTriangle
              size={18}
              color={
                criticalDoses?.length
                  ? "var(--state-danger)"
                  : "var(--text-muted)"
              }
            />
          </div>
          <div
            style={{
              fontSize: "2.25rem",
              fontWeight: 900,
              color: criticalDoses?.length ? "var(--state-danger)" : "inherit",
            }}
          >
            {criticalDoses?.length || 0}
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: criticalDoses?.length
                ? "var(--state-danger)"
                : "var(--state-safe)",
              marginTop: "0.5rem",
              fontWeight: 700,
            }}
          >
            {criticalDoses?.length
              ? "🚨 Sobre-exposición"
              : "✓ Sin incidencias"}
          </p>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1.2fr",
          gap: "2rem",
        }}
      >
        {/* CHART SECTION */}
        <div className="clean-panel" style={{ padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              <TrendingUp size={20} color="var(--primary-teal)" />
              Tendencia de Carga Dosimétrica
            </h3>
          </div>
          <DoseChart data={chartData} />
        </div>

        {/* RECENT ALERTS AND PROJECTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* PREDICTIVE ANALYTICS WIDGET */}
          {atRiskWorkers && atRiskWorkers.length > 0 && (
            <section>
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  marginBottom: "1.25rem",
                }}
              >
                <TrendingUp size={20} color="var(--primary-teal)" />
                Proyecciones y Vigilancia Preventiva
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {atRiskWorkers.map(({ worker, projection }) => (
                  <div
                    key={worker.id}
                    className="clean-panel"
                    style={{
                      padding: "1rem",
                      borderLeft: `4px solid ${projection.isAtRisk ? 'var(--state-danger)' : projection.projected > 15 ? 'var(--state-warning)' : 'var(--primary-teal)'}`,
                      background: projection.isAtRisk ? "rgba(239, 68, 68, 0.05)" : "rgba(0, 168, 181, 0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 900,
                          color: "var(--state-warning)",
                        }}
                      >
                        {projection.isAtRisk ? "ALERTA CRÍTICA" : "TENDENCIA ANUAL"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}
                      >
                        Velocidad: {projection.velocity} mSv/mes
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                      {worker.first_name} {worker.last_name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {worker.companies.name}
                    </p>
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.4rem",
                      }}
                    >
                      <span style={{ fontSize: "1.25rem", fontWeight: 900 }}>
                        {projection.projected}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}
                      >
                        mSv proyectados
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "1.1rem",
                fontWeight: 800,
                marginBottom: "1.25rem",
              }}
            >
              <ShieldAlert size={20} color="var(--state-danger)" />
              Notificaciones Críticas
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {!criticalDoses || criticalDoses.length === 0 ? (
                <div
                  className="clean-panel"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  No hay alertas registradas.
                </div>
              ) : (
                criticalDoses.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="clean-panel"
                    style={{
                      padding: "1rem",
                      borderLeft: `4px solid ${alert.hp10 >= 1.66 ? "var(--state-danger)" : "var(--state-warning)"}`,
                      background:
                        alert.hp10 >= 1.66
                          ? "rgba(239, 68, 68, 0.05)"
                          : "rgba(245, 158, 11, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 900,
                          color:
                            alert.hp10 >= 1.66
                              ? "var(--state-danger)"
                              : "var(--state-warning)",
                        }}
                      >
                        {alert.hp10 >= 1.66
                          ? "SOBRE-EXPOSICIÓN (NIVEL ROJO)"
                          : "ADVERTENCIA 80% (NIVEL AMARILLO)"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                      {alert.toe_workers.first_name}{" "}
                      {alert.toe_workers.last_name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {alert.toe_workers.companies.name}
                    </p>
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.4rem",
                      }}
                    >
                      <span style={{ fontSize: "1.25rem", fontWeight: 900 }}>
                        {alert.hp10}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}
                      >
                        mSv
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* QUICK LINKS / INFRASTRUCTURE */}
          <div
            className="clean-panel"
            style={{
              background: "var(--primary-dark)",
              color: "white",
              border: "none",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
              }}
            >
              Agente de Ingesta
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                opacity: 0.9,
                marginBottom: "1.25rem",
                fontWeight: 600,
              }}
            >
              Descarga la última versión para sincronización offline.
            </p>
            <Link
              href="/downloads/iontrack-agent.exe"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Download size={18} />
              Descargar Agente
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT VALIDATIONS */}
      <section style={{ marginTop: "3rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            Pendientes de Validación
          </h2>
          <Link
            href="/lab/validation"
            style={{
              fontSize: "0.875rem",
              color: "var(--primary-teal)",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div
          className="clean-panel"
          style={{ padding: "0", overflow: "hidden" }}
        >
          {!pendingDoses || pendingDoses.length === 0 ? (
            <div
              style={{
                padding: "4rem",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <CheckCircle
                size={48}
                style={{ marginBottom: "1rem", opacity: 0.2 }}
              />
              <p style={{ fontWeight: 600 }}>
                No hay dosis pendientes. Todo al día.
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Trabajador</th>
                  <th>Institución</th>
                  <th>Periodo</th>
                  <th>Dosis</th>
                  <th style={{ textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoses.map((dose: any) => (
                  <tr key={dose.id}>
                    <td style={{ fontWeight: 700 }}>
                      {dose.toe_workers.first_name} {dose.toe_workers.last_name}
                    </td>
                    <td
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {dose.toe_workers.companies.name}
                    </td>
                    <td style={{ fontSize: "0.875rem" }}>
                      {dose.month}/{dose.year}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                        {dose.hp10}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          marginLeft: "0.2rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        mSv
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href="/lab/validation"
                        className="btn btn-primary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.75rem",
                          borderRadius: "8px",
                        }}
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      {/* DEBUG FOOTER */}
      <div
        style={{
          marginTop: "4rem",
          padding: "1rem",
          borderTop: "1px solid var(--border)",
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.1)",
          fontFamily: "monospace",
          textAlign: "center",
        }}
      >
        Auth UUID: {user.id} | Tenant ID: {tenantId || "MISSING"} | Role: {profile?.role}
      </div>
    </div>
  );
}
