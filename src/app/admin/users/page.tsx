import { Suspense } from "react";
import { getServiceSupabase } from "@/lib/supabase";
import {
  ShieldCheck,
  UserCog,
  Mail,
  Calendar,
  Shield,
  Trash2,
  UserPlus,
  Lock,
  Activity,
  Edit3,
} from "lucide-react";
import {
  updateUserRole,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
} from "./actions";
import Link from "next/link";
import EditUserModal from "./EditUserModal";

export const dynamic = "force-dynamic";

export default async function AdminManagement() {
  const supabase = getServiceSupabase();

  // Fetch all profiles
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("*, tenants(name)")
    .order("created_at", { ascending: false });

  // Fetch all auth users to get emails
  const {
    data: { users: authUsers },
    error: aError,
  } = await supabase.auth.admin.listUsers();

  if (pError || aError) {
    return (
      <div className="p-8 text-red-500">Error al cargar administradores.</div>
    );
  }

  // Combine data
  const users = profiles.map((profile) => {
    const authUser = authUsers.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || "N/A",
      lastSignIn: authUser?.last_sign_in_at,
    };
  });

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
            Administre los niveles de privilegio y acceso de los usuarios del
            sistema.
          </p>
        </div>
        <Link
          href="?new=true"
          className="btn btn-primary"
          style={{ background: "#f59e0b" }}
        >
          <UserPlus size={20} />
          Nuevo Administrador
        </Link>
      </div>

      <div className="clean-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol / Privilegio</th>
              <th>Entidad / Laboratorio</th>
              <th>Estatus</th>
              <th>Último Acceso</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "rgba(0,0,0,0.05)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <UserCog size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <Mail size={12} />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge ${user.role === "superadmin" ? "badge-danger" : "badge-success"}`}
                  >
                    {user.role.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td>
                  {user.tenants?.name || (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                        fontSize: "0.85rem",
                      }}
                    >
                      Acceso Global (SaaS)
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${user.status === "inactive" ? "badge-warning" : "badge-success"}`}
                  >
                    {user.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </td>
                <td>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Calendar size={14} />
                    {user.lastSignIn
                      ? new Date(user.lastSignIn).toLocaleDateString()
                      : "Nunca"}
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Link
                      href={`/admin/users?edit=${user.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem" }}
                      title="Editar Usuario"
                    >
                      <Edit3 size={18} />
                    </Link>

                    <form
                      action={async () => {
                        "use server";
                        await resetUserPassword(user.email);
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.5rem" }}
                        title="Reiniciar Contraseña"
                      >
                        <Lock size={18} />
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await updateUserStatus(
                          user.id,
                          user.status === "inactive" ? "active" : "inactive",
                        );
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: "0.5rem",
                          color:
                            user.status === "inactive" ? "#10b981" : "#f59e0b",
                        }}
                        title="Cambiar Estatus"
                      >
                        <Activity size={18} />
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await deleteUser(user.id);
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.5rem", color: "#ef4444" }}
                        title="Eliminar Acceso"
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          background: "rgba(245, 158, 11, 0.05)",
          border: "1px border var(--state-warning)",
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
      <Suspense fallback={null}>
        <EditUserModal users={users} />
      </Suspense>
    </div>
  );
}

// Simple Alert Icons
function ShieldAlert({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
