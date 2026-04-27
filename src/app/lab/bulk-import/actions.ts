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

  // Pre-fetch only necessary data for this specific chunk if possible
  // For doses, we need companies and workers
  let allCompanies: any[] = [];
  let allWorkers: any[] = [];

  if (type === "doses" || type === "workers") {
    let fetchedAll = false;
    let offset = 0;
    const batchSize = 1000;
    allCompanies = [];

    while (!fetchedAll) {
      const { data: companies, error } = await adminSupabase
        .from("companies")
        .select("id, name, tax_id, company_code")
        .eq("tenant_id", tenantId)
        .range(offset, offset + batchSize - 1);
      
      if (error || !companies || companies.length === 0) {
        fetchedAll = true;
      } else {
        allCompanies = [...allCompanies, ...companies];
        offset += batchSize;
        if (companies.length < batchSize) fetchedAll = true;
      }
    }
  }

  if (type === "doses") {
    // Optimization: Join with companies to filter by tenant_id in a single query
    // This avoids the "URL too long" error when there are many companies (.in filter limit)
    let fetchedAll = false;
    let offset = 0;
    const batchSize = 1000;
    allWorkers = [];

    while (!fetchedAll) {
      const { data: workers, error } = await adminSupabase
        .from("toe_workers")
        .select("id, first_name, last_name, ci, company_id, companies!inner(tenant_id)")
        .eq("companies.tenant_id", tenantId)
        .range(offset, offset + batchSize - 1);
      
      if (error || !workers || workers.length === 0) {
        fetchedAll = true;
      } else {
        allWorkers = [...allWorkers, ...workers];
        offset += batchSize;
        if (workers.length < batchSize) fetchedAll = true;
      }
    }
  }

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
        
        const company = allCompanies.find(c => 
          (companyCode && c.company_code === companyCode.toString().trim()) || 
          (rif && (c.tax_id === rif.toString() || c.tax_id.replace(/[^0-9]/g, "") === rif.toString().replace(/[^0-9]/g, "")))
        );

        if (!company) throw new Error(`Empresa no vinculada.`);
        
        const normalizedCi = ci.toString().replace(/[-\s.]/g, "");
        const worker = allWorkers.find(w => 
          w.company_id === company.id && 
          (w.ci.toString() === ci.toString() || w.ci.toString().replace(/[-\s.]/g, "") === normalizedCi)
        );

        if (!worker) {
          // Check if worker exists in a different company of the same tenant
          const otherWorker = allWorkers.find(w => 
            (w.ci.toString() === ci.toString() || w.ci.toString().replace(/[-\s.]/g, "") === normalizedCi)
          );
          
          if (otherWorker) {
            const otherCompany = allCompanies.find(c => c.id === otherWorker.company_id);
            throw new Error(`El TOE con CI ${ci} existe, pero está vinculado a la empresa "${otherCompany?.name || 'otra'}" y no a "${company.name}".`);
          }
          throw new Error(`TOE con CI ${ci} no encontrado en la base de datos del laboratorio.`);
        }

        doseBatch.push({
          toe_worker_id: worker.id,
          month, year, hp10,
          hp007: parseFloat(getVal(["Hp007", "HP007"]) || "0"),
          hp3: parseFloat(getVal(["Hp3", "HP3"]) || "0"),
          hp10_neu: parseFloat(getVal(["Hp10_Neutrones", "hp10_neu"]) || "0"),
          hp007_ext: parseFloat(getVal(["Hp007_Extremidades", "hp007_ext"]) || "0"),
          status: "pending"
        });

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
        
        const company = allCompanies.find(c => 
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
      } else if (type === "companies") {
        const name = getVal(["Entidad", "nombre", "empresa", "name", "ENTIDAD"]);
        const rif = getVal(["RIF", "tax_id", "RIF EMPRESA", "rif"]);
        
        if (!name || !rif) throw new Error("Nombre y RIF son obligatorios.");

        const company_code = getVal(["Código", "codigo", "CODIGO", "CODIGO_INSTALACION"]) || `COM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        companyBatch.push({
          tenant_id: tenantId,
          name,
          tax_id: rif,
          tipo_rif: getVal(["Tipo RIF", "tipo_rif", "TIPO RIF"]),
          tipo: getVal(["Tipo", "tipo", "TIPO"]),
          sector: getVal(["Sector", "sector", "SECTOR"]),
          address: getVal(["Dirección", "direccion", "address", "DIRECCIÓN"]),
          state: getVal(["Estado", "estado", "state", "ESTADO"]),
          municipality: getVal(["Municipio", "municipio", "municipality", "MUNICIPIO"]),
          parish: getVal(["Parroquia", "parroquia", "parish", "PARROQUIA"]),
          email: getVal(["Email", "email", "EMAIL"]),
          phone_local: getVal(["Telf Local", "phone_local", "TELF LOCAL"]),
          phone_mobile: getVal(["Telf Movil", "phone_mobile", "TELF MÓVIL"]),
          rep_first_name: getVal(["OSR NOM", "rep_first_name", "Nombre OSR"]),
          rep_last_name: getVal(["OSR APE", "rep_last_name", "Apellido OSR"]),
          rep_ci: getVal(["OSR CI", "rep_ci", "Cédula OSR"]),
          rep_email: getVal(["OSR EMAIL", "rep_email", "Email OSR"]),
          rep_phone: getVal(["OSR TELF", "rep_phone", "Teléfono OSR"]),
          company_code,
          status: "active"
        });

        mapping.push({ Entidad: name, RIF: rif, Codigo: company_code });

        auditBatch.push({
          user_id: user.id, tenant_id: tenantId, action: "bulk_import_company",
          entity_type: "companies", details: { name, rif }
        });

        successCount++;
      }
    } catch (err: any) {
      errors.push({ row: item, message: err.message });
    }
  }

  // Flush everything
  if (doseBatch.length > 0) await adminSupabase.from("doses").insert(doseBatch);
  if (criticalBatch.length > 0) await adminSupabase.from("notifications").insert(criticalBatch);
  if (auditBatch.length > 0) await adminSupabase.from("audit_logs").insert(auditBatch);
  if (workerBatch.length > 0) await adminSupabase.from("toe_workers").upsert(workerBatch, { onConflict: "company_id,ci" });
  if (companyBatch.length > 0) await adminSupabase.from("companies").upsert(companyBatch, { onConflict: "tenant_id,company_code" });

  return { success: successCount, errors, mapping };
}
