"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  FileText,
  Settings,
  LogOut,
  Activity,
  Database,
  Users,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import NotificationBell from "./NotificationBell";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Resumen", href: "/lab", icon: LayoutDashboard },
    { name: "Empresas Clientes", href: "/lab/companies", icon: Building2 },
    { name: "Consulta de TOEs", href: "/lab/toe-consultation", icon: Users },
    { name: "Carga Masiva", href: "/lab/bulk-import", icon: Database },
    { name: "Validación Dosis", href: "/lab/validation", icon: ClipboardCheck },
    { name: "Reportes y Certificados", href: "/lab/reports", icon: FileText },
    { name: "Gestión de Accesos", href: "/lab/users", icon: ShieldCheck },
  ];

  return (
    <aside className="sidebar">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <Link href="/lab" className="brand" style={{ marginBottom: 0, padding: 0 }}>
          <img 
            src="/logo.png" 
            alt="IONTRACK" 
            style={{ width: "110px", height: "auto" }} 
          />
          <div
            style={{
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginTop: "0.5rem",
            }}
          >
            Módulo Laboratorio
          </div>
        </Link>
        <NotificationBell />
      </div>

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

      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Link
          href="/lab/settings"
          className={`nav-link ${pathname === "/lab/settings" ? "active" : ""}`}
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
        >
          <Settings size={18} />
          Configuraciones
        </Link>
        <button
          className="nav-link"
          style={{ color: "#fca5a5", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
          onClick={() => logout()}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>

        <div
          className="glass-panel"
          style={{ 
            padding: "0.85rem", 
            marginTop: "1rem", 
            background: "rgba(255,255,255,0.03)", 
            border: "1px solid rgba(255,255,255,0.05)" 
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--state-safe)" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
              AGENTE LOCAL
            </span>
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
            Sincronizado: hace 2m
          </div>
        </div>
      </div>
    </aside>
  );
}
