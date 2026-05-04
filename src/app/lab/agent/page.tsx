"use client";

import { useEffect, useState } from "react";
import { Server } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AgentsListWidget from "@/components/lab/agent/AgentsListWidget";
import AgentInstructionsWidget from "@/components/lab/agent/AgentInstructionsWidget";

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
        <AgentsListWidget agents={agents} loading={loading} createAgent={createAgent} />

        {/* Instructions Panel */}
        <AgentInstructionsWidget activeAgents={agents.filter(a => a.status === 'online').length} />
      </div>
    </div>
  );
}
