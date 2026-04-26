import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";

export type ThreatLevel = "low" | "medium" | "high" | "critical";

export interface SecurityAlert {
  type:
    | "brute_force"
    | "suspicious_file"
    | "unauthorized_access"
    | "data_anomaly";
  level: ThreatLevel;
  details: string;
  ip_address?: string;
  user_id?: string;
}

export const SecuritySentinel = {
  /**
   * Logs a potential security threat to the audit system
   */
  async reportThreat(alert: SecurityAlert) {
    const supabase = getServiceSupabase();

    const { error } = await supabase.from("audit_logs").insert({
      action: `SECURITY_${alert.type.toUpperCase()}`,
      new_data: {
        threat_level: alert.level,
        details: alert.details,
      },
      ip_address: alert.ip_address || "0.0.0.0",
      user_id: alert.user_id,
      justification: `ALERTA DE SEGURIDAD: ${alert.level.toUpperCase()}`,
    });

    if (error) console.error("Error logging security threat:", error);

    // In a real system, we would trigger emails or push notifications here
    return !error;
  },

  /**
   * Scans a filename/type for malicious patterns (simulation)
   */
  async scanFile(
    filename: string,
    fileType: string,
  ): Promise<{ safe: boolean; reason?: string }> {
    const maliciousExtensions = [".exe", ".bat", ".sh", ".js", ".vbs", ".php"];
    const ext = filename
      .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
      .toLowerCase();

    if (maliciousExtensions.includes(`.${ext}`)) {
      await this.reportThreat({
        type: "suspicious_file",
        level: "high",
        details: `Intento de carga de archivo ejecutable prohibido: ${filename}`,
        ip_address: "CLIENT_IP_PLACEHOLDER",
      });
      return {
        safe: false,
        reason: "Tipo de archivo no permitido por seguridad",
      };
    }

    return { safe: true };
  },

  /**
   * Analyzes recent logs to detect patterns
   */
  async getRecentThreats(limit = 10) {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .ilike("action", "SECURITY_%")
      .order("created_at", { ascending: false })
      .limit(limit);

    return data || [];
  },
};
