import { getServiceSupabase } from "@/lib/supabase";
import InteractiveCompanyTrendChart from "@/components/lab/InteractiveCompanyTrendChart";

export default async function CompanyTrendChartWrapper({ tenantId, targetYear }: { tenantId: string, targetYear: number }) {
  const adminSupabase = getServiceSupabase();
  
  // Fetch worker IDs for the chart
  const { data: tenantWorkers } = await adminSupabase
    .from("toe_workers")
    .select("id, companies!inner(tenant_id)")
    .eq("companies.tenant_id", tenantId);
    
  const workerIds = tenantWorkers?.map(w => w.id) || [];

  return <InteractiveCompanyTrendChart workerIds={workerIds} targetYear={targetYear} />;
}
