'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Activity, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Laboratorios', href: '/admin/tenants', icon: Users },
    { name: 'Facturación', href: '/admin/billing', icon: CreditCard },
    { name: 'Telemetría', href: '/admin/telemetry', icon: Activity },
  ];

  return (
    <aside className="sidebar">
      <Link href="/admin" className="brand">
        I.O.N.<span className="brand-accent">TRACK</span>
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

      <div style={{ marginTop: 'auto' }}>
        <Link href="/admin/settings" className={`nav-link ${pathname === '/admin/settings' ? 'active' : ''}`}>
          <Settings size={20} />
          Configuración
        </Link>
        <button 
          className="nav-link" 
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
          onClick={() => logout()}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
