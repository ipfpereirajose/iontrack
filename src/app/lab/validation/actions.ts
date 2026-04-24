'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function approveDose(doseId: string) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error('No autenticado');
  if (!profile?.tenant_id) throw new Error('Usuario sin laboratorio asignado');

  // Fetch dose details and verify ownership
  const { data: dose } = await supabase
    .from('doses')
    .select('*, toe_workers!inner(company_id, companies!inner(tenant_id))')
    .eq('id', doseId)
    .single();

  if (!dose || dose.toe_workers.companies.tenant_id !== profile.tenant_id) {
    throw new Error('No tienes permiso para validar esta dosis');
  }

  // Threshold Check (80% of 1.6mSv monthly limit = 1.28mSv)
  const THRESHOLD = 1.28;
  if (dose.hp10 >= THRESHOLD) {
    await supabase.from('notifications').insert([{
      tenant_id: profile.tenant_id,
      company_id: dose.toe_workers.company_id,
      type: 'threshold_alert',
      message: `ALERTA CRÍTICA: El trabajador ha superado el 80% del límite mensual permitido (${dose.hp10} mSv).`
    }]);
  }

  // Update Status
  const { error } = await supabase
    .from('doses')
    .update({ 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    })
    .eq('id', doseId);

  if (error) throw new Error(error.message);

  // Audit Log (Immutable record)
  await supabase.from('audit_logs').insert([{
    tenant_id: profile.tenant_id,
    action: 'APPROVE_DOSE',
    table_name: 'doses',
    record_id: doseId,
    new_data: { status: 'approved', value: dose.hp10 },
    justification: 'Validación manual por Oficial de Seguridad'
  }]);

  revalidatePath('/lab/validation');
}

export async function rejectDose(doseId: string) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error('No autenticado');

  // Fetch dose and verify ownership
  const { data: dose } = await supabase
    .from('doses')
    .select('*, toe_workers!inner(companies!inner(tenant_id))')
    .eq('id', doseId)
    .single();

  if (!dose || dose.toe_workers.companies.tenant_id !== profile?.tenant_id) {
    throw new Error('No tienes permiso para rechazar esta dosis');
  }

  // Update Status
  const { error } = await supabase
    .from('doses')
    .update({ status: 'rejected' })
    .eq('id', doseId);

  if (error) throw new Error(error.message);

  revalidatePath('/lab/validation');
}
