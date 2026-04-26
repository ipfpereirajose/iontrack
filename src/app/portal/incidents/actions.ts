'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function closeIncidentAction(incidentId: string, correctiveActionText: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  if (!correctiveActionText || correctiveActionText.trim().length < 10) {
    throw new Error('Debe proporcionar una justificación detallada (mínimo 10 caracteres).');
  }

  // Fetch the incident to verify permissions and get details
  const { data: incident, error: fetchError } = await supabase
    .from('incidents')
    .select('id, status, tenant_id')
    .eq('id', incidentId)
    .single();

  if (fetchError || !incident) {
    throw new Error('Incidente no encontrado o no tiene permisos.');
  }

  if (incident.status === 'closed') {
    throw new Error('El incidente ya está cerrado.');
  }

  // Update incident status
  const { error: updateError } = await supabase
    .from('incidents')
    .update({
      status: 'closed',
      corrective_action_text: correctiveActionText,
      closed_by: user.id,
      closed_at: new Date().toISOString()
    })
    .eq('id', incidentId);

  if (updateError) {
    throw new Error('Error al cerrar el incidente: ' + updateError.message);
  }

  // Log Audit Trail
  await supabase.from('audit_logs').insert({
    tenant_id: incident.tenant_id,
    user_id: user.id,
    action: 'close_incident',
    table_name: 'incidents',
    record_id: incidentId,
    new_data: { status: 'closed', corrective_action: correctiveActionText },
    justification: correctiveActionText
  });

  revalidatePath('/portal/incidents');
  revalidatePath('/portal');
  revalidatePath('/lab');
  
  return { success: true };
}
