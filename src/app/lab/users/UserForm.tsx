"use client";

import { useState } from "react";
import { UserPlus, Loader2, ShieldCheck, Mail, Lock, Building } from "lucide-react";
import { createCompanyUser } from "./actions";

interface UserFormProps {
  companies: { id: string, name: string }[];
  tenantId: string;
}

export default function UserForm({ companies, tenantId }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createCompanyUser({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      companyId: formData.get("companyId") as string,
      tenantId: tenantId
    });

    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Ocurrió un error inesperado");
    }
    setLoading(false);
  };

  return (
    <div className="clean-panel" style={{ height: 'fit-content' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <UserPlus size={20} color="var(--primary-teal)" />
        <h3 style={{ fontWeight: 800 }}>Crear Acceso para Empresa</h3>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>NOMBRE</label>
            <input name="firstName" required placeholder="Ej: Juan" className="input" style={{ width: '100%' }} />
          </div>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>APELLIDO</label>
            <input name="lastName" required placeholder="Ej: Perez" className="input" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>CORREO ELECTRÓNICO (USUARIO)</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input name="email" type="email" required placeholder="empresa@ejemplo.com" className="input" style={{ width: '100%', paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>CONTRASEÑA</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" className="input" style={{ width: '100%', paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <div className="input-group">
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>EMPRESA ASIGNADA</label>
          <div style={{ position: 'relative' }}>
            <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <select name="companyId" required className="input" style={{ width: '100%', paddingLeft: '2.5rem', appearance: 'none' }}>
              <option value="">Seleccionar empresa...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--state-danger)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--state-safe)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} />
            Acceso creado exitosamente.
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Crear Cuenta de Acceso"}
        </button>
      </form>
    </div>
  );
}
