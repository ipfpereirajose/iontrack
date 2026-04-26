"use client";

import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { updatePasswordAction } from "./actions";

export default function PasswordResetForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await updatePasswordAction(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div
        style={{
          background: "rgba(16, 185, 129, 0.05)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid var(--state-safe)",
          textAlign: "center",
        }}
      >
        <CheckCircle2
          size={32}
          color="var(--state-safe)"
          style={{ margin: "0 auto 0.5rem auto" }}
        />
        <p style={{ fontWeight: 700, color: "var(--state-safe)" }}>
          Contraseña actualizada
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Cerrando sesión...
        </p>
        {setTimeout(() => (window.location.href = "/login"), 2000) && null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      <div className="input-group">
        <label style={labelStyle}>Nueva Contraseña</label>
        <input type="password" name="password" required style={inputStyle} />
      </div>
      <div className="input-group">
        <label style={labelStyle}>Confirmar Contraseña</label>
        <input type="password" name="confirm" required style={inputStyle} />
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--state-danger)",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-secondary"
        disabled={loading}
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Lock size={18} />
        {loading ? "Actualizando..." : "Cambiar Contraseña"}
      </button>
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
