'use server';

import { createClient } from '@/utils/supabase/server';
import { getServiceSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { triggerDoseAlerts } from '@/lib/notifications';
import standards from '@/data/professional_standards.json';

export async function bulkImportAction(type: string, data: any[]) {
  const supabase = await createClient();
  const adminSupabase = getServiceSupabase();

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
          .select('id, first_name, last_name, company_id, companies!inner(name, company_code)')
          .eq('worker_code', workerCode)
          .eq('companies.company_code', companyCode)
          .eq('companies.tenant_id', tenantId)
          .maybeSingle();

        if (!worker) throw new Error(`Trabajador con ID ${traceId} no encontrado`);

        const hp10 = parseFloat(item['Mes Hp(10) (mSv)'] || item.hp10 || 0);
        const hp007 = parseFloat(item['Mes Hp(0,07) (mSv)'] || item.hp007 || 0);
        const hp007_ext = parseFloat(item['Mes Hp(0,07) (mSv) Extremidades'] || item.hp007_ext || 0);
        const hp3 = parseFloat(item['Mes Hp(3) (mSv)'] || item.hp3 || 0);
        const hp10_neu = parseFloat(item['Mes Hp(10) (mSv) Neutrones'] || item.hp10_neu || 0);

        const monthStr = item.month || item.mes || (item.Periodo ? item.Periodo.split('-')[0] : '0');
        const yearStr = item.year || item.anio || (item.Periodo ? item.Periodo.split('-')[1] : '0');
        
        const month = parseInt(monthStr);
        const year = parseInt(yearStr);

        // Insert Dose
        const { error: doseError } = await supabase
          .from('doses')
          .insert({
            toe_worker_id: worker.id,
            hp10,
            hp007,
            hp007_ext,
            hp3,
            hp10_neu,
            month,
            year,
            periodo: item.Periodo || `${month}-${year}`,
            observacion: item.Observación || item.observacion,
            status: 'pending'
          });

        if (doseError) throw doseError;

        // TRIGGER AUTOMATED ALERTS
        await triggerDoseAlerts(
          tenantId,
          worker.company_id,
          worker.id,
          hp10,
          month,
          year,
          `${worker.first_name} ${worker.last_name}`,
          Array.isArray(worker.companies) ? worker.companies[0].name : (worker.companies as any).name
        );

        // AUDIT LOG
        await adminSupabase.from('audit_logs').insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: 'bulk_import_dose',
          entity_type: 'doses',
          entity_id: worker.id,
          details: { trace_id: traceId, hp10: item.hp10, month: item.month, year: item.year }
        });

      } else if (type === 'workers') {
        const ci = item.CI || item.ci || item.cedula;
        const companyCode = item.company_code || item.codigo_empresa || item.codigo;
        const firstName = item.Nombre || item.nombre || item.first_name;
        const lastName = item.Apellido || item.apellido || item.last_name;
        const sex = item.Sexo || item.sexo || item.sex;
        const birthYear = item['Año de nacimiento'] || item.birth_year || item.anio_nacimiento;
        const position = (item.Cargo || item.cargo || '').trim();
        const practice = (item.Practica || item.practica || item['practica que realiza'] || '').trim();

        // VALIDATION: Positions & Practices
        const isValidPosition = standards.cargos.some(c => c.toLowerCase() === position.toLowerCase());
        const isValidPractice = standards.practicas.some(p => p.toLowerCase() === practice.toLowerCase());

        if (!isValidPosition) {
          throw new Error(`Cargo "${position}" no reconocido. Use valores como: ${standards.cargos.slice(0, 3).join(', ')}...`);
        }
        if (!isValidPractice) {
          throw new Error(`Práctica "${practice}" no reconocida. Use valores como: ${standards.practicas.slice(0, 3).join(', ')}...`);
        }

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('company_code', companyCode)
          .eq('tenant_id', tenantId)
          .maybeSingle();

        if (!company) throw new Error(`Empresa con código ${companyCode} no encontrada`);

        const { data: existingWorker } = await supabase
          .from('toe_workers')
          .select('id')
          .eq('ci', ci)
          .eq('company_id', company.id)
          .maybeSingle();

        const workerData = {
          company_id: company.id,
          first_name: firstName,
          last_name: lastName,
          ci,
          sex,
          birth_year: parseInt(birthYear),
          position,
          practice,
          worker_code: item.worker_code || item.codigo_toe,
          status: 'active'
        };

        if (existingWorker) {
          const { error: updErr } = await adminSupabase.from('toe_workers').update(workerData).eq('id', existingWorker.id);
          if (updErr) throw new Error(`Error actualizando TOE: ${updErr.message}`);
        } else {
          const { error: insErr } = await adminSupabase.from('toe_workers').insert(workerData);
          if (insErr) throw new Error(`Error insertando TOE: ${insErr.message}`);
        }

        // AUDIT LOG
        await adminSupabase.from('audit_logs').insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: 'bulk_import_worker',
          entity_type: 'toe_workers',
          details: { ci, company_code: companyCode }
        });
      } else if (type === 'companies') {
        const taxId = item.RIF || item.rif || item.tax_id;
        const name = item.ENTIDAD || item.entidad || item.name;
        const address = item.DIRECCIÓN || item.direccion || item.address;
        const state = item.ESTADO || item.estado || item.state;
        const municipality = item.MUNICIPIO || item.municipio || item.municipality;
        const parish = item.PARROQUIA || item.parroquia || item.parish;

        // Check if this exact branch exists
        const { data: existingBranch } = await adminSupabase
          .from('companies')
          .select('id')
          .eq('tax_id', taxId)
          .eq('address', address)
          .eq('state', state)
          .eq('municipality', municipality)
          .eq('parish', parish)
          .eq('tenant_id', tenantId)
          .maybeSingle();

        const companyData = {
          tenant_id: tenantId,
          name,
          tipo_rif: item['TIPO RIF'] || item.tipo_rif,
          tax_id: taxId,
          tipo: item.TIPO || item.tipo,
          sector: item.SECTOR || item.sector,
          address,
          state,
          municipality,
          parish,
          email: item['EMAIL EMPRESA'] || item.EMAIL || item.email,
          phone_local: item['TELF LOCAL'] || item.telf_local,
          phone_mobile: item['TELF MÓVIL'] || item.telf_movil,
          rep_first_name: item['OSR NOM'] || item.osr_nom,
          rep_last_name: item['OSR APE'] || item.osr_ape,
          osr_nac: item['OSR NAC'] || item.osr_nac,
          rep_ci: item['OSR CI'] || item.osr_ci,
          rep_email: item['OSR EMAIL'] || item.osr_email,
          rep_phone: item['OSR TELF'] || item.osr_telf,
          status: 'active'
        };

        if (existingBranch) {
          const { error: updErr } = await adminSupabase.from('companies').update(companyData).eq('id', existingBranch.id);
          if (updErr) throw new Error(`Error al actualizar empresa: ${updErr.message}`);
        } else {
          const companyCode = item.codigo || `EMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
          const { error: insErr } = await adminSupabase.from('companies').insert({ ...companyData, company_code: companyCode });
          if (insErr) throw new Error(`Error al insertar empresa: ${insErr.message}`);
        }

        // AUDIT LOG
        await adminSupabase.from('audit_logs').insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: 'bulk_import_company',
          entity_type: 'companies',
          details: { name, tax_id: taxId, branch: address }
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
