import { ShieldCheck, Zap, Lock, Globe, Server, UserCheck, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ position: 'relative' }}>
      <div className="hero-gradient"></div>
      
      {/* Navbar */}
      <nav style={{ padding: '2rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', color: '#000' }}>
              <ShieldCheck size={28} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              ION<span className="text-gradient">TRACK</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <Link href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Características</Link>
            <Link href="#solutions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Soluciones</Link>
            <Link href="#contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contacto</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ padding: '6rem 0 4rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(6, 182, 212, 0.1)', 
            padding: '0.5rem 1rem', 
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '2rem',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <Zap size={14} />
            SaaS DE DOSIMETRÍA DE PRÓXIMA GENERACIÓN
          </div>
          
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
            Vigilancia Radiológica<br />
            <span className="text-gradient">Inmutable y Modular</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            I.O.N.T.R.A.C.K. centraliza la gestión dosimétrica con aislamiento multi-inquilino, ingesta de datos offline y cumplimiento normativo automatizado.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="#solutions" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
              Explorar Portales
              <ArrowRight size={18} />
            </Link>
            <Link href="#docs" className="btn" style={{ border: '1px solid var(--border)', background: 'var(--glass)', color: 'white', padding: '1rem 2rem' }}>
              Documentación Técnica
            </Link>
          </div>
        </div>
      </header>

      {/* Solutions Grid */}
      <section id="solutions" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Ecosistema de Módulos</h2>
            <p style={{ color: 'var(--text-muted)' }}>Soluciones especializadas para cada actor en la cadena de seguridad radiológica.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* SuperAdmin Card */}
            <div className="glass-card">
              <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <Server size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>SuperAdmin Console</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Centro de comando para la infraestructura global. Gestión de laboratorios (tenants), facturación automatizada y telemetría de servidores.
              </p>
              <Link href="http://admin.iontrack.com" className="btn" style={{ background: 'white', color: 'black', width: '100%', justifyContent: 'center' }}>
                Acceder al Centro de Comando
              </Link>
            </div>

            {/* Lab Card */}
            <div className="glass-card">
              <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                <BarChart3 size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Lab Operations</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Motor operativo para laboratorios de dosimetría. Cola de validación, gestión de clientes B2B y automatización de reportes regulatorios.
              </p>
              <Link href="http://lab.iontrack.com" className="btn" style={{ background: 'white', color: 'black', width: '100%', justifyContent: 'center' }}>
                Entrar al Gestor de Lab
              </Link>
            </div>

            {/* B2B Card */}
            <div className="glass-card">
              <div style={{ color: '#a855f7', marginBottom: '1.5rem' }}>
                <UserCheck size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>B2B Client Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Portal de autoservicio para empresas. Historial de personal, certificados descargables con validación QR y monitoreo de cumplimiento.
              </p>
              <Link href="http://portal.iontrack.com" className="btn" style={{ background: 'white', color: 'black', width: '100%', justifyContent: 'center' }}>
                Ingresar al Portal Empresa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border)', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            © 2026 I.O.N.T.R.A.C.K. Infraestructura Operativa Normativa. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
             <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Términos</Link>
             <Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
