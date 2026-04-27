import Sidebar from "@/components/lab/Sidebar";
import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Lab Manager",
  description: "Sistema de Gestión Dosimétrica para Laboratorios",
};

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentProfile();
  
  // 1. If no user, middleware handles redirect to login
  if (!user) return <>{children}</>;

  // 2. Critical Security Check: Ensure user is a lab admin or tech
  if (profile?.role !== "lab_admin" && profile?.role !== "lab_tech") {
    // Redirect unauthorized users to their correct portals
    if (profile?.role === "company_manager") redirect("/portal");
    if (profile?.role === "superadmin") redirect("/admin");
    redirect("/"); // Fallback
  }

  const showSidebar = true;

  return (
    <div
      className="dashboard-layout"
      style={{ 
        "--primary": "var(--color-lab)",
      } as any}
    >
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
