import Sidebar from "@/components/lab/Sidebar";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Lab Manager",
  description: "Sistema de Gestión Dosimétrica para Laboratorios",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dashboard-layout"
      style={{ "--primary": "var(--color-lab)" } as any}
    >
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
