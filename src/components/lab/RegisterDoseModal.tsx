"use client";

import { useState } from "react";
import { Plus, X, Calendar, Activity, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegisterDoseModalProps {
  workerId: string;
  workerName: string;
  companyName: string;
}

export default function RegisterDoseModal({ workerId, workerName, companyName }: RegisterDoseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    month: currentMonth.toString(),
    year: currentYear.toString(),
    hp10: "0.000",
    hp3: "0.000",
    hp007: "0.000",
    hp007_ext: "0.000",
    hp10_neu: "0.000",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/lab/doses/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          ...formData,
          hp10: parseFloat(formData.hp10),
          hp3: parseFloat(formData.hp3),
          hp007: parseFloat(formData.hp007),
          hp007_ext: parseFloat(formData.hp007_ext),
          hp10_neu: parseFloat(formData.hp10_neu),
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || "Error al registrar la dosis");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{
          fontSize: "0.8rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem"
        }}
      >
        <Plus size={14} /> Cargar Dosis
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "500px",
        padding: "2rem",
        position: "relative",
        background: "white"
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ position: "absolute", top: "1.5rem", right: "1.5rem", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          <X size={24} />
        </button>

        <header style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{ background: "rgba(6, 182, 212, 0.1)", color: "var(--primary)", padding: "0.5rem", borderRadius: "10px" }}>
              <Activity size={24} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900 }}>Nueva Lectura</h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Registrando dosis para <strong>{workerName}</strong> ({companyName})
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}><Calendar size={12} /> Mes</label>
              <select 
                style={inputStyle}
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('es', { month: 'long' }).toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Calendar size={12} /> Año</label>
              <select 
                style={inputStyle}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Hp(10) - Cuerpo Entero</label>
              <input 
                type="number" step="0.001" 
                style={inputStyle} 
                value={formData.hp10}
                onChange={(e) => setFormData({ ...formData, hp10: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Hp(3) - Cristalino</label>
              <input 
                type="number" step="0.001" 
                style={inputStyle}
                value={formData.hp3}
                onChange={(e) => setFormData({ ...formData, hp3: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Hp(0.07)</label>
              <input 
                type="number" step="0.001" 
                style={inputStyle}
                value={formData.hp007}
                onChange={(e) => setFormData({ ...formData, hp007: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Extremidad</label>
              <input 
                type="number" step="0.001" 
                style={inputStyle}
                value={formData.hp007_ext}
                onChange={(e) => setFormData({ ...formData, hp007_ext: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Neutrones</label>
              <input 
                type="number" step="0.001" 
                style={inputStyle}
                value={formData.hp10_neu}
                onChange={(e) => setFormData({ ...formData, hp10_neu: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 2, justifyContent: "center" }}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Registrar Lectura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.7rem",
  fontWeight: 800,
  color: "var(--text-muted)",
  textTransform: "uppercase" as const,
  marginBottom: "0.5rem",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  padding: "0 0.75rem",
  background: "#f8fafc",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "0.9rem",
  fontWeight: 600,
};
