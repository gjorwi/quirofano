export const ROLES = {
  ADMIN: 'administrador',
  ESPECIALISTA: 'especialista',
  ADMISION: 'admision',
};

export const mockUsers = [
  { id: 'u1', nombre: 'Admin Principal',     username: 'admin',        password: 'admin123', rol: 'administrador', especialistaId: null,  activo: true },
  { id: 'u2', nombre: 'Dr. Andrés Montoya',  username: 'dr.montoya',   password: 'pass123',  rol: 'especialista',  especialistaId: 'e1', activo: true },
  { id: 'u3', nombre: 'Dra. Carmen Solís',   username: 'dr.solis',     password: 'pass123',  rol: 'especialista',  especialistaId: 'e2', activo: true },
  { id: 'u4', nombre: 'Dr. Felipe Rojas',    username: 'dr.rojas',     password: 'pass123',  rol: 'especialista',  especialistaId: 'e3', activo: true },
  { id: 'u5', nombre: 'Dra. Valentina Cruz', username: 'dr.cruz',      password: 'pass123',  rol: 'especialista',  especialistaId: 'e4', activo: true },
  { id: 'u6', nombre: 'Dr. Hernán Palacios', username: 'dr.palacios',  password: 'pass123',  rol: 'especialista',  especialistaId: 'e5', activo: true },
  { id: 'u7', nombre: 'Dra. Isabel Vargas',  username: 'dr.vargas',    password: 'pass123',  rol: 'especialista',  especialistaId: 'e6', activo: true },
  { id: 'u8', nombre: 'Enf. Rosa Jiménez',   username: 'admision1',    password: 'pass123',  rol: 'admision',      especialistaId: null,  activo: true },
  { id: 'u9', nombre: 'Enf. Pedro Acosta',   username: 'admision2',    password: 'pass123',  rol: 'admision',      especialistaId: null,  activo: true },
];

export const ROL_LABELS = {
  administrador: 'Administrador',
  especialista:  'Especialista',
  admision:      'Personal de Admisión',
};

export const ROL_COLORS = {
  administrador: 'bg-purple-100 text-purple-700',
  especialista:  'bg-blue-100 text-blue-700',
  admision:      'bg-emerald-100 text-emerald-700',
};

/**
 * Route prefix → roles permitidos.
 * Se compara con pathname.startsWith(pattern).
 * Si una ruta no está en la lista, es accesible para todos los autenticados.
 */
export const ROUTE_PERMISSIONS = [
  { pattern: '/dashboard',      roles: ['administrador'] },
  { pattern: '/proyeccion',     roles: ['administrador'] },
  { pattern: '/casos',          roles: ['administrador'] },
  { pattern: '/planes',         roles: ['administrador'] },
  { pattern: '/admision',       roles: ['administrador', 'admision'] },
  { pattern: '/configuracion',  roles: ['administrador'] },
  { pattern: '/estadisticas',   roles: ['administrador'] },
  { pattern: '/mis-casos',      roles: ['especialista'] },
  { pattern: '/mi-agenda',      roles: ['especialista'] },
];

/** Ruta por defecto al hacer login o al redirigir por acceso denegado */
export const DEFAULT_ROUTE = {
  administrador: '/dashboard',
  especialista:  '/mis-casos',
  admision:      '/admision',
};

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
