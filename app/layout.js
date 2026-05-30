import './globals.css';
import AppProvider from '@/components/AppProvider';
import AppShell from '@/components/AppShell';
import ToastProvider from '@/components/ToastMessage';

export const metadata = {
  title: 'SICAQ – Sistema de Control y Administración Quirúrgica',
  description: 'Sistema integral de gestión y control de casos quirúrgicos',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <ToastProvider>
            <AppShell>
              {children}
            </AppShell>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
