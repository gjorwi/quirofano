const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const TOKEN_KEY = 'qx_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login: (body)              => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Catálogos
  getPacientes:       ()     => request('/api/pacientes'),
  crearPaciente:      (b)    => request('/api/pacientes', { method: 'POST', body: JSON.stringify(b) }),
  actualizarPaciente: (id,b) => request(`/api/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarPaciente:   (id)   => request(`/api/pacientes/${id}`, { method: 'DELETE' }),

  getEspecialistas:       ()     => request('/api/especialistas'),
  crearEspecialista:      (b)    => request('/api/especialistas', { method: 'POST', body: JSON.stringify(b) }),
  actualizarEspecialista: (id,b) => request(`/api/especialistas/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarEspecialista:   (id)   => request(`/api/especialistas/${id}`, { method: 'DELETE' }),

  getQuirofanos:       ()     => request('/api/quirofanos'),
  crearQuirofano:      (b)    => request('/api/quirofanos', { method: 'POST', body: JSON.stringify(b) }),
  actualizarQuirofano: (id,b) => request(`/api/quirofanos/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarQuirofano:   (id)   => request(`/api/quirofanos/${id}`, { method: 'DELETE' }),

  getProcedimientos:       ()     => request('/api/procedimientos'),
  crearProcedimiento:      (b)    => request('/api/procedimientos', { method: 'POST', body: JSON.stringify(b) }),
  actualizarProcedimiento: (id,b) => request(`/api/procedimientos/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarProcedimiento:   (id)   => request(`/api/procedimientos/${id}`, { method: 'DELETE' }),

  getDiagnosticos:       ()     => request('/api/diagnosticos'),
  crearDiagnostico:      (b)    => request('/api/diagnosticos', { method: 'POST', body: JSON.stringify(b) }),
  actualizarDiagnostico: (id,b) => request(`/api/diagnosticos/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarDiagnostico:   (id)   => request(`/api/diagnosticos/${id}`, { method: 'DELETE' }),

  getInsumos:       ()     => request('/api/insumos'),
  crearInsumo:      (b)    => request('/api/insumos', { method: 'POST', body: JSON.stringify(b) }),
  actualizarInsumo: (id,b) => request(`/api/insumos/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarInsumo:   (id)   => request(`/api/insumos/${id}`, { method: 'DELETE' }),

  // Casos
  getCasos:         (params) => request(`/api/casos${params ? '?' + new URLSearchParams(params) : ''}`),
  getCaso:          (id)     => request(`/api/casos/${id}`),
  crearCaso:        (b)      => request('/api/casos', { method: 'POST', body: JSON.stringify(b) }),
  actualizarCaso:   (id, b)  => request(`/api/casos/${id}`, { method: 'PATCH', body: JSON.stringify(b) }),
  eliminarCaso:     (id)     => request(`/api/casos/${id}`, { method: 'DELETE' }),

  // Planes
  getPlanes:        (params) => request(`/api/planes${params ? '?' + new URLSearchParams(params) : ''}`),
  crearPlan:        (b)      => request('/api/planes', { method: 'POST', body: JSON.stringify(b) }),
  actualizarPlan:   (id, b)  => request(`/api/planes/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  eliminarPlan:     (id)     => request(`/api/planes/${id}`, { method: 'DELETE' }),

  // Admisiones
  getAdmisiones:        (params) => request(`/api/admisiones${params ? '?' + new URLSearchParams(params) : ''}`),
  crearAdmision:        (b)      => request('/api/admisiones', { method: 'POST', body: JSON.stringify(b) }),
  actualizarAdmision:   (id, b)  => request(`/api/admisiones/${id}`, { method: 'PUT', body: JSON.stringify(b) }),

  // Reset
  resetColeccion: (col) => request(`/api/reset/${col}`, { method: 'DELETE' }),

  // Usuarios
  getUsuarios:        ()       => request('/api/usuarios'),
  crearUsuario:       (b)      => request('/api/usuarios', { method: 'POST', body: JSON.stringify(b) }),
  actualizarUsuario:  (id, b)  => request(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
  toggleUsuario:      (id)     => request(`/api/usuarios/${id}/toggle`, { method: 'PATCH' }),
};
