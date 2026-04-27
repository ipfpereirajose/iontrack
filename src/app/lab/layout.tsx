import Sidebar from "@/components/lab/Sidebar";
import { getCurrentProfile } from "@/lib/auth";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Lab Manager",
  description: "Sistema de Gestión Dosimétrica para Laboratorios",
};

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentProfile();
  const showSidebar = !!user;

  return (
    <div
      className="dashboard-layout"
      style={{ 
        "--primary": "var(--color-lab)",
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
