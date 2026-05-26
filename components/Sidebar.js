'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Stethoscope, CalendarDays, ClipboardList,
  Settings, ChevronRight, Cross, LogOut, User, ShieldCheck, UserCog, Menu, X, Users, BarChart3
} from 'lucide-react';
import { useAuth } from '@/components/AppProvider';
import { ROL_LABELS, ROL_COLORS } from '@/lib/auth';

const NAV_BY_ROLE = {
  administrador: [
    { href: '/dashboard',     label: 'Dashboard',           icon: LayoutDashboard },
    { href: '/proyeccion',    label: 'Proyección Quirúrgica', icon: Users },
    { href: '/casos',         label: 'Casos Quirúrgicos',   icon: Stethoscope },
    { href: '/planes',        label: 'Plan Quirúrgico',     icon: CalendarDays },
    { href: '/admision',      label: 'Admisión',            icon: ClipboardList },
    { href: '/estadisticas',  label: 'Estadísticas',        icon: BarChart3 },
    { href: '/configuracion', label: 'Configuración',       icon: Settings },
  ],
  especialista: [
    { href: '/mis-casos',  label: 'Mis Casos',        icon: Stethoscope },
    { href: '/mi-agenda',  label: 'Mi Agenda',        icon: CalendarDays },
  ],
  admision: [
    { href: '/admision', label: 'Admisión', icon: ClipboardList },
  ],
};

const ROL_ICON = {
  administrador: ShieldCheck,
  especialista:  User,
  admision:      UserCog,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseNav = NAV_BY_ROLE[user?.rol] || [];
  const navItems = user?.rol === 'especialista' && user?.esJefeServicio
    ? [...baseNav, { href: '/planes', label: 'Plan Quirúrgico', icon: CalendarDays }]
    : baseNav;
  const RolIcon = ROL_ICON[user?.rol] || User;
  const rolLabel = ROL_LABELS[user?.rol] || '';
  const rolBadge = ROL_COLORS[user?.rol] || 'bg-slate-100 text-slate-600';

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900 text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-slate-900 flex flex-col h-screen z-50 transition-transform duration-300
        fixed top-0 left-0
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Cross className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SICAQ</p>
            <p className="text-slate-400 text-xs">Gestión Quirúrgica</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* User badge */}
      <div className="px-4 py-3 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
            <RolIcon size={15} className="text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-xs font-semibold truncate">{user?.nombre}</p>
            <span className={`inline-block mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${rolBadge}`}>
              {rolLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">Menú</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group
                ${active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-70" />}
            </Link>
          );
        })}

        {/* Logout — inside scrollable nav so always reachable on mobile */}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <button
            onClick={() => { setMobileOpen(false); logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="flex-1 text-left">Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </aside>
    </>
  );
}
