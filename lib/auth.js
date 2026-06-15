import { ShieldCheck, User, UserCog, ClipboardList, LayoutGrid } from 'lucide-react';

export const ROLES = {
  ADMIN: 'administrador',
  ESPECIALISTA: 'especialista',
  ADMISION: 'admision',
  DIRECTIVO: 'directivo',
  COORDINADOR: 'coordinador',
  BAREMO: 'baremo',
  CEDULA: 'cedula',
};

export const ROL_LABELS = {
  administrador: 'Administrador',
  especialista:  'Especialista',
  admision:      'Personal de Admisión',
  directivo:     'Directivo',
  coordinador:   'Coordinador',
  baremo:        'Baremo',
  cedula:        'Cédula Hospitalaria',
};

export const ROL_COLORS = {
  administrador: 'bg-purple-100 text-purple-700',
  especialista:  'bg-blue-100 text-blue-700',
  admision:      'bg-emerald-100 text-emerald-700',
  directivo:     'bg-amber-100 text-amber-700',
  coordinador:   'bg-cyan-100 text-cyan-700',
  cedula:        'bg-rose-100 text-rose-700',
};

export const ROL_ICON = {
  administrador: ShieldCheck,
  especialista:  User,
  admision:      UserCog,
  directivo:     ShieldCheck,
  coordinador:   UserCog,
  cedula:        ClipboardList,
};

/**
 * Route prefix → roles permitidos.
 * Se compara con pathname.startsWith(pattern).
 * Si una ruta no está en la lista, es accesible para todos los autenticados.
 */
export const ROUTE_PERMISSIONS = [
  { pattern: '/inicio',              roles: ['administrador', 'directivo'] },
  { pattern: '/cedula-hospitalaria', roles: ['cedula', 'administrador', 'directivo'] },
  { pattern: '/dashboard',      roles: ['administrador'] },
  { pattern: '/proyeccion',     roles: ['administrador', 'directivo'] },
  { pattern: '/casos',          roles: ['administrador', 'directivo', 'coordinador'] },
  { pattern: '/planes',        roles: ['administrador', 'directivo', 'coordinador', 'especialista'] },
  { pattern: '/admision',      roles: ['administrador', 'admision', 'directivo'] },
  { pattern: '/configuracion',  roles: ['administrador', 'directivo', 'especialista', 'admision', 'coordinador', 'baremo'] },
  { pattern: '/estadisticas',  roles: ['administrador', 'directivo'] },
  { pattern: '/mis-casos',     roles: ['especialista'] },
  { pattern: '/mi-agenda',     roles: ['especialista'] },
  { pattern: '/baremo',        roles: ['especialista', 'administrador', 'directivo', 'baremo'] },
  { pattern: '/horarios',      roles: ['administrador', 'directivo', 'coordinador', 'especialista', 'admision', 'baremo'] },
];

/** Ruta por defecto al hacer login o al redirigir por acceso denegado */
export const DEFAULT_ROUTE = {
  administrador: '/inicio',
  especialista:  '/mis-casos',
  admision:      '/admision',
  directivo:     '/inicio',
  coordinador:   '/planes',
  baremo:        '/baremo',
  cedula:        '/cedula-hospitalaria',
};

export const LUCES_ICON_INICIO = LayoutGrid;

/**
 * Verifica si un usuario tiene permiso para acceder a una ruta.
 * @param {string} pathname  - pathname actual
 * @param {string} rol       - rol del usuario
 * @returns {boolean}
 */
export function canAccess(pathname, rol) {
  const rule = ROUTE_PERMISSIONS.find(r => pathname === r.pattern || pathname.startsWith(r.pattern + '/'));
  if (!rule) return true;
  return rule.roles.includes(rol);
}
