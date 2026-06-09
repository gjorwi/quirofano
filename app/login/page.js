'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AppProvider';
import { Cross, Eye, EyeOff, LogIn } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { ROLES, ROL_LABELS, DEFAULT_ROUTE } from '@/lib/auth';

const DEMO_USERS = [
  { username: 'admin',       password: 'admin123', rol: 'administrador' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hideDemoLogin, setHideDemoLogin] = useState(null);
  const [errorKey, setErrorKey] = useState(0);

  useEffect(() => {
    api.getSettings().then(s => setHideDemoLogin(!!s?.hideDemoLogin)).catch(() => setHideDemoLogin(false));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(form.username, form.password);
      if (result.success) {
        const rol = result.user.rol;
        router.push(DEFAULT_ROUTE[rol] || '/dashboard');
      } else {
        setErrorKey(k => k + 1);
        setError(result.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setErrorKey(k => k + 1);
      setError(err.message || 'Error de conexión. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u) => setForm({ username: u.username, password: u.password });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl mb-4">
            <Cross size={30} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">QuirófanoApp</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Gestión Quirúrgica</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Iniciar Sesión</h2>
          <p className="text-sm text-slate-500 mb-6">Ingrese sus credenciales de acceso</p>

          {error ? (
            <div key={errorKey} className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-sm font-medium animate-[fadeIn_0.3s_ease]">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="font-semibold">Error de autenticación</span>
              </div>
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Usuario</label>
              <input
                type="text"
                autoComplete="username"
                className="input-field"
                placeholder="Ej. admin"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn size={16} /> Ingresar
                </span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {hideDemoLogin === false && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Accesos de demostración</p>
            <div className="space-y-2">
              {DEMO_USERS.map(u => {
                const rolColor = {
                  administrador: 'border-purple-200 bg-purple-50',
                  especialista: 'border-blue-200 bg-blue-50',
                  admision: 'border-emerald-200 bg-emerald-50',
                }[u.rol];
                const badgeColor = {
                  administrador: 'bg-purple-100 text-purple-700',
                  especialista: 'bg-blue-100 text-blue-700',
                  admision: 'bg-emerald-100 text-emerald-700',
                }[u.rol];
                return (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => fillDemo(u)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left hover:shadow-sm transition-all ${rolColor}`}
                  >
                    <div>
                      <span className="text-sm font-mono font-semibold text-slate-700">{u.username}</span>
                      <span className="text-xs text-slate-400 ml-2">/ {u.password}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {ROL_LABELS[u.rol]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
