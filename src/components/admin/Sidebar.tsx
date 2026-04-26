"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  ShieldAlert,
  GitBranch,
  History,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Infraestructura", href: "/admin/infrastructure", icon: GitBranch },
    { name: "Laboratorios", href: "/admin/tenants", icon: Users },
    { name: "Administradores", href: "/admin/users", icon: UserCog },
    { name: "Facturación", href: "/admin/billing", icon: CreditCard },
    { name: "Solicitudes", href: "/admin/requests", icon: History },
    {
      name: "Historial Nacional",
      href: "/admin/national-history",
      icon: History,
    },
    { name: "Ciberseguridad", href: "/admin/security", icon: ShieldAlert },
    { name: "Telemetría", href: "/admin/telemetry", icon: Activity },
  ];

  return (
    <aside className="sidebar">
      <Link href="/admin" className="brand">
        I.O.N.<span className="brand-accent">TRACK</span>
      </Link>

      <nav className="nav-group">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <Link
          href="/admin/settings"
          className={`nav-link ${pathname === "/admin/settings" ? "active" : ""}`}
        >
          <Settings size={20} />
          Configuración
        </Link>
        <button
          className="nav-link"
          style={{ color: "#f87171" }}
          onClick={() => logout()}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
