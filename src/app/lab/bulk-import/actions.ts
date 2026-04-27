"use server";

import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { triggerDoseAlerts } from "@/lib/notifications";
import standards from "@/data/professional_standards.json";

export async function bulkImportAction(type: string, data: any[]) {
  const supabase = await createClient();
  const adminSupabase = getServiceSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil no encontrado");

  const tenantId = profile.tenant_id;
  let successCount = 0;
  const errors = [];
  const mapping: any[] = [];

  // Pre-fetch all companies for the tenant to avoid thousands of queries
  const { data: allCompanies } = await adminSupabase
    .from("companies")
    .select("id, name, tax_id, company_code")
    .eq("tenant_id", tenantId);

  // Pre-fetch all workers for this tenant's companies to avoid thousands of queries
  const { data: allWorkers } = await adminSupabase
    .from("toe_workers")
    .select("id, first_name, last_name, ci, company_id")
    .in("company_id", allCompanies?.map(c => c.id) || []);

  const batchSize = 1000;
  const doseBatch: any[] = [];
  const workerBatch: any[] = [];
  const companyBatch: any[] = [];
  const auditBatch: any[] = [];
  const criticalBatch: any[] = [];

  for (const item of data) {
    try {
      const getVal = (keys: string[]) => {
        for (const k of keys) {
          const foundKey = Object.keys(item).find(key => key.toLowerCase() === k.toLowerCase());
          if (foundKey) return item[foundKey];
        }
        return null;
      };

      if (type === "doses") {
        const ci = getVal(["CI TRABAJADOR", "ci_trabajador", "CI", "cedula", "CEDULA"]);
        const companyCode = getVal(["CÓDIGO EMPRESA", "codigo_empresa", "CODIGO_INSTALACION", "CODIGO", "company_code"]);
        const rif = getVal(["RIF EMPRESA", "rif_empresa", "RIF", "rif"]);
        const monthInput = getVal(["Mes", "month", "mes"]) || item.month || "0";
        let month = parseInt(monthInput);

        if (isNaN(month)) {
          const monthsMap: Record<string, number> = {
            enero: 1, january: 1, ene: 1, jan: 1, febrero: 2, february: 2, feb: 2,
            marzo: 3, march: 3, mar: 3, abril: 4, april: 4, abr: 4, mayo: 5, may: 5,
            junio: 6, june: 6, jun: 6, julio: 7, july: 7, jul: 7, agosto: 8, august: 8, ago: 8,
            septiembre: 9, september: 9, sep: 9, octubre: 10, october: 10, oct: 10,
            noviembre: 11, november: 11, nov: 11, diciembre: 12, december: 12, dic: 12
          };
          month = monthsMap[monthInput.toString().toLowerCase().trim()] || 0;
        }

        const year = parseInt(getVal(["Año", "año", "year"]) || "0");
        const hp10 = parseFloat(getVal(["Hp10", "HP10"]) || "0");
        
        // Find company & worker from pre-fetched lists
        const company = allCompanies?.find(c => 
          (companyCode && c.company_code === companyCode.toString().trim()) || 
          (rif && (c.tax_id === rif.toString() || c.tax_id.replace(/[^0-9]/g, "") === rif.toString().replace(/[^0-9]/g, "")))
        );

        if (!company) throw new Error(`Empresa no encontrada.`);
        
        const normalizedCi = ci.toString().replace(/[-\s.]/g, "");
        const worker = allWorkers?.find(w => 
          w.company_id === company.id && 
          (w.ci.toString() === ci.toString() || w.ci.toString().replace(/[-\s.]/g, "") === normalizedCi)
        );

        if (!worker) throw new Error(`TOE con CI ${ci} no encontrado.`);

        doseBatch.push({
          toe_worker_id: worker.id,
          month, year, hp10,
          hp007: parseFloat(getVal(["Hp007", "HP007"]) || "0"),
          hp3: parseFloat(getVal(["Hp3", "HP3"]) || "0"),
          hp10_neu: parseFloat(getVal(["Hp10_Neutrones", "hp10_neu"]) || "0"),
          hp007_ext: parseFloat(getVal(["Hp007_Extremidades", "hp007_ext"]) || "0"),
          status: "pending"
        });

        // Track critical doses for bulk notification
        if (hp10 >= 1.28) {
          criticalBatch.push({
            tenant_id: tenantId,
            company_id: company.id,
            type: "threshold_alert",
            message: `ALERTA CRÍTICA: ${worker.first_name} ${worker.last_name} superó el 80% del límite mensual (${hp10} mSv).`
          });
        }

        auditBatch.push({
          user_id: user.id, tenant_id: tenantId, action: "bulk_import_dose",
          entity_type: "doses", details: { ci, month, year, hp10 }
        });

        successCount++;
      } else if (type === "workers") {
        const ci = getVal(["CI", "cedula", "CEDULA", "CI TRABAJADOR"]);
        const rif = getVal(["RIF EMPRESA", "RIF", "rif"]);
        const companyCode = getVal(["CÓDIGO EMPRESA", "CODIGO", "CODIGO_INSTALACION"]);
        
        const company = allCompanies?.find(c => 
          (companyCode && c.company_code === companyCode.toString().trim()) || 
          (rif && (c.tax_id === rif.toString() || c.tax_id.replace(/[^0-9]/g, "") === rif.toString().replace(/[^0-9]/g, "")))
        );

        if (!company) throw new Error("Empresa no vinculada.");

        workerBatch.push({
          company_id: company.id,
          ci,
          first_name: getVal(["Nombre", "nombre", "first_name"]),
          last_name: getVal(["Apellido", "apellido", "last_name"]),
          sex: getVal(["Sexo", "sex"]),
          birth_year: parseInt(getVal(["Año de nacimiento", "birth_year"]) || "0"),
          position: (getVal(["Cargo", "position"]) || "").trim(),
          practice: (getVal(["Practica", "practice"]) || "").trim(),
          worker_code: getVal(["worker_code", "codigo_toe"]) || `TOE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          status: "active"
        });

        successCount++;
      }

      // Execute batches
      if (doseBatch.length >= batchSize) {
        await adminSupabase.from("doses").insert(doseBatch);
        if (criticalBatch.length > 0) await adminSupabase.from("notifications").insert(criticalBatch);
        await adminSupabase.from("audit_logs").insert(auditBatch);
        doseBatch.length = 0; auditBatch.length = 0; criticalBatch.length = 0;
      }
      if (workerBatch.length >= batchSize) {
        await adminSupabase.from("toe_workers").upsert(workerBatch, { onConflict: "company_id,ci" });
        workerBatch.length = 0;
      }
    } catch (err: any) {
      errors.push({ row: item, message: err.message });
    }
  }

  // Final Flush
  if (doseBatch.length > 0) await adminSupabase.from("doses").insert(doseBatch);
  if (criticalBatch.length > 0) await adminSupabase.from("notifications").insert(criticalBatch);
  if (auditBatch.length > 0) await adminSupabase.from("audit_logs").insert(auditBatch);
  if (workerBatch.length > 0) await adminSupabase.from("toe_workers").upsert(workerBatch, { onConflict: "company_id,ci" });

  revalidatePath("/lab");
  return { success: successCount, errors, mapping };
}
