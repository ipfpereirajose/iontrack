import { getServiceSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ci = searchParams.get('ci');
  const birthYear = searchParams.get('birth_year');

  const supabase = getServiceSupabase();

  // 1. Verify credentials
  const { data: worker, error: workerError } = await supabase
    .from('toe_workers')
    .select('*')
    .eq('ci', ci)
    .eq('birth_year', birthYear)
    .limit(1)
    .single();

  if (workerError || !worker) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // 2. Get all doses for this CI (across all companies)
  const { data: allDoses } = await supabase
    .from('doses')
    .select(`
      *,
      toe_workers!inner(ci, companies(name))
    `)
    .eq('toe_workers.ci', ci)
    .eq('status', 'approved')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  const lifeDose = allDoses?.reduce((sum, d) => sum + Number(d.hp10), 0) || 0;
  const lastDose = allDoses?.[0] || null;

  const history = allDoses?.map(d => ({
    id: d.id,
    month: d.month,
    year: d.year,
    hp10: d.hp10,
    company_name: d.toe_workers.companies.name
  })) || [];

  return NextResponse.json({
    worker: {
      first_name: worker.first_name,
      last_name: worker.last_name,
      ci: worker.ci
    },
    lifeDose,
    lastDose,
    history
  });
}
