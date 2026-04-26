'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, History, Download, Settings, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'Mi Personal (TOE)', href: '/portal/workers', icon: Users },
    { name: 'Historial de Dosis', href: '/portal/history', icon: History },
    { name: 'Incidencias', href: '/portal/incidents', icon: ShieldCheck },
    { name: 'Descargas', href: '/portal/downloads', icon: Download },
  ];

  return (
    <aside className="sidebar">
      <Link href="/portal" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: '#a855f7', padding: '0.5rem', borderRadius: '10px', color: 'white', display: 'flex' }}>
          <ShieldCheck size={26} />
        </div>
        <span>
          ION<span style={{ color: '#a855f7' }}>TRACK</span>
        </span>
      </Link>
      
      <nav className="nav-group">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
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

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Tu Proveedor
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white' }}>
            Lab Radioprotección
          </div>
        </div>
        
        <Link href="/portal/settings" className={`nav-link ${pathname === '/portal/settings' ? 'active' : ''}`}>
          <Settings size={20} />
          Configuración
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
