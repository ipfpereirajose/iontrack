'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  doseId: string;
  approveAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => Promise<void>;
}

export default function ValidationButtons({ doseId, approveAction, rejectAction }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    setError(null);
    try {
      await approveAction(doseId);
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    setError(null);
    try {
      await rejectAction(doseId);
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginRight: '1rem' }}>{error}</span>}
      
      <button 
        disabled={!!loading}
        onClick={handleApprove}
        style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid rgba(34, 197, 94, 0.2)', 
          color: '#4ade80',
          padding: '0.6rem 1.2rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          fontSize: '0.875rem'
        }}
      >
        {loading === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        Aprobar
      </button>

      <button 
        disabled={!!loading}
        onClick={handleReject}
        style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          color: '#f87171',
          padding: '0.6rem 1.2rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          fontSize: '0.875rem'
        }}
      >
        {loading === 'reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
        Rechazar
      </button>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
