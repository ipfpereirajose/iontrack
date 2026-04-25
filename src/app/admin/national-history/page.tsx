import { History, Search, Filter, Download, User, Calendar, Activity } from 'lucide-react';
import { getServiceSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function NationalHistoryPage({ searchParams }: { searchParams: any }) {
  const supabase = getServiceSupabase();
  const { ci, birth_year, year } = await searchParams;

  let query = supabase.from('national_dose_history').select('*');

  if (ci) query = query.ilike('ci', `%${ci}%`);
  if (birth_year) query = query.eq('birth_year', birth_year);
  if (year) query = query.gte('last_report_year', year);

  const { data: records } = await query.order('total_hp10', { ascending: false });

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Historial Nacional de Dosis Vida</h1>
        <p style={{ color: 'var(--text-muted)' }}>Consolidación de exposición radiológica por Cédula de Identidad a nivel nacional.</p>
      </header>

      {/* FILTERS */}
      <div className="clean-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="input-group">
            <label style={labelStyle}>Cédula (CI)</label>
            <input name="ci" placeholder="Ej: 12345678" defaultValue={ci} style={inputStyle} />
          </div>
          <div className="input-group">
            <label style={labelStyle}>Año de Nacimiento</label>
            <input name="birth_year" type="number" placeholder="Ej: 1985" defaultValue={birth_year} style={inputStyle} />
          </div>
          <div className="input-group">
            <label style={labelStyle}>Desde el Año (Dosis)</label>
            <input name="year" type="number" placeholder="Ej: 2020" defaultValue={year} style={inputStyle} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            <Filter size={18} /> Filtrar
          </button>
        </form>
      </div>

      <div className="clean-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Trabajador (CI)</th>
                <th>Sexo</th>
                <th>Nacimiento</th>
                <th>Reportes</th>
                <th>Dosis Vida Hp(10)</th>
                <th>Dosis Vida Hp(3)</th>
                <th>Último Reporte</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {records?.map((record: any) => (
                <tr key={record.ci}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="var(--primary-teal)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{record.first_name} {record.last_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CI: {record.ci}</div>
                      </div>
                    </div>
                  </td>
                  <td>{record.sex}</td>
                  <td>{record.birth_year}</td>
                  <td style={{ fontWeight: 700 }}>{record.total_reports}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      background: record.total_hp10 >= 20 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: record.total_hp10 >= 20 ? 'var(--state-danger)' : 'var(--state-safe)'
                    }}>
                      {record.total_hp10.toFixed(4)} mSv
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{record.total_hp3.toFixed(4)}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {record.last_report_month}/{record.last_report_year}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/national-history/${record.ci}`} className="btn" style={{ padding: '0.4rem', background: '#f1f5f9' }}>
                      <Search size={16} color="var(--primary-teal)" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' } as any;
const inputStyle = { 
  width: '100%', 
  padding: '0.6rem 1rem', 
  background: '#f8fafc', 
  border: '1px solid var(--border)', 
  borderRadius: '8px', 
  fontSize: '0.9rem', 
  fontWeight: 600 
} as any;
