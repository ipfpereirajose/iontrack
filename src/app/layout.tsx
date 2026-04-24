import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'I.O.N.T.R.A.C.K. | Infraestructura Operativa de Dosimetría',
  description: 'Plataforma SaaS para la gestión integral y normativa de seguridad radiológica.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
