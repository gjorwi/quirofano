import './globals.css';
import AppProvider from '@/components/AppProvider';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'QuirófanoApp – Gestión de Casos Quirúrgicos',
  description: 'Sistema de administración y gestión de casos quirúrgicos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
