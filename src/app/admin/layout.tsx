import Sidebar from "@/components/admin/Sidebar";
import { getCurrentProfile } from "@/lib/auth";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Command Center",
  description:
    "Infraestructura Operativa Normativa para la Trazabilidad, Registro y Análisis de Control Kinético",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentProfile();
  const showSidebar = !!user;

  return (
    <div
      className="dashboard-layout"
      style={{ 
        "--primary": "var(--color-admin)",
        display: "grid",
        gridTemplateColumns: showSidebar ? "280px 1fr" : "1fr",
        minHeight: "100vh"
      } as any}
    >
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? "main-content" : ""}>{children}</main>
    </div>
  );
}
