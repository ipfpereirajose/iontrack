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

  for (const item of data) {
    try {
      if (type === "doses") {
        const ci =
          item["CI TRABAJADOR"] ||
          item.ci_trabajador ||
          item.CI ||
          item.ci ||
          item.cedula ||
          item.CEDULA;
        const tipoRif =
          item["tipo de rif"] || item.tipo_rif || item["TIPO RIF"] || "";
        let rif =
          item["RIF EMPRESA"] || item.rif_empresa || item.RIF || item.rif;

        // If tipoRif is provided separately and not already in the RIF, combine them
        if (tipoRif && rif && !rif.toString().startsWith(tipoRif)) {
          rif = `${tipoRif}${rif}`;
        }

        const monthInput = item.Mes || item.mes || item.month || "0";
        let month = parseInt(monthInput);

        if (isNaN(month) || month === 0) {
          const monthsMap: { [key: string]: number } = {
            enero: 1,
            febrero: 2,
            marzo: 3,
            abril: 4,
            mayo: 5,
            junio: 6,
            julio: 7,
            agosto: 8,
            septiembre: 9,
            octubre: 10,
            noviembre: 11,
            diciembre: 12,
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
            july: 7,
            august: 8,
            september: 9,
            october: 10,
            november: 11,
            december: 12,
          };
          month = monthsMap[monthInput.toString().toLowerCase()] || 0;
        }

        const year = parseInt(item.Año || item.año || item.year || "0");

        if (!ci || !rif) {
          throw new Error(
            "Faltan campos críticos: se requiere 'RIF EMPRESA' y 'CI TRABAJADOR'.",
          );
        }

        const hp10 = parseFloat(item.Hp10 || item.hp10 || item.HP10 || "0");
        const hp007 = parseFloat(
          item.Hp007 || item.hp007 || item.HP007 || item["Hp0.07"] || "0",
        );
        const hp3 = parseFloat(
          item.Hp3 || item.hp3 || item.HP3 || item["Hp0.3"] || "0",
        );
        const hp10_neu = parseFloat(
          item.Hp10_Neutrones || item.hp10_neu || item.neutrones || "0",
        );
        const hp007_ext = parseFloat(
          item.Hp007_Extremidades || item.hp007_ext || item.extremidades || "0",
        );

        // 1. Find the company (Try exact match first, then normalized)
        let { data: company } = await adminSupabase
          .from("companies")
          .select("id, name, tax_id")
          .eq("tax_id", rif)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (!company) {
          // Normalization: Remove dashes and spaces
          const normalizedRif = rif.toString().replace(/[-\s]/g, "");
          const { data: allCompanies } = await adminSupabase
            .from("companies")
            .select("id, name, tax_id")
            .eq("tenant_id", tenantId);

          company =
            allCompanies?.find(
              (c) => c.tax_id.replace(/[-\s]/g, "") === normalizedRif,
            ) || null;
        }

        if (!company) throw new Error(`Empresa con RIF ${rif} no encontrada.`);

        // 2. Find the worker (Also try exact then normalized CI)
        let { data: worker } = (await adminSupabase
          .from("toe_workers")
          .select("id, first_name, last_name, ci")
          .eq("ci", ci)
          .eq("company_id", company.id)
          .maybeSingle()) as any;

        if (!worker) {
          const normalizedCi = ci.toString().replace(/[-\s.]/g, "");
          const { data: allWorkers } = await adminSupabase
            .from("toe_workers")
            .select("id, first_name, last_name, ci")
            .eq("company_id", company.id);

          worker =
            allWorkers?.find(
              (w) => w.ci.toString().replace(/[-\s.]/g, "") === normalizedCi,
            ) || null;
        }

        if (!worker)
          throw new Error(
            `Trabajador con CI ${ci} no encontrado en la empresa ${company.name}.`,
          );

        // 3. Insert Dose
        const { error: doseError, data: doseData } = await adminSupabase
          .from("doses")
          .insert({
            toe_worker_id: worker.id,
            month,
            year,
            hp10,
            hp007,
            hp3,
            hp10_neu,
            hp007_ext,
            status: "approved",
          })
          .select()
          .single();

        if (doseError) throw new Error(doseError.message);

        // 4. Trigger Alerts
        await triggerDoseAlerts(
          tenantId,
          company.id,
          worker.id,
          hp10,
          month,
          year,
          `${worker.first_name} ${worker.last_name}`,
          company.name,
          doseData.id,
        );

        // 5. Audit Log
        await adminSupabase.from("audit_logs").insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: "bulk_import_dose",
          entity_type: "doses",
          entity_id: doseData.id,
          details: { ci, rif, hp10, month, year },
        });
      } else if (type === "workers") {
        const ci =
          item.CI || item.ci || item.cedula || item.CEDULA || item["Cédula"];

        // Robust RIF pickup (checks common header names)
        const companyRif =
          item["RIF EMPRESA"] ||
          item["rif empresa"] ||
          item["RIF_EMPRESA"] ||
          item.rif_empresa ||
          item.RIF ||
          item.rif ||
          item.tax_id ||
          item.company_code ||
          item.codigo_empresa;

        const firstName = item.Nombre || item.nombre || item.first_name;
        const lastName = item.Apellido || item.apellido || item.last_name;
        const sex = item.Sexo || item.sexo || item.sex;
        const birthYear =
          item["Año de nacimiento"] || item.birth_year || item.anio_nacimiento;
        const position = (item.Cargo || item.cargo || "").trim();
        const practice = (
          item.Practica ||
          item.practica ||
          item["practica que realiza"] ||
          ""
        ).trim();

        // VALIDATION: Only require non-empty values (bulk import accepts free-form cargo/practica)
        if (!position) {
          throw new Error(`Falta el campo "Cargo" en la fila.`);
        }
        if (!practice) {
          throw new Error(`Falta el campo "Practica" en la fila.`);
        }

        if (!companyRif) {
          throw new Error(
            "No se detectó la columna de RIF. Asegúrese de que su archivo tenga una columna llamada 'RIF' o 'RIF EMPRESA'.",
          );
        }

        const { data: company } = await adminSupabase
          .from("companies")
          .select("id")
          .eq("tax_id", companyRif)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (!company)
          throw new Error(
            `Empresa con RIF ${companyRif} no encontrada. Asegúrese de que la empresa esté registrada previamente.`,
          );

        const { data: existingWorker } = await adminSupabase
          .from("toe_workers")
          .select("id")
          .eq("ci", ci)
          .eq("company_id", company.id)
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
          worker_code:
            item.worker_code ||
            item.codigo_toe ||
            `TOE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          status: "active",
        };

        if (existingWorker) {
          const { error: updErr } = await adminSupabase
            .from("toe_workers")
            .update(workerData)
            .eq("id", existingWorker.id);
          if (updErr)
            throw new Error(`Error actualizando TOE: ${updErr.message}`);
        } else {
          const { error: insErr } = await adminSupabase
            .from("toe_workers")
            .insert(workerData);
          if (insErr)
            throw new Error(`Error insertando TOE: ${insErr.message}`);
        }

        // AUDIT LOG
        await adminSupabase.from("audit_logs").insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: "bulk_import_worker",
          entity_type: "toe_workers",
          details: { ci, company_rif: companyRif },
        });
      } else if (type === "companies") {
        const taxId =
          item.RIF ||
          item.rif ||
          item["RIF EMPRESA"] ||
          item.tax_id ||
          item.rif_empresa;

        const name = item.ENTIDAD || item.entidad || item.name;
        const address = item.DIRECCIÓN || item.direccion || item.address;
        const state = item.ESTADO || item.estado || item.state;
        const municipality =
          item.MUNICIPIO || item.municipio || item.municipality;
        const parish = item.PARROQUIA || item.parroquia || item.parish;

        if (!taxId) {
          throw new Error(
            "No se detectó la columna de RIF. Asegúrese de que su archivo tenga una columna llamada 'RIF'.",
          );
        }

        // Check if this exact branch exists
        const { data: existingBranch } = await adminSupabase
          .from("companies")
          .select("id")
          .eq("tax_id", taxId)
          .eq("address", address)
          .eq("state", state)
          .eq("municipality", municipality)
          .eq("parish", parish)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        const companyData = {
          tenant_id: tenantId,
          name,
          tipo_rif: item["TIPO RIF"] || item.tipo_rif,
          tax_id: taxId,
          tipo: item.TIPO || item.tipo,
          sector: item.SECTOR || item.sector,
          address,
          state,
          municipality,
          parish,
          email: item["EMAIL EMPRESA"] || item.EMAIL || item.email,
          phone_local: item["TELF LOCAL"] || item.telf_local,
          phone_mobile: item["TELF MÓVIL"] || item.telf_movil,
          rep_first_name: item["OSR NOM"] || item.osr_nom,
          rep_last_name: item["OSR APE"] || item.osr_ape,
          osr_nac: item["OSR NAC"] || item.osr_nac,
          rep_ci: item["OSR CI"] || item.osr_ci,
          rep_email: item["OSR EMAIL"] || item.osr_email,
          rep_phone: item["OSR TELF"] || item.osr_telf,
          status: "active",
        };

        if (existingBranch) {
          const { error: updErr } = await adminSupabase
            .from("companies")
            .update(companyData)
            .eq("id", existingBranch.id);
          if (updErr)
            throw new Error(`Error al actualizar empresa: ${updErr.message}`);
        } else {
          const companyCode =
            item.codigo ||
            `EMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
          const { error: insErr } = await adminSupabase
            .from("companies")
            .insert({ ...companyData, company_code: companyCode });
          if (insErr)
            throw new Error(`Error al insertar empresa: ${insErr.message}`);
        }

        // AUDIT LOG
        await adminSupabase.from("audit_logs").insert({
          user_id: user.id,
          tenant_id: tenantId,
          action: "bulk_import_company",
          entity_type: "companies",
          details: { name, tax_id: taxId, branch: address },
        });
      }

      successCount++;
    } catch (err: any) {
      errors.push({ row: item, message: err.message });
    }
  }

  revalidatePath("/lab");
  return { success: successCount, errors };
}
