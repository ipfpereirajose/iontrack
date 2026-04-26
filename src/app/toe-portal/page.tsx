"use client";

import { useState } from "react";
import {
  User,
  Shield,
  Search,
  Calendar,
  Activity,
  ArrowRight,
  Download,
} from "lucide-react";

export default function ToePortal() {
  const [ci, setCi] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // In a real app, this would be a server action or API call
    const res = await fetch(`/api/toe/check?ci=${ci}&birth_year=${birthYear}`);
    const result = await res.json();

    setLoading(false);
    if (result.error) {
      setError(
        "Credenciales no válidas. Verifique su Cédula y Año de Nacimiento.",
      );
    } else {
      setData(result);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "4rem auto" }}>
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "1rem",
              background: "var(--primary-teal)",
              borderRadius: "20px",
              color: "white",
              marginBottom: "1.5rem",
            }}
          >
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>
            Portal del Trabajador TOE
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Consulte su dosis mensual y su historial acumulado.
          </p>
        </header>

        {!data ? (
          <div className="clean-panel">
            <form
              onSubmit={handleLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div className="input-group">
                <label style={labelStyle}>Cédula de Identidad (CI)</label>
                <input
                  required
                  placeholder="Ej: 12345678"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="input-group">
                <label style={labelStyle}>Año de Nacimiento</label>
                <input
                  required
                  type="number"
                  placeholder="Ej: 1985"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {error && (
                <p
                  style={{
                    color: "var(--state-danger)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "1rem" }}
              >
                {loading ? "Buscando..." : "Acceder a mi Historial"}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* WELCOME */}
            <div
              className="clean-panel"
              style={{ background: "var(--primary-dark)", color: "white" }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                Bienvenido, {data.worker.first_name}
              </h2>
              <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
                Estado de su vigilancia radiológica.
              </p>
            </div>

            {/* SUMMARY CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div className="clean-panel">
                <label style={miniLabelStyle}>Dosis del Mes</label>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    color: "var(--primary-teal)",
                  }}
                >
                  {data.lastDose?.hp10 || "0.0000"}{" "}
                  <span style={{ fontSize: "0.8rem" }}>mSv</span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Periodo: {data.lastDose?.month}/{data.lastDose?.year}
                </p>
              </div>
              <div className="clean-panel">
                <label style={miniLabelStyle}>Dosis Vida Total</label>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 900,
                    color: "var(--text-main)",
                  }}
                >
                  {data.lifeDose.toFixed(4)}{" "}
                  <span style={{ fontSize: "0.8rem" }}>mSv</span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Acumulado histórico
                </p>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="clean-panel">
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 900,
                  marginBottom: "1.5rem",
                }}
              >
                Actividad Reciente
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {data.history.slice(0, 5).map((d: any) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      background: "#f8fafc",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <Calendar size={18} color="var(--primary-teal)" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                          {d.month}/{d.year}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {d.company_name}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 900 }}>
                      {d.hp10.toFixed(4)} mSv
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn"
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  justifyContent: "center",
                  background: "#f1f5f9",
                }}
              >
                <Download size={18} /> Descargar Reporte Completo (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 800,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: "0.5rem",
} as any;
const miniLabelStyle = {
  fontSize: "0.65rem",
  fontWeight: 900,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: "0.5rem",
} as any;
const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "#f8fafc",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "1rem",
  fontWeight: 600,
} as any;
