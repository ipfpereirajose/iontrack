import { Fingerprint } from "lucide-react";

export default function LogicExplanation() {
  return (
    <section className="clean-panel">
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 800,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Fingerprint size={20} color="var(--primary-teal)" />
        Lógica de Asociación
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
        El sistema utilizará el <strong>RIF</strong> o <strong>Cédula</strong> para verificar si la entidad o persona ya existe. Se mantendrá el historial auditado en todo momento.
      </p>
    </section>
  );
}
