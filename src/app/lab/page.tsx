import { Building2, Users, ClipboardCheck, AlertTriangle, Download } from 'lucide-react';

export default function LabHomePage() {
  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard del Laboratorio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenido al centro operativo de dosimetría.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Empresas</span>
            <Building2 size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>24</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>+2 este mes</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trabajadores (TOE)</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>142</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Promedio 5.9 por empresa</div>
        </div>

        <div className="glass-panel" style={{ border: '1px solid rgba(59, 130, 246, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pendientes Validar</span>
            <ClipboardCheck size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>12</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>Requiere atención inmediata</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alertas de Dosis</span>
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>1</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.5rem' }}>Umbral 80% superado</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Cola de Validación Reciente</h2>
          <div className="glass-panel" style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Trabajador</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Empresa</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dosis (mSv)</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>Juan Pérez</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>Hospital Metropolitano</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>0.1245</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}>Validar</button>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem 1.5rem' }}>María García</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>Clínica Santa Fe</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>0.0892</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}>Validar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Estado e Infraestructura</h2>
          <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)' }}></div>
              <span style={{ fontWeight: 600 }}>Agente Online</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Buffer Local:</span>
                <span>0 registros</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Software de Ingesta</h3>
            <p style={{ fontSize: '0.8125rem', opacity: 0.9, marginBottom: '1.25rem' }}>Descarga el agente oficial para sincronizar dosis offline.</p>
            <a href="/downloads/iontrack-agent.exe" style={{ background: 'white', color: 'var(--primary)', padding: '0.6rem', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
              <Download size={16} />
              Descargar .EXE
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
