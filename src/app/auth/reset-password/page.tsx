"use client";

import { ShieldCheck, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/lab/login");
      }, 3000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div className="hero-gradient"></div>

      <div
        className="glass-card"
        style={{ width: "100%", maxWidth: "450px", padding: "3rem" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              background: "var(--primary)",
              color: "#000",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
            }}
          >
            <Lock size={32} />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
              color: "var(--text-main)",
            }}
          >
            Nueva Contraseña
          </h1>
          <p
            style={{
              color: "var(--text-main)",
              fontSize: "0.9375rem",
              fontWeight: 600,
            }}
          >
            Establezca su nueva clave de acceso de seguridad.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ color: "var(--state-safe)", marginBottom: "1rem" }}>
              <CheckCircle2 size={48} style={{ margin: "0 auto" }} />
            </div>
            <h3 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>¡Actualizada!</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Tu contraseña ha sido cambiada con éxito. Redirigiendo al login...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  padding: "1rem",
                  borderRadius: "12px",
                  color: "#f87171",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="input-group">
              <input
                type="password"
                placeholder="Nueva Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "1rem",
                borderRadius: "12px",
                fontSize: "1rem",
              }}
            >
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "1rem",
  background: "#fff",
  border: "2px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text-main)",
  fontWeight: 700,
  outline: "none",
} as any;
