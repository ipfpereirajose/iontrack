import Sidebar from "@/components/portal/Sidebar";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Portal Empresas",
  description: "Portal de Auto-Servicio para Empresas Clientes de Dosimetría",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="dashboard-layout"
      style={{ "--primary": "var(--color-portal)" } as any}
    >
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
