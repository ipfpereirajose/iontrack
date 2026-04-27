"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { syncCompanyAccounts } from "./actions";

export default function SyncButton({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await syncCompanyAccounts(tenantId);
      if (res.success) {
        setResult({ count: res.count || 0 });
      } else {
        setError(res.error || "Error al sincronizar");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button 
        onClick={handleSync} 
        disabled={loading}
        className="btn btn-secondary"
        style={{ 
          background: 'rgba(0, 168, 181, 0.05)', 
          borderColor: 'rgba(0, 168, 181, 0.2)',
          color: 'var(--primary-teal)',
          fontSize: '0.85rem'
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <RefreshCw size={16} />
        )}
        Sincronizar Accesos Automáticos
      </button>

      {result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--state-safe)', fontSize: '0.85rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          {result.count > 0 ? `${result.count} accesos creados.` : "Todos los accesos están al día."}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--state-danger)', fontSize: '0.85rem', fontWeight: 600 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
