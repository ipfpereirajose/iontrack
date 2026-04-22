'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, ClipboardCheck, FileText, Settings, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Resumen', href: '/lab', icon: LayoutDashboard },
    { name: 'Empresas Clientes', href: '/lab/companies', icon: Building2 },
    { name: 'Validación Dosis', href: '/lab/validation', icon: ClipboardCheck },
    { name: 'Reportes y Certificados', href: '/lab/reports', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link href="/lab" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', textDecoration: 'none' }}>
          I.O.N.<span style={{ color: 'var(--primary)' }}>TRACK</span>
        </Link>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Módulo de Laboratorio
        </span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Activity size={14} color="var(--secondary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Agente Local</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Sincronizado hace 2m
          </div>
        </div>
        
        <Link href="/lab/settings" className={`nav-link ${pathname === '/lab/settings' ? 'active' : ''}`}>
          <Settings size={20} />
          Marca Blanca
        </Link>
        <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
