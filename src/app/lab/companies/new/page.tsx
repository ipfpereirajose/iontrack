"use client";

import {
  Building2,
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
  Info,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { createCompany } from "../actions";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import venezuelaData from "@/data/venezuela.json";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="btn btn-primary"
      style={{
        padding: "0.75rem 2.5rem",
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        borderRadius: "12px",
        fontWeight: 700,
        fontSize: "1rem",
        boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
      }}
    >
      {pending ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <Save size={20} />
      )}
      {pending ? "Guardando..." : "Guardar Entidad"}
    </button>
  );
}

export default function NewCompanyPage() {
  const [error, setError] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("");
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [parroquias, setParroquias] = useState<string[]>([]);

  // Update municipios when estado changes
  useEffect(() => {
    if (selectedEstado) {
      const estadoObj = venezuelaData.find(
        (e: any) => e.estado === selectedEstado,
      );
      setMunicipios(estadoObj?.municipios || []);
      setSelectedMunicipio("");
      setParroquias([]);
    } else {
      setMunicipios([]);
      setParroquias([]);
    }
  }, [selectedEstado]);

  // Update parroquias when municipio changes
  useEffect(() => {
    if (selectedMunicipio) {
      const municipioObj = municipios.find(
        (m: any) => m.municipio === selectedMunicipio,
      );
      setParroquias(municipioObj?.parroquias || []);
    } else {
      setParroquias([]);
    }
  }, [selectedMunicipio, municipios]);

  async function clientAction(formData: FormData) {
    try {
      await createCompany(formData);
    } catch (err: any) {
      setError(err.message || "Error al registrar la empresa");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
    display: "block",
  };

  const inputStyle = {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0.875rem 1rem",
    color: "var(--text-main)",
    fontSize: "0.9375rem",
    outline: "none",
    transition: "all 0.2s",
    "&:focus": {
      borderColor: "var(--primary)",
      boxShadow: "0 0 0 3px rgba(0, 168, 181, 0.1)",
    },
  } as any;

  const sectionHeaderStyle = {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "var(--primary)",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    borderBottom: "1px solid rgba(6, 182, 212, 0.2)",
    paddingBottom: "0.75rem",
  };

  return (
    <div
      style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "5rem" }}
    >
      <header style={{ marginBottom: "2.5rem" }}>
        <Link
          href="/lab/companies"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Volver a Empresas
        </Link>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Registro de Entidad
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Complete la información detallada de la nueva empresa cliente.
        </p>
      </header>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "1.25rem",
            borderRadius: "16px",
            color: "#f87171",
            marginBottom: "2rem",
            fontSize: "0.9375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Info size={20} />
          {error}
        </div>
      )}

      <form
        action={clientAction}
        style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
      >
        {/* SECTION 1: DATOS DE LA ENTIDAD */}
        <div
          className="glass-panel"
          style={{ padding: "2.5rem", borderRadius: "24px" }}
        >
          <h2 style={sectionHeaderStyle}>
            <Building2 size={22} />
            1. Datos de la Entidad
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label style={labelStyle}>Nombre de la Entidad *</label>
              <input
                required
                name="name"
                type="text"
                placeholder="RAZÓN SOCIAL COMPLETA"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tipo de Entidad *</label>
              <select required name="entity_type" style={inputStyle}>
                <option value="">Seleccione...</option>
                <option value="Privada">Privada</option>
                <option value="Pública">Pública</option>
                <option value="Mixta">Mixta</option>
                <option value="ONG">ONG / Sin fines de lucro</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 2fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <label style={labelStyle}>Tipo RIF</label>
              <select name="rif_type" style={inputStyle}>
                <option value="J-">J-</option>
                <option value="G-">G-</option>
                <option value="V-">V-</option>
                <option value="E-">E-</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Número RIF *</label>
              <input
                required
                name="rif_number"
                type="text"
                placeholder="Ej: 123456789"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Sector *</label>
              <select required name="sector" style={inputStyle}>
                <option value="">Seleccione...</option>
                <option value="Médico / Salud">Médico / Salud</option>
                <option value="Industrial">Industrial</option>
                <option value="Petrolero">Petrolero</option>
                <option value="Minero">Minero</option>
                <option value="Investigación">Investigación</option>
                <option value="Seguridad">Seguridad</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: UBICACIÓN Y CONTACTO */}
        <div
          className="glass-panel"
          style={{ padding: "2.5rem", borderRadius: "24px" }}
        >
          <h2 style={sectionHeaderStyle}>
            <MapPin size={22} />
            2. Ubicación y Contacto
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label style={labelStyle}>Estado *</label>
              <select
                required
                name="state"
                style={inputStyle}
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <option value="">Seleccione un Estado...</option>
                {venezuelaData.map((e: any) => (
                  <option key={e.estado} value={e.estado}>
                    {e.estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Municipio *</label>
              <select
                required
                name="municipality"
                style={inputStyle}
                disabled={!selectedEstado}
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
              >
                <option value="">
                  {selectedEstado
                    ? "Seleccione un Municipio..."
                    : "Seleccione primero el Estado"}
                </option>
                {municipios.map((m: any) => (
                  <option key={m.municipio} value={m.municipio}>
                    {m.municipio}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Parroquia *</label>
              <select
                required
                name="parish"
                style={inputStyle}
                disabled={!selectedMunicipio}
              >
                <option value="">
                  {selectedMunicipio
                    ? "Seleccione una Parroquia..."
                    : "Seleccione primero el Municipio"}
                </option>
                {parroquias.map((p: string) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Dirección Detallada *</label>
            <textarea
              required
              name="address"
              rows={2}
              placeholder="AVENIDA, CALLE, EDIFICIO, PUNTO DE REFERENCIA..."
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <label style={labelStyle}>Email de la Empresa</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  name="company_email"
                  type="email"
                  placeholder="contacto@empresa.com"
                  style={{ ...inputStyle, paddingLeft: "2.75rem" }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Telf Local</label>
              <input
                name="local_phone"
                type="text"
                placeholder="Ej: 0212-1234567"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Telf Móvil *</label>
              <input
                required
                name="mobile_phone"
                type="text"
                placeholder="Ej: 0414-1234567"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: OSR */}
        <div
          className="glass-panel"
          style={{ padding: "2.5rem", borderRadius: "24px" }}
        >
          <h2 style={sectionHeaderStyle}>
            <User size={22} />
            3. Oficial de Seguridad Radiológica (OSR)
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <label style={labelStyle}>Nombres OSR *</label>
              <input
                required
                name="osr_first_name"
                type="text"
                placeholder="NOMBRES DEL OFICIAL"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Apellidos OSR *</label>
              <input
                required
                name="osr_last_name"
                type="text"
                placeholder="APELLIDOS DEL OFICIAL"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 2fr 2fr",
              gap: "1.5rem",
            }}
          >
            <div>
              <label style={labelStyle}>Nac.</label>
              <select name="osr_nationality" style={inputStyle}>
                <option value="V-">V-</option>
                <option value="E-">E-</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cédula OSR *</label>
              <input
                required
                name="osr_id_number"
                type="text"
                placeholder="12345678"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Telf OSR *</label>
              <input
                required
                name="osr_phone"
                type="text"
                placeholder="0414-0000000"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email OSR *</label>
              <input
                required
                name="osr_email"
                type="email"
                placeholder="osr@correo.com"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <button
            type="reset"
            className="btn"
            style={{
              background: "rgba(255,255,255,0.05)",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            Limpiar Formulario
          </button>
          <SubmitButton />
        </div>
      </form>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
          padding-right: 2.5rem !important;
        }
        select option {
          background: #1a1a1a;
          color: white;
        }
        input:focus,
        select:focus,
        textarea:focus {
          border-color: var(--primary) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }
      `}</style>
    </div>
  );
}
