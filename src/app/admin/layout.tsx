import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Command Center",
  description:
    "Infraestructura Operativa Normativa para la Trazabilidad, Registro y Análisis de Control Kinético",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="dashboard-layout"
      style={{ "--primary": "var(--color-admin)" } as any}
    >
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
