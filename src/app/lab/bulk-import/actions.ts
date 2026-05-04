"use server";

import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * Accion de servidor para procesar importaciones masivas de empresas, trabajadores y dosis.
 */
export async function bulkImportAction(type: string, data: any[]) {
  const supabase = await createClient();
  const adminSupabase = getServiceSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión expirada.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil no encontrado.");

  const tenantId = profile.tenant_id;
  let successCount = 0;
  const errors: any[] = [];
  const mapping: any[] = [];

  // 1. Pre-carga de datos
  let allCompanies: any[] = [];
  let allWorkers: any[] = [];

  if (type === "doses" || type === "workers") {
    let results: any[] = [];
    let fetchedAll = false;
    let offset = 0;
    const batchSize = 1000;
    while (!fetchedAll) {
      const { data, error } = await adminSupabase
        .from("companies")
        .select("id, name, tax_id, company_code")
        .eq("tenant_id", tenantId)
        .range(offset, offset + batchSize - 1);
      if (error || !data || data.length === 0) fetchedAll = true;
      else { results = [...results, ...data]; offset += batchSize; if (data.length < batchSize) fetchedAll = true; }
    }
    allCompanies = results;
  }

  if (type === "doses") {
    let results: any[] = [];
    let fetchedAll = false;
    let offset = 0;
    const batchSize = 1000;
    while (!fetchedAll) {
      const { data, error } = await adminSupabase
        .from("toe_workers")
        .select("id, ci, company_id, companies!inner(tenant_id)")
        .eq("companies.tenant_id", tenantId)
        .range(offset, offset + batchSize - 1);
      if (error || !data || data.length === 0) fetchedAll = true;
      else { results = [...results, ...data]; offset += batchSize; if (data.length < batchSize) fetchedAll = true; }
    }
    allWorkers = results;
  }

  const doseBatch: any[] = [];
  const workerBatch: any[] = [];
  const companyBatch: any[] = [];
  const auditBatch: any[] = [];

  const parseMonth = (val: any): number => {
    if (!val) return 0;
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1 && n <= 12) return n;
    const monthsMap: Record<string, number> = {
      enero: 1, ene: 1, febrero: 2, feb: 2, marzo: 3, mar: 3, abril: 4, abr: 4, mayo: 5, may: 5,
      junio: 6, jun: 6, julio: 7, jul: 7, agosto: 8, ago: 8, septiembre: 9, sep: 9, octubre: 10, oct: 10,
      noviembre: 11, nov: 11, diciembre: 12, dic: 12
    };
    return monthsMap[val.toString().toLowerCase().trim()] || 0;
  };

  const parseDate = (val: any): string | null => {
    if (!val) return null;
    
    // Si ya es un objeto Date
    if (val instanceof Date) return val.toISOString().split('T')[0];

    // Si es un número (Excel serial date)
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }

    const str = val.toString().trim();
    
    // Intentar formato DD/MM/AAAA
    const parts = str.split(/[\/\-]/);
    if (parts.length === 3) {
      // Caso DD/MM/AAAA o AAAA/MM/DD
      if (parts[0].length === 4) { // AAAA/MM/DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) { // DD/MM/AAAA
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // Fallback al constructor de Date
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

    return null;
  };

  // 2. Procesamiento de filas
  for (const [index, item] of data.entries()) {
    try {
      const getVal = (keys: string[]) => {
        for (const k of keys) {
          const foundKey = Object.keys(item).find(key => key.toLowerCase().trim() === k.toLowerCase().trim());
          if (foundKey) return item[foundKey];
        }
        return null;
      };

      if (type === "doses") {
        const ci = getVal(["CI TRABAJADOR", "TRABAJADOR", "TRABAJAD", "CI", "cedula"]);
        const rif = getVal(["RIF EMPRESA", "RIF", "rif"]);
        const companyCode = getVal(["CODIGO_INSTALACION", "O_INSTAL", "INSTALACION", "CODIGO", "company_code"]);
        const monthInput = getVal(["Mes", "month", "mes"]) || item.month;
        const yearInput = getVal(["Año", "año", "year"]) || item.year;
        const hp10 = parseFloat(getVal(["Hp10", "HP10"]) || "0");

        if (!ci || (!rif && !companyCode) || !monthInput || !yearInput) throw new Error("Faltan datos.");
        const month = parseMonth(monthInput);
        if (month === 0) throw new Error(`Mes inválido: ${monthInput}`);

        const company = allCompanies.find(c => 
          (companyCode && c.company_code === companyCode.toString().trim()) ||
          (rif && (c.tax_id === rif.toString().trim() || c.tax_id.replace(/[^0-9]/g, "") === rif.toString().replace(/[^0-9]/g, "")))
        );
        if (!company) throw new Error(`Empresa no encontrada.`);
        
        const normalizedCi = ci.toString().replace(/[-\s.]/g, "");
        const worker = allWorkers.find(w => w.company_id === company.id && w.ci.toString().replace(/[-\s.]/g, "") === normalizedCi);
        if (!worker) throw new Error(`Trabajador no encontrado.`);

        doseBatch.push({
          toe_worker_id: worker.id, month, year: parseInt(yearInput),
          periodo: `${month.toString().padStart(2, '0')}-${yearInput}`,
          hp10, 
          hp007: parseFloat(getVal(["Hp007", "HP007"]) || "0"), 
          hp3: parseFloat(getVal(["Hp3", "HP3"]) || "0"),
          hp10_neu: parseFloat(getVal(["Hp10_Neutrones", "10_Neutro", "HP10_NEUTRONES"]) || "0"), 
          hp007_ext: parseFloat(getVal(["Hp007_Extremidades", "7_Extremic", "HP007_EXTREMIDADES"]) || "0"),
          status: "pending"
        });
      } 
      else if (type === "workers") {
        const ci = getVal(["CI", "CI TRABAJADOR", "TRABAJADOR", "cedula"]);
        const rif = getVal(["RIF EMPRESA", "RIF", "rif"]);
        const companyCode = getVal(["CODIGO_INSTALACION", "O_INSTAL", "INSTALACION", "CODIGO", "company_code"]);
        const first_name = getVal(["Nombre", "nombre", "NOMBRE"]);
        const last_name = getVal(["Apellido", "apellido", "APELLIDO"]);

        if (!ci || (!rif && !companyCode) || !first_name || !last_name) throw new Error("Faltan datos.");
        const company = allCompanies.find(c => 
          (companyCode && c.company_code === companyCode.toString().trim()) ||
          (rif && (c.tax_id === rif.toString().trim() || c.tax_id.replace(/[^0-9]/g, "") === rif.toString().replace(/[^0-9]/g, "")))
        );
        if (!company) throw new Error(`Empresa no encontrada.`);

        workerBatch.push({
          company_id: company.id, 
          ci: ci.toString().trim(), 
          first_name: first_name.toString().trim(), 
          last_name: last_name.toString().trim(),
          sex: (getVal(["Sexo", "sex", "SEXO"]) || "M").toString().toUpperCase().charAt(0), 
          position: (getVal(["Cargo", "CARGO"]) || "").trim(),
          practice: (getVal(["Practica", "PRACTICA", "Práctica"]) || "").trim(), 
          birth_date: parseDate(getVal(["Fecha de nacimiento", "a de nacim", "nacimiento", "birth_date"])),
          status: "active"
        });
      }
      else if (type === "companies") {
        const name = getVal(["Entidad", "nombre", "empresa", "name", "ENTIDAD"]);
        const rif = getVal(["RIF", "tax_id", "RIF EMPRESA", "rif"]);
        if (!name || !rif) throw new Error("Nombre y RIF son obligatorios.");

        // Intentar obtener el código del programa si viene en el archivo
        let company_code = getVal(["CODIGO_INSTALACION", "CODIGO", "company_code", "ID"]);
        
        // Si no existe, generamos uno nuevo (ID único que da el programa)
        if (!company_code) {
          company_code = `COM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        }

        const address = (getVal(["Dirección", "direccion", "address", "DIRECCION FISCAL"]) || "").toString().trim();
        const state = (getVal(["Estado", "estado", "ESTADO"]) || "").toString().trim();
        const municipality = (getVal(["Municipio", "municipio", "MUNICIPIO"]) || "").toString().trim();
        const parish = (getVal(["Parroquia", "parroquia", "PARROQUIA"]) || "").toString().trim();

        companyBatch.push({
          tenant_id: tenantId, 
          name: name.toString().trim(), 
          tax_id: rif.toString().trim(), 
          company_code: company_code.toString().trim(),
          tipo_rif: getVal(["Tipo RIF", "tipo_rif"]), 
          tipo: getVal(["Tipo", "tipo"]), 
          sector: getVal(["Sector", "sector"]),
          address, 
          state,
          municipality, 
          parish,
          email: getVal(["Email", "email"]), 
          phone_local: getVal(["Telf Local"]), 
          phone_mobile: getVal(["Telf Movil"]),
          rep_first_name: getVal(["OSR NOM", "Nombre OSR"]), 
          rep_last_name: getVal(["OSR APE", "Apellido OSR"]),
          rep_ci: getVal(["OSR CI", "Cédula OSR"]), 
          rep_email: getVal(["OSR EMAIL", "Email OSR"]),
          rep_phone: getVal(["OSR TELF", "Teléfono OSR"]), 
          status: "active"
        });
        mapping.push({ Entidad: name, RIF: rif, Codigo: company_code });
      }
    } catch (err: any) {
      errors.push({ index: index + 1, message: err.message });
    }
  }

  // 3. Inserción
  try {
    if (workerBatch.length > 0) {
      const { error } = await adminSupabase.from("toe_workers").upsert(workerBatch, { onConflict: "company_id,ci" });
      if (error) throw error;
      successCount = workerBatch.length;
      auditBatch.push({ user_id: user.id, tenant_id: tenantId, action: "bulk_import_workers", details: { count: successCount } });
    }
    if (doseBatch.length > 0) {
      const { error } = await adminSupabase.from("doses").insert(doseBatch);
      if (error) throw error;
      successCount = doseBatch.length;
      auditBatch.push({ user_id: user.id, tenant_id: tenantId, action: "bulk_import_doses", details: { count: successCount } });
    }
    if (companyBatch.length > 0) {
      const { error } = await adminSupabase.from("companies").upsert(companyBatch, { onConflict: "tenant_id,tax_id,address,state,municipality,parish" });
      if (error) throw error;
      successCount = companyBatch.length;
      auditBatch.push({ user_id: user.id, tenant_id: tenantId, action: "bulk_import_companies", details: { count: successCount } });
    }
    if (auditBatch.length > 0) await adminSupabase.from("audit_logs").insert(auditBatch);
  } catch (err: any) {
    errors.push({ message: `Error DB: ${err.message}` });
    successCount = 0;
  }

  revalidatePath("/lab/toe-consultation");
  return { success: successCount, errors, mapping };
}

