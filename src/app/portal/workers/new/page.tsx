import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RegistrationForm from "@/components/portal/workers/RegistrationForm";

export default function NewPortalWorkerPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <Link
          href="/portal/workers"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Volver al directorio
        </Link>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Registrar Nuevo TOE
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Ingresa los datos del trabajador ocupacionalmente expuesto.
        </p>
      </header>

      <RegistrationForm />
    </div>
  );
}
