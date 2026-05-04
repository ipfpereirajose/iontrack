import { Upload } from "lucide-react";

export default function FileUploader({
  file,
  handleFileUpload,
}: {
  file: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className="clean-panel"
      style={{
        padding: "3rem",
        textAlign: "center",
        border: "2px dashed var(--border)",
        background: "var(--bg-main)",
      }}
    >
      <input
        type="file"
        id="file-upload"
        hidden
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
      />
      <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(0, 168, 181, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--primary-teal)",
          }}
        >
          <Upload size={32} />
        </div>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          {file ? file.name : "Subir archivo de datos"}
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Arrastra tu archivo Excel o CSV aquí o haz clic para buscar.
        </p>
        <div
          className="btn btn-primary"
          style={{ display: "inline-flex", padding: "0.75rem 2rem" }}
        >
          Seleccionar Archivo
        </div>
      </label>
    </div>
  );
}
