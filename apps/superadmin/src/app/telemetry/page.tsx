import { Activity, Server, Database, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TelemetryPage() {
  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={32} color="var(--primary)" />
          Telemetría del Sistema
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitoreo en tiempo real de la infraestructura I.O.N.T.R.A.C.K. global.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Cloud Health */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Globe size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Infraestructura Cloud (Supabase)</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>API Endpoint</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>gjdxaejbqibwemotyvto.supabase.co</div>
              </div>
              <span className="badge badge-success">Online (12ms)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Base de Datos</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PostgreSQL 15.1</div>
              </div>
              <span className="badge badge-success">Saludable</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Carga de CPU</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uso actual del servidor</div>
              </div>
              <span style={{ fontWeight: 700 }}>4%</span>
            </div>
          </div>
        </div>

        {/* Local Agents Health */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Server size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Agentes Locales (Ingesta)</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Agentes Registrados:</span>
              <span style={{ fontWeight: 700 }}>4 / 4</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sync Exitosas (24h):</span>
              <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>1,242</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Errores de Sync (24h):</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)' }}>0</span>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Estado por Laboratorio</h2>
        <div className="glass-panel" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Laboratorio</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Agente ID</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Último Latido</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Latencia</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>Lab Dosimetría Central</td>
                <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>DC-01-NODE</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>Hace 2 seg</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>45ms</td>
                <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-success">Activo</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>Radioprotección Norte</td>
                <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>RN-02-PY</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>Hace 15 seg</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>120ms</td>
                <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-success">Activo</span></td>
              </tr>
              <tr>
                <td style={{ padding: '1.25rem 1.5rem' }}>Servicios Dosimétricos S.A.</td>
                <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>SD-01-NODE</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>Hace 1 hora</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>---</td>
                <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-warning" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Desconectado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
