import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/admin/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'I.O.N.T.R.A.C.K. | Command Center',
  description: 'Infraestructura Operativa Normativa para la Trazabilidad, Registro y Análisis de Control Kinético',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="dashboard-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
