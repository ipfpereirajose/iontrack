"use client";

import { useState, useEffect } from "react";
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

interface SidebarProps {
  logoUrl?: string | null;
}

export default function Sidebar({ logoUrl }: SidebarProps) {
  const pathname = usePathname();
  const [incidentCount, setIncidentCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/portal/incidents/count");
        const data = await res.json();
        setIncidentCount(data.count || 0);
      } catch (e) {
        console.error("Error fetching incident count:", e);
      }
    };
    fetchCount();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "Mi Personal (TOE)", href: "/portal/workers", icon: Users },
    { name: "Historial de Dosis", href: "/portal/history", icon: History },
    { name: "Incidencias", href: "/portal/incidents", icon: ShieldCheck, badge: incidentCount },
    { name: "Descargas", href: "/portal/downloads", icon: Download },
  ];

  return (
    <aside className="sidebar">
      <Link 
        href="https://www.physiontec.com/" 
        target="_blank"
        className="brand" 
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      >
        <img 
          src={logoUrl || "/physion-logo.png"} 
          alt="LAB LOGO" 
          style={{ 
            width: "100%", 
            maxWidth: "160px", 
            height: "auto",
            maxHeight: "80px",
            objectFit: "contain",
            backgroundColor: logoUrl ? "transparent" : "white",
            padding: logoUrl ? "0" : "5px",
            borderRadius: "8px"
          }} 
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
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={20} />
                {item.name}
              </div>
              {item.badge && item.badge > 0 && (
                <span style={{ 
                  background: "#ef4444", 
                  color: "white", 
                  fontSize: "0.7rem", 
                  fontWeight: 900, 
                  padding: "2px 6px", 
                  borderRadius: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  {item.badge}
                </span>
              )}
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
