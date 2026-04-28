"use client";

import { UserPlus, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { createPortalWorker } from "@/app/portal/workers/actions";
import BirthDateSelector from "./BirthDateSelector";

const CARGOS = [
  "Radiólogo", "Técnico Radiólogo", "Oncólogo Radioterapeuta", "Físico Médico",
  "Médico Nuclear", "Técnico en Medicina Nuclear", "Odontólogo", "Asistente Dental",
  "Cardiólogo Intervencionista", "Enfermero/a Radio-oncológico", "Oficial de Seguridad Radiológica (OSR)",
  "Operador de Gammagrafía", "Ayudante de Gammagrafía", "Supervisor de Radiografía Industrial",
  "Técnico de Mantenimiento (Rayos X)",
];

const PRACTICAS = [
  "Radiodiagnóstico Médico", "Radiodiagnóstico Dental", "Radiología Intervencionista",
  "Radioterapia (Teleterapia)", "Braquiterapia", "Medicina Nuclear (Diagnóstico)",
  "Medicina Nuclear (Terapia)", "Radiografía Industrial (Gammagrafía)",
  "Radiografía Industrial (Rayos X)", "Perfilaje de Pozos", "Irradiación de Sangre",
  "Docencia e Investigación",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.875rem 2.5rem",
        background: "var(--primary)",
        color: "#1a365d",
        border: "none",
        borderRadius: "12px",
        fontWeight: 700,
        fontSize: "1rem",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <UserPlus size={20} />
      )}
      {pending ? "Registrando..." : "Registrar TOE"}
    </button>
  );
}

export default function RegistrationForm() {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    try {
      await createPortalWorker(formData);
    } catch (err: any) {
      setError(err.message || "Error al registrar el trabajador");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--text-main)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0.875rem 1rem",
    color: "var(--text-main)",
    fontSize: "0.9375rem",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "auto",
    cursor: "pointer",
  };

  return (
    <>
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            padding: "1.25rem",
            borderRadius: "16px",
            color: "#f87171",
            marginBottom: "2rem",
          }}
        >
          {error}
        </div>
      )}

      <form
        action={clientAction}
        className="glass-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          padding: "3rem",
          borderRadius: "24px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Nombres *</label>
            <input required name="first_name" type="text" placeholder="Ej: Juan Carlos" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Apellidos *</label>
            <input required name="last_name" type="text" placeholder="Ej: Pérez Rodríguez" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Cédula / ID *</label>
            <input required name="ci" type="text" placeholder="V-12345678" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sexo *</label>
            <select required name="sex" style={selectStyle}>
              <option value="">-- Seleccionar --</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fecha de Nacimiento *</label>
            <BirthDateSelector selectStyle={selectStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Cargo / Rol *</label>
          <select required name="position" style={selectStyle}>
            <option value="">-- Seleccionar Cargo --</option>
            {CARGOS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Clasificación oficial del cargo según normativa radiológica.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Práctica que Realiza *</label>
          <select required name="practice" style={selectStyle}>
            <option value="">-- Seleccionar Práctica --</option>
            {PRACTICAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Actividad radiológica principal del trabajador.
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <SubmitButton />
        </div>
      </form>
    </>
  );
}
