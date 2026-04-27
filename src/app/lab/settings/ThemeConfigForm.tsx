"use client";

import { Save, Image as ImageIcon, Palette } from "lucide-react";
import { useState } from "react";
import { updateLabThemeAction } from "./actions";

interface Props {
  tenant: any;
}

export default function ThemeConfigForm({ tenant }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateLabThemeAction(formData);
    setLoading(true);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <div className="input-group">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.7rem",
            fontWeight: 800,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          <ImageIcon size={14} /> URL del Logo
        </label>
        <input
          name="logo_url"
          defaultValue={tenant.logo_url}
          placeholder="https://ejemplo.com/logo.png"
          style={inputStyle}
        />
        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Se recomienda una imagen en formato PNG con fondo transparente.
        </p>
      </div>

      <div className="input-group">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.7rem",
            fontWeight: 800,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          <Palette size={14} /> Color Primario (Marca)
        </label>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="color"
            name="primary_color"
            defaultValue={tenant.config?.primary_color || "#06b6d4"}
            style={{ width: "50px", height: "40px", padding: "2px", border: "1px solid var(--border)", borderRadius: "8px" }}
          />
          <input
            type="text"
            readOnly
            value={tenant.config?.primary_color || "#06b6d4"}
            style={{ ...inputStyle, width: "120px" }}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ alignSelf: "flex-start", marginTop: "1rem" }}
      >
        <Save size={18} />
        {loading ? "Guardando..." : success ? "¡Guardado!" : "Guardar Cambios Visuales"}
      </button>
    </form>
  );
}

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
