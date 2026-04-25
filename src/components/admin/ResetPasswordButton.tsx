'use client';

import { KeyRound, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { resetTenantPasswordAction } from '@/app/admin/tenants/actions';

interface Props {
  email: string;
}

export default function ResetPasswordButton({ email }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleReset = async () => {
    if (!email) return;
    if (!confirm(`¿Está seguro de que desea resetear la contraseña del laboratorio (${email})? Se enviará un correo de recuperación.`)) return;

    setStatus('loading');
    const result = await resetTenantPasswordAction(email);
    
    if (result.success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <button 
      onClick={handleReset}
      disabled={status === 'loading'}
      title="Resetear Contraseña"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '0.5rem',
        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: status === 'success' ? '#4ade80' : status === 'error' ? '#f87171' : 'var(--text-muted)'
      }}
    >
      {status === 'loading' ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle2 size={16} />
      ) : status === 'error' ? (
        <AlertCircle size={16} />
      ) : (
        <KeyRound size={16} />
      )}
    </button>
  );
}
