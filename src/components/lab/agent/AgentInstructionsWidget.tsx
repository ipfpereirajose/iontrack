import { Download, RefreshCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AgentInstructionsWidget({
  activeAgents,
}: {
  activeAgents: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="clean-panel" style={{ background: "var(--primary-dark)", color: "white" }}>
        <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Download size={20} />
          Instalar Agente
        </h3>
        <p style={{ fontSize: "0.875rem", opacity: 0.8, lineHeight: 1.6, marginBottom: "1.5rem" }}>
          El agente es un ejecutable ligero que monitorea una carpeta local y sube automáticamente los archivos de dosis a la plataforma.
        </p>
        
        <ol style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
          <li>Descarga el paquete del agente.</li>
          <li>Configura el <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 4px" }}>.env</code> con tu <b>Secret Key</b>.</li>
          <li>Ejecuta <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 4px" }}>node index.js</code> o usa el ejecutable.</li>
        </ol>

        <button className="btn btn-primary" style={{ width: "100%", background: "white", color: "var(--primary-dark)" }}>
          Descargar Agente (.zip)
          <Download size={18} />
        </button>
      </div>

      <div className="clean-panel">
        <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RefreshCcw size={16} />
          Estado del Sistema
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Conexiones Activas</span>
            <span style={{ fontWeight: 800 }}>{activeAgents}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Última Sincronización</span>
            <span style={{ fontWeight: 800 }}>Hoy, 14:45</span>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <Link href="/docs/agent" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--primary-teal)", textDecoration: "none", fontWeight: 700 }}>
              Ver Documentación Técnica
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
