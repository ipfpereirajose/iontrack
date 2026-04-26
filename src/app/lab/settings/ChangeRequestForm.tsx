"use client";

import { Save, AlertCircle } from "lucide-react";
import { useState } from "react";
import { requestLabUpdateAction } from "./actions";

interface Props {
  tenant: any;
  isPending: boolean;
}

export default function ChangeRequestForm({ tenant, isPending }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await requestLabUpdateAction(formData);
    setLoading(false);
    if (res.success) setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ fontWeight: 700, color: "var(--state-safe)" }}>
          Solicitud enviada con éxito.
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          El SuperAdmin revisará los cambios pronto.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div className="input-group">
          <label style={labelStyle}>Nombre del Laboratorio</label>
          <input
            name="name"
            defaultValue={tenant.name}
            required
            style={inputStyle}
            disabled={isPending}
          />
        </div>
        <div className="input-group">
          <label style={labelStyle}>RIF</label>
          <input
            name="rif"
            defaultValue={tenant.rif}
            required
            style={inputStyle}
            disabled={isPending}
          />
        </div>
        <div className="input-group" style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Dirección Fiscal</label>
          <textarea
            name="address"
            defaultValue={tenant.address}
            required
            style={{ ...inputStyle, minHeight: "80px" }}
            disabled={isPending}
          />
        </div>
        <div className="input-group">
          <label style={labelStyle}>Estado</label>
          <input
            name="state"
            defaultValue={tenant.state}
            required
            style={inputStyle}
            disabled={isPending}
          />
        </div>
        <div className="input-group">
          <label style={labelStyle}>Municipio</label>
          <input
            name="municipality"
            defaultValue={tenant.municipality}
            required
            style={inputStyle}
            disabled={isPending}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || isPending}
        style={{ alignSelf: "flex-start", marginTop: "1rem" }}
      >
        <Save size={18} />
        {loading
          ? "Enviando..."
          : isPending
            ? "Pendiente de Aprobación"
            : "Solicitar Actualización"}
      </button>

      {isPending && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--state-warning)",
            fontWeight: 600,
          }}
        >
          No puede realizar más solicitudes hasta que la anterior sea procesada.
        </p>
      )}
    </form>
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
const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "#f8fafc",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--text-main)",
} as any;
