'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { approveChangeAction, rejectChangeAction } from './actions';

export default function RequestActions({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm('¿Está seguro de aprobar estos cambios? La información del laboratorio se actualizará inmediatamente.')) return;
    setLoading(true);
    await approveChangeAction(requestId);
    setLoading(false);
  };

  const handleReject = async () => {
    const reason = prompt('Indique el motivo del rechazo (opcional):');
    if (reason === null) return;
    setLoading(true);
    await rejectChangeAction(requestId, reason);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button 
        onClick={handleReject}
        disabled={loading}
        className="btn btn-secondary" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--state-danger)' }}
      >
        <X size={16} />
        Rechazar
      </button>
      <button 
        onClick={handleApprove}
        disabled={loading}
        className="btn btn-primary" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
      >
        <Check size={16} />
        {loading ? 'Procesando...' : 'Aprobar Cambios'}
      </button>
    </div>
  );
}
