"use client";

import { useState } from "react";
import { 
  UserCog, 
  Mail, 
  Calendar, 
  Lock, 
  Activity, 
  Edit3, 
  Trash2, 
  Search,
  ChevronDown,
  ChevronUp,
  Shield
} from "lucide-react";
import Link from "next/link";
import { 
  resetUserPassword, 
  updateUserStatus, 
  deleteUser 
} from "@/app/admin/users/actions";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  lastSignIn?: string;
  tenants?: { name: string };
}

interface UserManagerProps {
  users: User[];
}

export default function UserManager({ users: initialUsers }: UserManagerProps) {
  const [search, setSearch] = useState("");
  const [collapsedRoles, setCollapsedRoles] = useState<Record<string, boolean>>({});

  const filteredUsers = initialUsers.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  // Group by role
  const groups = filteredUsers.reduce((acc, user) => {
    const role = user.role || "sin_rol";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  const toggleRole = (role: string) => {
    setCollapsedRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const rolesOrder = ["superadmin", "lab_admin", "lab_tech", "company_manager"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* SEARCH BAR */}
      <div className="glass-panel" style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, email o rol..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-main)",
            fontSize: "1rem"
          }}
        />
      </div>

      {/* GROUPS */}
      {Object.entries(groups)
        .sort(([a], [b]) => rolesOrder.indexOf(a) - rolesOrder.indexOf(b))
        .map(([role, roleUsers]) => (
        <div key={role} className="clean-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div 
            onClick={() => toggleRole(role)}
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(0,0,0,0.02)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              borderBottom: !collapsedRoles[role] ? "1px solid var(--border)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Shield size={18} color={role === 'superadmin' ? '#ef4444' : 'var(--primary)'} />
              <h3 style={{ fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {role.replace("_", " ")} 
                <span style={{ marginLeft: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  ({roleUsers.length})
                </span>
              </h3>
            </div>
            {collapsedRoles[role] ? <ChevronDown size={20} color="var(--text-muted)" /> : <ChevronUp size={20} color="var(--text-muted)" />}
          </div>

          <div style={{ 
            maxHeight: collapsedRoles[role] ? "0px" : "2000px", 
            overflow: "hidden", 
            transition: "max-height 0.4s ease-in-out" 
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody style={{ background: "white" }}>
                {roleUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                          width: "40px", height: "40px", background: "rgba(0,0,0,0.05)",
                          borderRadius: "10px", display: "flex", alignItems: "center",
                          justifyContent: "center", color: "var(--text-muted)"
                        }}>
                          <UserCog size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{user.first_name} {user.last_name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {user.tenants?.name || "Acceso Global (SaaS)"}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span className={`badge ${user.status === "inactive" ? "badge-warning" : "badge-success"}`}>
                        {user.status?.toUpperCase() || "ACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                        <Calendar size={14} />
                        {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : "Nunca"}
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <Link href={`/admin/users?edit=${user.id}`} className="btn btn-secondary" style={{ padding: "0.5rem" }}>
                          <Edit3 size={18} />
                        </Link>
                        <button onClick={() => resetUserPassword(user.email)} className="btn btn-secondary" style={{ padding: "0.5rem" }} title="Reiniciar Contraseña">
                          <Lock size={18} />
                        </button>
                        <button onClick={() => updateUserStatus(user.id, user.status === "inactive" ? "active" : "inactive")} 
                          className="btn btn-secondary" style={{ padding: "0.5rem", color: user.status === "inactive" ? "#10b981" : "#f59e0b" }} title="Cambiar Estatus">
                          <Activity size={18} />
                        </button>
                        <button onClick={() => { if(confirm('¿Eliminar acceso?')) deleteUser(user.id) }} 
                          className="btn btn-secondary" style={{ padding: "0.5rem", color: "#ef4444" }} title="Eliminar Acceso">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
