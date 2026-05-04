import { Filter } from "lucide-react";
import { Suspense } from "react";
import NationalHistoryListWidget from "@/components/admin/national-history/NationalHistoryListWidget";

export default async function NationalHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ ci?: string; birth_year?: string; year?: string }>;
}) {
  const { ci, birth_year, year } = await searchParams;

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Historial Nacional de Dosis Vida
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Consolidación de exposición radiológica por Cédula de Identidad a nivel nacional.
        </p>
      </header>

      {/* FILTERS */}
      <div className="clean-panel" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <form
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "1.5rem",
            alignItems: "flex-end",
          }}
        >
          <div className="input-group">
            <label style={labelStyle}>Cédula (CI)</label>
            <input
              name="ci"
              placeholder="Ej: 12345678"
              defaultValue={ci}
              style={inputStyle}
            />
          </div>
          <div className="input-group">
            <label style={labelStyle}>Año de Nacimiento</label>
            <input
              name="birth_year"
              type="number"
              placeholder="Ej: 1985"
              defaultValue={birth_year}
              style={inputStyle}
            />
          </div>
          <div className="input-group">
            <label style={labelStyle}>Desde el Año (Dosis)</label>
            <input
              name="year"
              type="number"
              placeholder="Ej: 2020"
              defaultValue={year}
              style={inputStyle}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
            <Filter size={18} /> Filtrar
          </button>
        </form>
      </div>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando historial nacional...</div>}>
        <NationalHistoryListWidget ci={ci} birth_year={birth_year} year={year} />
      </Suspense>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 900,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: "0.5rem",
} as any;
const inputStyle = {
  width: "100%",
  padding: "0.6rem 1rem",
  background: "#f8fafc",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "0.9rem",
  fontWeight: 600,
} as any;
