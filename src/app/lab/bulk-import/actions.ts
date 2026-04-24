'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function bulkImportAction(type: string, data: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Perfil no encontrado');

  const tenantId = profile.tenant_id;
  let successCount = 0;
  const errors = [];

  for (const item of data) {
    try {
      if (type === 'doses') {
        // Traceability ID: LAB-EMP-OSR-TOE
        // We assume the Excel column is 'trace_id' or we parse it
        const traceId = item.trace_id || item.ID;
        if (!traceId) throw new Error('ID de trazabilidad faltante');

        const parts = traceId.split('-');
        const workerCode = parts[parts.length - 1];
        const companyCode = parts[1];

        // Find worker by code and company code
        const { data: worker } = await supabase
          .from('toe_workers')
          .select('id, first_name, last_name, company_id, companies!inner(company_code)')
          .eq('worker_code', workerCode)
          .eq('companies.company_code', companyCode)
          .eq('companies.tenant_id', tenantId)
          .single();

        if (!worker) throw new Error(`Trabajador con ID ${traceId} no encontrado`);

        // Insert Dose
        const { error: doseError } = await supabase
          .from('doses')
          .insert({
            toe_worker_id: worker.id,
            hp10: parseFloat(item.hp10 || item.dosis || 0),
            month: parseInt(item.month || item.mes),
            year: parseInt(item.year || item.anio || item.año),
            status: 'pending'
          });

        if (doseError) throw doseError;

        // AUDIT LOG
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: 'bulk_import_dose',
          entity_type: 'doses',
          entity_id: worker.id,
          details: { trace_id: traceId, hp10: item.hp10, month: item.month, year: item.year }
        });

      } else if (type === 'workers') {
        // Link by RIF/CI if exists, else create
        const ci = item.ci || item.cedula;
        const companyCode = item.company_code;

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('company_code', companyCode)
          .eq('tenant_id', tenantId)
          .single();

        if (!company) throw new Error(`Empresa ${companyCode} no encontrada`);

        const { data: existingWorker } = await supabase
          .from('toe_workers')
          .select('id')
          .eq('ci', ci)
          .single();

        if (existingWorker) {
          // Re-associate or update
          await supabase.from('toe_workers').update({
            company_id: company.id,
            worker_code: item.worker_code || item.codigo
          }).eq('id', existingWorker.id);
        } else {
          // Create new
          await supabase.from('toe_workers').insert({
            first_name: item.first_name || item.nombres,
            last_name: item.last_name || item.apellidos,
            ci,
            email: item.email,
            position: item.position || item.cargo,
            company_id: company.id,
            worker_code: item.worker_code || item.codigo,
            status: 'active'
          });
        }

        // AUDIT LOG
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: 'bulk_import_worker',
          entity_type: 'toe_workers',
          details: { ci, company_code: companyCode }
        });
      }

      successCount++;
    } catch (err: any) {
      errors.push({ row: item, message: err.message });
    }
  }

  revalidatePath('/lab');
  return { success: successCount, errors };
}
