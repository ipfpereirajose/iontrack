"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Save, Mail, Shield, Lock, User, UserPlus } from "lucide-react";
import { updateAdminUser, createAdminUser } from "./actions";

export default function EditUserModal({ users }: { users: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isNew = searchParams.get("new") === "true";

  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "lab_admin",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      const targetUser = users.find((u) => u.id === editId);
      if (targetUser) {
        setUser(targetUser);
        setFormData({
          email: targetUser.email,
          role: targetUser.role,
          password: "",
          firstName: targetUser.first_name || "",
          lastName: targetUser.last_name || "",
        });
      }
    } else if (isNew) {
      setUser(null);
      setFormData({
        email: "",
        role: "lab_admin",
        password: "",
        firstName: "",
        lastName: "",
      });
    } else {
      setUser(null);
    }
  }, [editId, isNew, users]);

  if (!editId && !isNew) return null;

  const handleClose = () => {
    router.push("/admin/users");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (isNew) {
        result = await createAdminUser(formData);
      } else {
        result = await updateAdminUser(user.id, formData);
      }

      if (result && !result.success) {
        alert("Error: " + result.error);
      } else {
        handleClose();
      }
    } catch (err: any) {
      console.error(err);
      alert(
        "Error crítico: " + (err.message || "Error desconocido al guardar"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "2.5rem",
          position: "relative",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          <X size={24} />
        </button>

        <div style={{ 
          marginBottom: "2rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1.5rem",
          margin: "-2.5rem -2.5rem 2rem -2.5rem",
          padding: "2.5rem",
          background: "linear-gradient(to bottom, #f8fafc, #ffffff)",
          borderRadius: "24px 24px 0 0"
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary-dark)" }}>
            {isNew ? "Nuevo Administrador" : "Editar Administrador"}
          </h2>
          {editId && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.25rem", fontFamily: "monospace" }}>
              REFERENCE ID: {editId}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                <User size={14} /> NOMBRE
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                APELLIDO
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              <Mail size={14} /> CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              <Shield size={14} /> ROL ADMINISTRATIVO
            </label>
            <select
              className="input-field"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="superadmin">SuperAdmin (Global)</option>
              <option value="lab_admin">Lab Admin (Restringido)</option>
              <option value="lab_tech">Lab Tech (Operativo)</option>
            </select>
          </div>

          <div
            className="form-group"
            style={{
              background: "rgba(0,0,0,0.03)",
              padding: "1rem",
              borderRadius: "12px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              <Lock size={14} />{" "}
              {isNew ? "CONTRASEÑA INICIAL" : "CAMBIAR CONTRASEÑA (Opcional)"}
            </label>
            <input
              type="password"
              required={isNew}
              placeholder={
                isNew ? "Mínimo 6 caracteres" : "Nueva contraseña personalizada"
              }
              className="input-field"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {!isNew && (
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                Dejar en blanco si no desea cambiar la contraseña actual.
              </p>
            )}
            {isNew && (
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                El usuario podrá cambiarla posteriormente.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: "1.5rem",
              width: "100%",
              justifyContent: "center",
              height: "3.5rem",
              fontSize: "1rem",
              boxShadow: "0 10px 20px -5px rgba(0, 168, 181, 0.3)"
            }}
          >
            {loading ? (
              "Guardando..."
            ) : isNew ? (
              <>
                <UserPlus size={20} /> Crear Administrador
              </>
            ) : (
              <>
                <Save size={20} /> Guardar Cambios
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
