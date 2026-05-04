import { CheckCircle, Building2, AlertCircle } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import { approveDose, rejectDose } from "@/app/lab/validation/actions";
import ValidationButtons from "@/app/lab/validation/ValidationButtons";
import ValidationControls from "@/app/lab/validation/ValidationControls";

export default async function ValidationTableWidget({
  tenantId,
  month,
  year,
}: {
  tenantId: string;
  month?: string;
  year?: string;
}) {
  const supabase = getServiceSupabase();

  let query = supabase
    .from("doses")
    .select(
      `
      id, month, year, hp10, hp3, status, toe_worker_id,
      toe_workers!inner (
        first_name, last_name, ci,
        companies!inner (name, tenant_id)
      )
    `,
    )
    .eq("status", "pending")
    .eq("toe_workers.companies.tenant_id", tenantId);

  if (month) query = query.eq("month", parseInt(month));
  if (year) query = query.eq("year", parseInt(year));

  const { data: doses, error } = await query.order("created_at", {
    ascending: true,
  });

  let countQuery = supabase
    .from("doses")
    .select("id, toe_workers!inner(companies!inner(tenant_id))", { count: 'exact', head: true })
    .eq("status", "pending")
    .eq("toe_workers.companies.tenant_id", tenantId);

  if (month) countQuery = countQuery.eq("month", parseInt(month));
  if (year) countQuery = countQuery.eq("year", parseInt(year));

  const { count: realPendingCount } = await countQuery;

  return (
    <>
      <ValidationControls pendingCount={realPendingCount || 0} />

      {error && (
        <div
          className="clean-panel"
          style={{
            border: "1px solid var(--state-danger)",
            color: "var(--state-danger)",
            marginBottom: "2rem",
            background: "rgba(239, 68, 68, 0.05)",
          }}
        >
          <AlertCircle size={20} style={{ marginBottom: "0.5rem" }} />
          <p>Error al cargar la cola de validación: {error.message}</p>
        </div>
      )}

      {!doses || doses.length === 0 ? (
        <div
          className="clean-panel"
          style={{ textAlign: "center", padding: "6rem" }}
        >
          <CheckCircle
            size={64}
            color="var(--state-safe)"
            style={{ marginBottom: "1.5rem", opacity: 0.3 }}
          />
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Todo al día
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            No hay registros de dosis pendientes de validación para este
            laboratorio.
          </p>
        </div>
      ) : (
        <div
          className="clean-panel"
          style={{ padding: "0", overflow: "hidden" }}
        >
          <table>
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Empresa Cliente</th>
                <th>Periodo</th>
                <th>Dosis (Hp10)</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doses.map((dose: any) => (
                <tr key={dose.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {Array.isArray(dose.toe_workers) ? dose.toe_workers[0]?.first_name : dose.toe_workers?.first_name}{" "}
                        {Array.isArray(dose.toe_workers) ? dose.toe_workers[0]?.last_name : dose.toe_workers?.last_name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        CI: {Array.isArray(dose.toe_workers) ? dose.toe_workers[0]?.ci : dose.toe_workers?.ci}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: "var(--primary-teal)",
                        fontWeight: 600,
                      }}
                    >
                      <Building2 size={16} />
                      {Array.isArray(dose.toe_workers) 
                        ? (dose.toe_workers[0]?.companies as any)?.name 
                        : (dose.toe_workers?.companies as any)?.name}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: "#f1f5f9",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                      }}
                    >
                      {dose.month}/{dose.year}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.35rem",
                          fontWeight: 900,
                          color:
                            dose.hp10 >= 1.66
                              ? "var(--state-danger)"
                              : dose.hp10 >= 1.328
                                ? "var(--state-warning)"
                                : "var(--text-main)",
                        }}
                      >
                        {dose.hp10}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}
                      >
                        mSv
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <ValidationButtons
                      doseId={dose.id}
                      approveAction={approveDose}
                      rejectAction={rejectDose}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
