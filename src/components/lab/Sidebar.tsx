'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, ClipboardCheck, FileText, Settings, LogOut, Activity, Database } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Resumen', href: '/lab', icon: LayoutDashboard },
    { name: 'Empresas Clientes', href: '/lab/companies', icon: Building2 },
    { name: 'Carga Masiva', href: '/lab/bulk-import', icon: Database },
    { name: 'Validación Dosis', href: '/lab/validation', icon: ClipboardCheck },
    { name: 'Reportes y Certificados', href: '/lab/reports', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <Link href="/lab" className="brand">
        I.O.N.<span className="brand-accent">TRACK</span>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
          Módulo de Laboratorio
        </div>
      </Link>
      
      <nav className="nav-group">
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
        <button 
          className="nav-link" 
          style={{ color: 'var(--danger)' }}
          onClick={() => logout()}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
