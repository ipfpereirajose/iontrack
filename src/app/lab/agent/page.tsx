"use client";

import { useEffect, useState } from "react";
import { 
  Server, 
  Activity, 
  ShieldCheck, 
  Download, 
  RefreshCcw, 
  AlertCircle,
  Clock,
  ExternalLink,
  Key
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LabAgentPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .single();
        
        if (profile?.tenant_id) {
          setTenantId(profile.tenant_id);
          fetchAgents(profile.tenant_id);
        }
      }
    }
    init();

    // Realtime subscription
    const channel = supabase
      .channel('agent-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'local_agents' }, () => {
        if (tenantId) fetchAgents(tenantId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  async function fetchAgents(tid: string) {
    setLoading(true);
    const { data } = await supabase
      .from("local_agents")
      .select("*, agent_sync_logs(*)")
      .eq("tenant_id", tid)
      .order("created_at", { ascending: false });
    
    setAgents(data || []);
    setLoading(false);
  }

  async function createAgent() {
    if (!tenantId) return;
    const name = prompt("Nombre para el nuevo agente (ej: Servidor Laboratorio 1):");
    if (!name) return;

    const { error } = await supabase
      .from("local_agents")
      .insert([{
        tenant_id: tenantId,
        name,
        status: "offline"
      }]);
    
    if (error) alert("Error: " + error.message);
    else fetchAgents(tenantId);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            Agente <span className="text-gradient">Local</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            Monitoreo y gestión de terminales de ingesta automatizada.
          </p>
        </div>
        <button className="btn btn-primary" onClick={createAgent}>
          <Server size={18} />
          Nuevo Agente
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        {/* Agents List */}
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

        {/* Instructions Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="clean-panel" style={{ background: "var(--primary-dark)", color: "white" }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Download size={20} />
              Instalar Agente
            </h3>
            <p style={{ fontSize: "0.875rem", opacity: 0.8, lineHeight: 1.6, marginBottom: "1.5rem" }}>
              El agente es un ejecutable ligero que monitorea una carpeta local y sube automáticamente los archivos de dosis a la plataforma.
            </p>
            
            <ol style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              <li>Descarga el paquete del agente.</li>
              <li>Configura el <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 4px" }}>.env</code> con tu <b>Secret Key</b>.</li>
              <li>Ejecuta <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 4px" }}>node index.js</code> o usa el ejecutable.</li>
            </ol>

            <button className="btn btn-primary" style={{ width: "100%", background: "white", color: "var(--primary-dark)" }}>
              Descargar Agente (.zip)
              <Download size={18} />
            </button>
          </div>

          <div className="clean-panel">
            <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <RefreshCcw size={16} />
              Estado del Sistema
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span color="var(--text-muted)">Conexiones Activas</span>
                <span style={{ fontWeight: 800 }}>{agents.filter(a => a.status === 'online').length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span color="var(--text-muted)">Última Sincronización</span>
                <span style={{ fontWeight: 800 }}>Hoy, 14:45</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <Link href="/docs/agent" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--primary-teal)", textDecoration: "none", fontWeight: 700 }}>
                  Ver Documentación Técnica
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Link({ href, children, style }: any) {
  return <a href={href} style={style}>{children}</a>;
}
