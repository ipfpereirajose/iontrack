import Sidebar from "@/components/admin/Sidebar";
import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

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
  const { user, profile } = await getCurrentProfile();
  
  // 1. If no user, let them see the login page (handled by middleware for protection)
  if (!user) return <>{children}</>;

  // 2. Critical Security Check: Only SuperAdmins allowed here
  if (profile?.role !== "superadmin") {
    if (profile?.role === "lab_admin" || profile?.role === "lab_tech") redirect("/lab");
    if (profile?.role === "company_manager") redirect("/portal");
    redirect("/");
  }

  const showSidebar = true;

  return (
    <div
      className="dashboard-layout"
      style={{ 
        "--primary": "var(--color-admin)",
      } as any}
    >
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
