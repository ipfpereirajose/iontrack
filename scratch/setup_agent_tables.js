const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:S3guridad2026!@db.gjdxaejbqibwemotyvto.supabase.co:5432/postgres",
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.local_agents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          machine_id VARCHAR(255),
          status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
          last_seen TIMESTAMP WITH TIME ZONE,
          config JSONB DEFAULT '{}',
          secret_key UUID DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.agent_sync_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          agent_id UUID REFERENCES public.local_agents(id) ON DELETE CASCADE,
          file_name VARCHAR(255),
          records_synced INTEGER DEFAULT 0,
          status VARCHAR(20) CHECK (status IN ('success', 'partial', 'error')),
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Check if RLS is enabled
      ALTER TABLE public.local_agents ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.agent_sync_logs ENABLE ROW LEVEL SECURITY;

      -- Check if policies exist before creating
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Agent access' AND tablename = 'local_agents') THEN
              CREATE POLICY "Agent access" ON public.local_agents FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) OR (SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid()));
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sync logs access' AND tablename = 'agent_sync_logs') THEN
              CREATE POLICY "Sync logs access" ON public.agent_sync_logs FOR ALL USING (agent_id IN (SELECT id FROM public.local_agents WHERE tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())) OR (SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid()));
          END IF;
      END
      $$;
    `);
    console.log("TABLES AND POLICIES CREATED SUCCESSFULLY.");
  } catch (err) {
    console.error("ERROR CREATING TABLES:", err);
  } finally {
    await client.end();
  }
}

run();
