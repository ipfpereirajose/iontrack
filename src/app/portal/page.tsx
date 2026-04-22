import { Users, Calendar, Download, ShieldCheck } from 'lucide-react';

export default function B2BHomePage() {
  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Hospital Metropolitano</h1>
          <p style={{ color: 'var(--text-muted)' }}>Resumen de Vigilancia Radiológica Ocupacional</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Reporte Mensual PDF
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ border: 'none', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Expuesto (TOE)</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>12</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Todos con dosímetro activo</div>
        </div>

        <div className="glass-panel" style={{ border: 'none', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Último Periodo</span>
            <Calendar size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>Marzo 2026</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.5rem', fontWeight: 600 }}>Dosis cargadas y validadas</div>
        </div>

        <div className="glass-panel" style={{ border: 'none', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estatus de Cumplimiento</span>
            <ShieldCheck size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>100%</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>Dentro de límites permitidos</div>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Estatus de Dosímetros Actuales</h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Ver todos</button>
        </div>

        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: 'none', background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Trabajador</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cédula</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Estatus Dosímetro</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Última Dosis (mSv)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Dr. Ricardo Méndez</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>V-12.345.678</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>Entregado</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>0.045</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Lic. Ana Silva</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>V-23.456.789</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#fef9c3', color: '#854d0e' }}>En Lectura</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>0.012</td>
              </tr>
              <tr>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>Téc. Carlos Ruiz</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>V-15.678.901</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>Entregado</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>0.089</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
