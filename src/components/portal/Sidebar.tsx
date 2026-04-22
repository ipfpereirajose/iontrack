'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, History, Download, Settings, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', href: '/portal', icon: LayoutDashboard },
    { name: 'Mi Personal (TOE)', href: '/portal/workers', icon: Users },
    { name: 'Historial de Dosis', href: '/portal/history', icon: History },
    { name: 'Descargas', href: '/portal/downloads', icon: Download },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '8px', color: 'white' }}>
          <ShieldCheck size={24} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          ION<span style={{ color: 'var(--primary)' }}>TRACK</span>
        </span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
        <div className="glass-panel" style={{ padding: '1rem', border: 'none', background: '#f1f5f9', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Tu Laboratorio
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Lab Dosimetría Central
          </div>
        </div>
        
        <Link href="/portal/settings" className={`nav-link ${pathname === '/portal/settings' ? 'active' : ''}`}>
          <Settings size={20} />
          Configuración
        </Link>
        <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
