import { Users, DollarSign, Activity, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bienvenido, SuperAdmin</h1>
        <p style={{ color: 'var(--text-muted)' }}>Estado global de la infraestructura I.O.N.T.R.A.C.K.</p>
      </header>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Labs Activos</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <span className="stat-value">4</span>
          <span className="badge badge-success">Operativo</span>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Ingresos Mensuales</span>
            <DollarSign size={20} color="var(--secondary)" />
          </div>
          <span className="stat-value">$1,200</span>
          <span className="badge badge-success">Al día</span>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Salud del Sistema</span>
            <Activity size={20} color="var(--primary)" />
          </div>
          <span className="stat-value">99.9%</span>
          <span className="badge badge-success">Excelente</span>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Alertas Críticas</span>
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
          <span className="stat-value">0</span>
          <span className="badge badge-success">Sin incidencias</span>
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Laboratorios Recientes</h2>
        <div className="glass-panel" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Laboratorio</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estatus</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Suscripción</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Último Sync</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>Lab Dosimetría Central</td>
                <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-success">Activo</span></td>
                <td style={{ padding: '1.25rem 1.5rem' }}>$300/mes</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Hace 5 min</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>Radioprotección Norte</td>
                <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-success">Activo</span></td>
                <td style={{ padding: '1.25rem 1.5rem' }}>$300/mes</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Hace 12 min</td>
              </tr>
              <tr>
                <td style={{ padding: '1.25rem 1.5rem' }}>Servicios Dosimétricos S.A.</td>
                <td style={{ padding: '1.25rem 1.5rem' }}><span className="badge badge-warning">En Mora</span></td>
                <td style={{ padding: '1.25rem 1.5rem' }}>$300/mes</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>Hace 1 hora</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
