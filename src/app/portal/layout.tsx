import Sidebar from "@/components/portal/Sidebar";
import { getCurrentProfile } from "@/lib/auth";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Portal Empresas",
  description: "Portal de Auto-Servicio para Empresas Clientes de Dosimetría",
};

export default async function PortalLayout({
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
        "--primary": "var(--color-portal)",
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
