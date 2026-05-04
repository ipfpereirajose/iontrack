import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import LabWorkerForm from "@/components/lab/workers/LabWorkerForm";

export default async function NewWorkerPage(props: {
  params: Promise<{ id: string }>;
}) {
  try {
    const params = await props.params;
    const companyId = params?.id;

    if (!companyId) {
      throw new Error("El ID de la empresa no está presente en la URL.");
    }

    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2.5rem" }}>
          <Link
            href={`/lab/companies/${companyId}/workers`}
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
            Volver a la lista
          </Link>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            Registro de TOE
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Inscribe a un nuevo trabajador en el sistema.
          </p>
        </header>

        <LabWorkerForm companyId={companyId} />
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{ 
        padding: "2rem", 
        margin: "2rem", 
        background: "rgba(239, 68, 68, 0.1)", 
        border: "1px solid #ef4444",
        borderRadius: "12px",
        color: "white"
      }}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Error Crítico de Servidor</h2>
        <p>Hubo un fallo al renderizar la página de registro.</p>
        <pre style={{ 
          background: "black", 
          padding: "1rem", 
          marginTop: "1rem", 
          borderRadius: "8px",
          fontSize: "0.8rem",
          overflow: "auto"
        }}>
          {error?.message || "Error desconocido"}
          {"\n"}
          {error?.stack}
        </pre>
      </div>
    );
  }
}
