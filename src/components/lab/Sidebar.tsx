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

interface SidebarProps {
  logoUrl?: string | null;
}

export default function Sidebar({ logoUrl }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Resumen", href: "/lab", icon: LayoutDashboard },
    { name: "Empresas Clientes", href: "/lab/companies", icon: Building2 },
    { name: "Consulta de TOEs", href: "/lab/toe-consultation", icon: Users },
    { name: "Carga Masiva", href: "/lab/bulk-import", icon: Database },
    { name: "Agente Local", href: "/lab/agent", icon: Activity },
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
        <Link 
          href="https://www.physiontec.com/" 
          target="_blank" 
          className="brand" 
          style={{ marginBottom: 0, padding: "0.5rem" }}
        >
          <img 
            src={logoUrl || "/logo.png"} 
            alt="LAB LOGO" 
            style={{ 
              width: "100%", 
              maxWidth: "140px", 
              height: "auto",
              maxHeight: "60px",
              objectFit: "contain",
              filter: logoUrl ? "none" : "brightness(0) invert(1)" 
            }} 
          />
          <div
            style={{
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginTop: "0.5rem",
              textAlign: "center"
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


      </div>
    </aside>
  );
}
