"use client";

import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LabLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Fetch the actual role from the database
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const role = profile?.role || "unknown";
      document.cookie = `iontrack_role=${role}; path=/; max-age=604800; SameSite=Lax`;

      // Redirect based on actual role
      if (role === "lab_admin" || role === "lab_tech") {
        router.push("/lab");
      } else if (role === "company_manager") {
        router.push("/portal");
      } else if (role === "superadmin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      
      router.refresh();
    } catch (err) {
      setError("Error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
        padding: "2rem"
      }}
    >
      <div className="hero-gradient"></div>

      <div
        className="glass-card"
        style={{ 
          width: "100%", 
          maxWidth: "480px", 
          padding: "3.5rem",
          zIndex: 10,
          position: "relative"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img 
            src="/logo.png" 
            alt="IONTRACK Logo" 
            style={{ 
              width: "120px", 
              height: "auto", 
              margin: "0 auto 2rem auto",
              display: "block",
              filter: "drop-shadow(0 10px 15px rgba(0, 168, 181, 0.2))"
            }} 
          />
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
              color: "var(--text-main)",
              letterSpacing: "-0.03em"
            }}
          >
            Acceso Laboratorio
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Ingrese sus credenciales para continuar.
          </p>
        </div>

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
              marginBottom: "1.5rem",
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              style={{
                position: "absolute",
                left: "1.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="email"
              placeholder="correo@laboratorio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem 1rem 1rem 3.5rem",
                background: "#fff",
                border: "2px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text-main)",
                fontWeight: 700,
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              style={{
                position: "absolute",
                left: "1.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem 1rem 1rem 3.5rem",
                background: "#fff",
                border: "2px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text-main)",
                fontWeight: 700,
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
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
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "var(--text-main)",
              fontSize: "0.875rem",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Volver al HUB Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
