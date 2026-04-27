import { getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminSupabase = getServiceSupabase();
  const body = await req.json();
  const { secretKey, action, data } = body;

  if (!secretKey) {
    return NextResponse.json({ error: "Missing secret key" }, { status: 400 });
  }

  // 1. Verify Agent Identity
  const { data: agent, error: agentErr } = await adminSupabase
    .from("local_agents")
    .select("id, tenant_id, name")
    .eq("secret_key", secretKey)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: "Agent not found or unauthorized" }, { status: 401 });
  }

  // 2. Handle Action
  try {
    if (action === "heartbeat") {
      await adminSupabase
        .from("local_agents")
        .update({ 
          status: "online", 
          last_seen: new Date().toISOString(),
          machine_id: data?.machineId || "unknown"
        })
        .eq("id", agent.id);
      
      return NextResponse.json({ success: true, agentName: agent.name });
    }

    if (action === "sync_doses") {
      const doses = data.doses || [];
      if (doses.length === 0) return NextResponse.json({ success: true, count: 0 });

      // Find workers for these CIs in this tenant
      const cis = [...new Set(doses.map((d: any) => d.worker_ci))];
      const { data: workers } = await adminSupabase
        .from("toe_workers")
        .select("id, ci, first_name, last_name, company_id, companies!inner(tenant_id)")
        .eq("companies.tenant_id", agent.tenant_id)
        .in("ci", cis);

      const workerMap = new Map(workers?.map(w => [w.ci, w.id]));
      
      const insertData = doses.map((d: any) => {
        const workerId = workerMap.get(d.worker_ci);
        if (!workerId) return null;
        return {
          toe_worker_id: workerId,
          month: d.month,
          year: d.year,
          hp10: d.hp10,
          hp3: d.hp3,
          hp007: d.hp007 || 0,
          status: "pending",
          raw_data_json: { ...d.raw, source: "local_agent", agent_id: agent.id }
        };
      }).filter(Boolean);

      if (insertData.length > 0) {
        const { error: insertErr } = await adminSupabase.from("doses").insert(insertData);
        if (insertErr) throw insertErr;

        // Log Sync
        await adminSupabase.from("agent_sync_logs").insert({
          agent_id: agent.id,
          file_name: data.fileName || "manual_sync",
          records_synced: insertData.length,
          status: "success"
        });
      }

      return NextResponse.json({ 
        success: true, 
        synced: insertData.length, 
        total: doses.length 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("[AGENT_API] Error:", error);
    
    // Log Error
    await adminSupabase.from("agent_sync_logs").insert({
      agent_id: agent.id,
      status: "error",
      error_message: error.message
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
