import { Suspense } from "react";
import { Shield, UserPlus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import AdminUsersListWidget from "@/components/admin/users/AdminUsersListWidget";

export const dynamic = "force-dynamic";

export default async function AdminManagement() {
  return (
    <div className="space-y-8">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(245, 158, 11, 0.1)",
              padding: "0.25rem 0.75rem",
              borderRadius: "99px",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#f59e0b",
              marginBottom: "1rem",
            }}
          >
            <Shield size={14} />
            CONTROL DE ACCESO GLOBAL
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            Gestión de <span className="text-gradient">Administradores</span>
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Administre los niveles de privilegio y acceso de los usuarios del sistema.
          </p>
        </div>
        <Link href="?new=true" className="btn btn-primary" style={{ background: "#f59e0b" }}>
          <UserPlus size={20} />
          Nuevo Administrador
        </Link>
      </div>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando usuarios administradores...</div>}>
        <AdminUsersListWidget />
      </Suspense>

      <div
        style={{
          background: "rgba(245, 158, 11, 0.05)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          borderRadius: "16px",
          padding: "1.5rem",
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "var(--state-warning)",
            color: "white",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldAlert size={24} />
        </div>
        <div>
          <h3 style={{ fontWeight: 800, marginBottom: "0.25rem" }}>
            Advertencia de Seguridad
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Los cambios en los roles de administrador tienen efecto inmediato
            sobre la capacidad de modificar infraestructura y datos críticos.
            Todas las acciones en este panel son registradas en el log de
            auditoría inmutable.
          </p>
        </div>
      </div>
    </div>
  );
}
