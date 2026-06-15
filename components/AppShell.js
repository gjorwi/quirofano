'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AppProvider';
import Sidebar from '@/components/Sidebar';
import UserPill from '@/components/UserPill';
import { Cross, ShieldOff, ArrowRight } from 'lucide-react';
import { canAccess, DEFAULT_ROUTE, ROL_LABELS } from '@/lib/auth';
import Link from 'next/link';

const RUTAS_SIN_SIDEBAR = ['/inicio', '/cedula-hospitalaria'];

function pathMatches(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, loading } = useAuth();

  const isPublic = pathname === '/login';
  const sinSidebar = RUTAS_SIN_SIDEBAR.some(p => pathMatches(pathname, p));

  // Redirect root "/" to role default after login
  useEffect(() => {
    if (!loading && user && pathname === '/') {
      router.replace(DEFAULT_ROUTE[user.rol] || '/dashboard');
    }
  }, [loading, user, pathname]);

  if (isPublic) return <>{children}</>;

  // Loading / unauthenticated — spinner (auth redirect handled in AppProvider)
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <Cross size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // ── Guardia de rutas por rol ───────────────────────────────────────────────
  if (!canAccess(pathname, user.rol)) {
    const defaultRoute = DEFAULT_ROUTE[user.rol] || '/';
    return (
      <div className="h-screen overflow-hidden bg-slate-100 lg:flex">
        <Sidebar />
        <main className="h-screen overflow-y-auto lg:flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mx-auto">
              <ShieldOff size={32} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso denegado</h1>
              <p className="text-slate-500 text-sm">
                Tu rol <span className="font-semibold text-slate-700">({ROL_LABELS[user.rol]})</span> no tiene
                permiso para acceder a esta sección.
              </p>
            </div>
            <Link
              href={defaultRoute}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Ir a mi sección <ArrowRight size={15} />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Layout SIN sidebar (módulos independientes: Inicio, Cédula Hospitalaria) ──
  if (sinSidebar) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5 print:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Cross size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">SICAQ</p>
                <p className="text-[10px] text-slate-500 truncate">Sistema de Control y Administración Quirúrgica</p>
              </div>
            </div>
            <UserPill />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // ── Layout CON sidebar (Gestión de Quirófano) ──
  return (
    <div className="h-screen overflow-hidden bg-slate-100 lg:flex">
      <Sidebar />
      <main className="h-screen overflow-y-auto lg:flex-1">
        {children}
      </main>
    </div>
  );
}
