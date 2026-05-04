import { Server, Clock, Activity, Key, ShieldCheck, AlertCircle } from "lucide-react";

export default function AgentsListWidget({
  agents,
  loading,
  createAgent,
}: {
  agents: any[];
  loading: boolean;
  createAgent: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {loading && <p>Cargando agentes...</p>}
      
      {agents.length === 0 && !loading && (
        <div className="clean-panel" style={{ textAlign: "center", padding: "4rem" }}>
          <Server size={48} style={{ margin: "0 auto 1.5rem auto", color: "var(--text-muted)", opacity: 0.5 }} />
          <h3 style={{ marginBottom: "0.5rem" }}>No hay agentes configurados</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Instala un agente en tu servidor local para automatizar la carga de dosis.
          </p>
          <button className="btn btn-secondary" onClick={createAgent}>Configurar primer agente</button>
        </div>
      )}

      {agents.map(agent => (
        <div key={agent.id} className="clean-panel" style={{ position: "relative", overflow: "hidden" }}>
          <div 
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "4px", 
              height: "100%", 
              background: agent.status === "online" ? "var(--state-safe)" : "var(--text-muted)" 
            }} 
          />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: agent.status === "online" ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                color: agent.status === "online" ? "var(--state-safe)" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Server size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: "0.25rem" }}>{agent.name}</h3>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Clock size={14} />
                    Visto por última vez: {agent.last_seen ? new Date(agent.last_seen).toLocaleString() : 'Nunca'}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Activity size={14} />
                    ID: {agent.machine_id || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
              <div className={`badge ${agent.status === 'online' ? 'badge-success' : ''}`} style={{ background: agent.status === 'online' ? '' : 'rgba(0,0,0,0.05)', color: agent.status === 'online' ? '' : '#666' }}>
                {agent.status.toUpperCase()}
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: "0.5rem", borderRadius: "8px" }}
                onClick={() => {
                    const btn = document.getElementById(`key-${agent.id}`);
                    if (btn) btn.style.display = btn.style.display === 'none' ? 'block' : 'none';
                }}
              >
                <Key size={14} />
                Ver Secret Key
              </button>
            </div>
          </div>

          <div id={`key-${agent.id}`} style={{ display: "none", marginTop: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px dashed var(--border)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Secret Key (No compartir)</p>
            <code style={{ fontSize: "1rem", color: "var(--primary-teal)", fontWeight: 900 }}>{agent.secret_key}</code>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "1rem" }}>Logs de Sincronización Recientes</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {agent.agent_sync_logs?.slice(0, 3).map((log: any) => (
                <div key={log.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "rgba(0,0,0,0.02)", borderRadius: "8px", fontSize: "0.875rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {log.status === 'success' ? <ShieldCheck size={14} color="var(--state-safe)" /> : <AlertCircle size={14} color="var(--state-danger)" />}
                    {log.file_name}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {log.records_synced} dosis • {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {(!agent.agent_sync_logs || agent.agent_sync_logs.length === 0) && (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontStyle: "italic" }}>No hay logs de sincronización todavía.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
