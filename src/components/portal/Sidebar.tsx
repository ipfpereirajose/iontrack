"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  History,
  Download,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "Mi Personal (TOE)", href: "/portal/workers", icon: Users },
    { name: "Historial de Dosis", href: "/portal/history", icon: History },
    { name: "Incidencias", href: "/portal/incidents", icon: ShieldCheck },
    { name: "Descargas", href: "/portal/downloads", icon: Download },
  ];

  return (
    <aside className="sidebar">
      <Link
        href="/portal"
        className="brand"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
      >
        <img 
          src="/logo.png" 
          alt="IONTRACK" 
          style={{ width: "110px", height: "auto" }} 
        />
      </Link>

      <nav className="nav-group">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/portal" && pathname.startsWith(item.href));
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

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <Link
          href="/portal/settings"
          className={`nav-link ${pathname === "/portal/settings" ? "active" : ""}`}
        >
          <Settings size={20} />
          Configuración
        </Link>
        <button
          className="nav-link"
          style={{ 
            color: "#f87171",
            marginTop: "0.25rem"
          }}
          onClick={() => logout()}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
