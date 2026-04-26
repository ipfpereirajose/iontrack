"use client";

import { Bell, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) markAsRead();
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          position: "relative",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bell
          size={22}
          color={unreadCount > 0 ? "var(--primary)" : "inherit"}
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "#ef4444",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 900,
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--bg)",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            width: "320px",
            marginTop: "1rem",
            zIndex: 1000,
            padding: "0",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", fontWeight: 800 }}>
              Notificaciones
            </h3>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Recientes
            </span>
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                }}
              >
                No hay notificaciones nuevas.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--border)",
                    background: n.is_read
                      ? "transparent"
                      : "rgba(6, 182, 212, 0.05)",
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ marginTop: "0.2rem" }}>
                    {n.type === "threshold_alert" ? (
                      <AlertTriangle size={16} color="#ef4444" />
                    ) : (
                      <Info size={16} color="var(--primary)" />
                    )}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: "0.75rem",
              textAlign: "center",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Ver todas las alertas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
