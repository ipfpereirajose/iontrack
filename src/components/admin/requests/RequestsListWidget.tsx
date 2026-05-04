import { History, Building2 } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import RequestActions from "@/app/admin/requests/RequestActions";

export default async function RequestsListWidget() {
  const supabase = getServiceSupabase();
  const { data: requests } = await supabase
    .from("change_requests")
    .select("*, tenants(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (!requests || requests.length === 0) {
    return (
      <div className="clean-panel" style={{ textAlign: "center", padding: "6rem" }}>
        <History size={64} color="var(--primary-teal)" style={{ marginBottom: "1.5rem", opacity: 0.2 }} />
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          No hay solicitudes pendientes
        </h3>
        <p style={{ color: "var(--text-muted)" }}>
          Todos los laboratorios están al día con su información.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {requests.map((req: any) => (
        <div key={req.id} className="clean-panel" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", background: "#f8fafc", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Building2 size={24} color="var(--primary-teal)" />
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{req.tenants?.name}</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Solicitado el {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <RequestActions requestId={req.id} />
          </div>

          <div style={{ padding: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
              {/* OLD DATA */}
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                  Datos Actuales
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {Object.keys(req.new_data || {}).map((key) => (
                    <div key={key}>
                      <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {key}
                      </label>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {req.old_data?.[key] || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW DATA */}
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--primary-teal)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                  Cambios Solicitados
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {Object.keys(req.new_data || {}).map((key) => {
                    const isChanged = req.old_data?.[key] !== req.new_data?.[key];
                    return (
                      <div key={key}>
                        <label style={{ fontSize: "0.65rem", fontWeight: 800, color: isChanged ? "var(--primary-teal)" : "var(--text-muted)", textTransform: "uppercase" }}>
                          {key}
                        </label>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: isChanged ? "var(--state-safe)" : "inherit" }}>
                          {req.new_data?.[key]}
                          {isChanged && (
                            <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "var(--state-warning)" }}>
                              (Actualizado)
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
