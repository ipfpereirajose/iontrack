import { User, Search } from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";

export default async function NationalHistoryListWidget({
  ci,
  birth_year,
  year,
}: {
  ci?: string;
  birth_year?: string;
  year?: string;
}) {
  const supabase = getServiceSupabase();

  let query = supabase.from("national_dose_history").select("first_name, last_name, ci, sex, birth_year, birth_date, total_reports, total_hp10, total_hp3, last_report_month, last_report_year");

  if (ci) query = query.ilike("ci", `%${ci}%`);
  if (birth_year) query = query.eq("birth_year", birth_year);
  if (year) query = query.gte("last_report_year", year);

  const { data: records } = await query.order("total_hp10", {
    ascending: false,
  });

  return (
    <div className="clean-panel" style={{ padding: "0", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Trabajador (CI)</th>
              <th>Sexo</th>
              <th>Nacimiento</th>
              <th>Reportes</th>
              <th>Dosis Vida Hp(10)</th>
              <th>Dosis Vida Hp(3)</th>
              <th>Último Reporte</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {!records || records.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No se encontraron registros que coincidan con los criterios de búsqueda.
                </td>
              </tr>
            ) : (
              records.map((record: any) => (
                <tr key={record.ci}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={16} color="var(--primary-teal)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>
                          {record.first_name} {record.last_name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          CI: {record.ci}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{record.sex}</td>
                  <td>{record.birth_date ? record.birth_date.split('-').reverse().join('/') : record.birth_year}</td>
                  <td style={{ fontWeight: 700 }}>{record.total_reports}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        background: record.total_hp10 >= 20 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: record.total_hp10 >= 20 ? "var(--state-danger)" : "var(--state-safe)",
                      }}
                    >
                      {record.total_hp10.toFixed(4)} mSv
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{record.total_hp3.toFixed(4)}</td>
                  <td>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {record.last_report_month}/{record.last_report_year}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/national-history/${record.ci}`} className="btn" style={{ padding: "0.4rem", background: "#f1f5f9" }}>
                      <Search size={16} color="var(--primary-teal)" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
