'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AppProvider';
import { ROL_LABELS, ROL_COLORS, ROL_ICON, DEFAULT_ROUTE } from '@/lib/auth';
import { User, ChevronDown, LogOut, Home } from 'lucide-react';

export default function UserPill({ compact = false }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;
  const RolIcon = ROL_ICON[user.rol] || User;
  const rolLabel = ROL_LABELS[user.rol] || '';
  const rolBadge = ROL_COLORS[user.rol] || 'bg-slate-100 text-slate-600';
  const home = DEFAULT_ROUTE[user.rol] || '/inicio';

  if (compact) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md flex items-center justify-center transition-shadow"
          title={user.nombre}
        >
          <RolIcon size={16} className="text-blue-600" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <div className="p-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.nombre}</p>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${rolBadge}`}>{rolLabel}</span>
            </div>
            <Link
              href={home}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Home size={14} className="text-slate-500" /> Ir a mi inicio
            </Link>
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="w-9 h-9 rounded-full bg-blue-600/15 flex items-center justify-center flex-shrink-0">
          <RolIcon size={16} className="text-blue-600" />
        </div>
        <div className="hidden sm:flex flex-col items-start text-left leading-tight">
          <span className="text-xs font-semibold text-slate-800 max-w-[160px] truncate">{user.nombre}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rolBadge}`}>{rolLabel}</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 sm:hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.nombre}</p>
            <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${rolBadge}`}>{rolLabel}</span>
          </div>
          <Link
            href={home}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Home size={14} className="text-slate-500" /> Ir a mi inicio
          </Link>
          <Link
            href="/configuracion"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <User size={14} className="text-slate-500" /> Configuración
          </Link>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
