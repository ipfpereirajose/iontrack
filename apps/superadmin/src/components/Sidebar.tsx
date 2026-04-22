'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Activity, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Laboratorios', href: '/tenants', icon: Users },
    { name: 'Facturación', href: '/billing', icon: CreditCard },
    { name: 'Telemetría', href: '/telemetry', icon: Activity },
  ];

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
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
        <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
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
