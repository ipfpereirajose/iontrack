import { ShieldCheck, BarChart3, UserCheck, Server, ArrowRight, Zap, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getServiceSupabase } from '@/lib/supabase';

export default async function LandingHUB() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminSupabase = getServiceSupabase();

  let dashboardUrl = null;
  if (user) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'superadmin') dashboardUrl = '/admin';
    else if (['lab_admin', 'lab_tech'].includes(profile?.role)) dashboardUrl = '/lab';
    else if (['company_manager', 'toe'].includes(profile?.role)) dashboardUrl = '/portal';
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="hero-gradient"></div>
      
      {/* Navbar */}
      <nav style={{ padding: '2rem 0', zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', color: '#000' }}>
              <ShieldCheck size={28} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              ION<span className="text-gradient">TRACK</span>
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            SaaS v1.0 • Multi-Tenant
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'rgba(6, 182, 212, 0.1)', 
              padding: '0.5rem 1rem', 
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--primary)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <Zap size={14} />
              CENTRO DE ACCESO MODULAR
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
              Seleccione su <span className="text-gradient">Puerta de Enlace</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
              I.O.N.T.R.A.C.K. garantiza aislamiento total de datos y procesos específicos para cada tipo de usuario.
            </p>

            {dashboardUrl && (
              <Link href={dashboardUrl} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                <LayoutDashboard size={22} />
                Ir a mi Dashboard Personalizado
                <ArrowRight size={20} />
              </Link>
            )}
          </div>

          <div className="hub-grid">
            {/* Lab Module Card */}
            <Link href="/lab/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hub-card">
                <div className="hub-icon">
                  <BarChart3 size={32} />
                </div>
                <h2 className="hub-title">Laboratorio de Dosimetría</h2>
                <p className="hub-description">
                  Gestión operativa de clientes, validación de dosis recibidas por el Agente y emisión de reportes regulatorios.
                </p>
                <div className="btn" style={{ background: 'rgba(255,255,255,0.05)', width: '100%', justifyContent: 'center' }}>
                  Ingresar al Módulo Lab
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* B2B Portal Card */}
            <Link href="/portal/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hub-card">
                <div className="hub-icon" style={{ color: '#a855f7' }}>
                  <UserCheck size={32} />
                </div>
                <h2 className="hub-title">Entidad de Trabajo (B2B)</h2>
                <p className="hub-description">
                  Portal exclusivo para empresas. Monitoreo de trabajadores (TOEs), historial de dosis y cumplimiento normativo.
                </p>
                <div className="btn" style={{ background: 'rgba(255,255,255,0.05)', width: '100%', justifyContent: 'center' }}>
                  Acceso para Empresas
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* SuperAdmin Card */}
            <Link href="/admin/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hub-card">
                <div className="hub-icon" style={{ color: '#f59e0b' }}>
                  <Server size={32} />
                </div>
                <h2 className="hub-title">Control de Infraestructura</h2>
                <p className="hub-description">
                  Acceso restringido para la administración global del sistema, gestión de laboratorios y facturación SaaS.
                </p>
                <div className="btn" style={{ background: 'rgba(255,255,255,0.05)', width: '100%', justifyContent: 'center' }}>
                  Administración Central
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '3rem 0', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            © 2026 I.O.N.T.R.A.C.K. • Seguridad Radiológica Avanzada
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem' }}>
            <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacidad</Link>
            <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Términos</Link>
            <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
