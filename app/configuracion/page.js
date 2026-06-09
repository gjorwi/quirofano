'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/components/AppProvider';
import { useData } from '@/components/AppProvider';
import { showToast } from '@/components/ToastMessage';
import UserSelectorModal from '@/components/UserSelectorModal';
import { Users, Stethoscope, Building2, UserCog, ShieldAlert, Key, X } from 'lucide-react';
import { api } from '@/lib/apiClient';

export default function ConfiguracionPage() {

  const { user } = useAuth();
  const { usuarios, pacientes, especialistas, quirofanos, cambiarPassword } = useData();
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmarPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  const catalogs = [
    { href: '/configuracion/usuarios',      label: 'Usuarios',        desc: 'Gestion de usuarios del sistema',       icon: UserCog,      color: 'bg-indigo-500',  count: usuarios?.length ?? 0 },
    { href: '/configuracion/pacientes',     label: 'Pacientes',       desc: 'Gestion de pacientes registrados',      icon: Users,        color: 'bg-blue-500',    count: pacientes?.length ?? 0 },
    { href: '/configuracion/especialistas', label: 'Especialistas',   desc: 'Cirujanos y personal especializado',    icon: Stethoscope,  color: 'bg-purple-500',  count: especialistas?.length ?? 0 },
    { href: '/configuracion/quirofanos',    label: 'Quirofanos',      desc: 'Salas quirurgicas y equipamiento',      icon: Building2,    color: 'bg-emerald-500', count: quirofanos?.length ?? 0 },
  ];

  useEffect(() => {
    api.getSettings().then(s => setSettings(s || {})).catch(() => {});
  }, []);

  const toggleSetting = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setSavingSettings(true);
    try { await api.updateSettings({ [key]: next[key] }); }
    finally { setSavingSettings(false); }
  };

  const handleChangeOwnPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmarPassword) {
      showToast('Las contrasenas no coinciden', 'error');
      return;
    }
    if (passwordData.newPassword.length < 4) {
      showToast('La contrasena debe tener al menos 4 caracteres', 'error');
      return;
    }
    setChangingPw(true);
    try {
      await cambiarPassword(user._id, { newPassword: passwordData.newPassword });
      showToast('Contrasena actualizada exitosamente', 'success');
      setPasswordData({ newPassword: '', confirmarPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const handleSelectUserForPassword = (u) => {
    setSelectedUser(u);
    setPasswordData({ newPassword: '', confirmarPassword: '' });
    setShowUserSelector(false);
    setShowPasswordForm(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmarPassword) {
      showToast('Las contrasenas no coinciden', 'error');
      return;
    }
    if (passwordData.newPassword.length < 4) {
      showToast('La contrasena debe tener al menos 4 caracteres', 'error');
      return;
    }
    setChangingPw(true);
    try {
      await cambiarPassword(selectedUser._id, { newPassword: passwordData.newPassword });
      showToast('Contrasena actualizada exitosamente', 'success');
      setShowPasswordForm(false);
      setSelectedUser(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const handleClosePasswordForm = () => {
    setShowPasswordForm(false);
    setSelectedUser(null);
  };

  const isAdminOrDirectivo = ['administrador', 'directivo'].includes(user?.rol);

  return (
    <div className="page-enter">
      <Header title="Configuracion" subtitle="Administracion de catalogos del sistema" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {isAdminOrDirectivo && (
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Catalogos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {catalogs.map(({ href, label, desc, icon: Icon, color, count }) => (
                <Link key={href} href={href}>
                  <div className="card p-6 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-800">{label}</h3>
                          <span className="text-2xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors">{count}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {['administrador', 'directivo'].includes(user?.rol) && (
          <>
            <section>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Seguridad</h2>
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Key size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Cambiar Contrasena</p>
                      <p className="text-xs text-slate-500 mt-0.5">Restablecer contrasena de cualquier usuario</p>
                    </div>
                  </div>
                  <button onClick={() => setShowUserSelector(true)} className="btn-secondary text-xs">
                    Seleccionar Usuario
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-4">Zona de Peligro</h2>
              <Link href="/configuracion/reset">
                <div className="card p-6 border-2 border-red-100 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <ShieldAlert size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-800">Reset de Datos</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Irreversible</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Eliminar colecciones completas del sistema. Requiere confirmacion por texto.
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          </>
        )}

        {!isAdminOrDirectivo && (
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Seguridad</h2>
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Key size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cambiar Mi Contrasena</p>
                  <p className="text-xs text-slate-500 mt-0.5">Actualizar mi contrasena de acceso</p>
                </div>
              </div>
              <form onSubmit={handleChangeOwnPassword} className="space-y-3">
                <div>
                  <label className="label">Nueva Contrasena</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(d => ({ ...d, newPassword: e.target.value }))}
                    placeholder="Minimo 4 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirmar Contrasena</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwordData.confirmarPassword}
                    onChange={e => setPasswordData(d => ({ ...d, confirmarPassword: e.target.value }))}
                    placeholder="Repetir contrasena"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={changingPw} className="btn-primary">
                    {changingPw ? 'Guardando...' : 'Cambiar Contrasena'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>

      {showPasswordForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Cambiar Contrasena</h2>
              </div>
              <button onClick={handleClosePasswordForm} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            {selectedUser && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">{selectedUser.nombre}</p>
                <p className="text-xs text-blue-600">@{selectedUser.username} - {selectedUser.rol}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="label">Nueva Contrasena</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(d => ({ ...d, newPassword: e.target.value }))}
                  placeholder="Minimo 4 caracteres"
                  required
                />
              </div>
              <div>
                <label className="label">Confirmar Contrasena</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordData.confirmarPassword}
                  onChange={e => setPasswordData(d => ({ ...d, confirmarPassword: e.target.value }))}
                  placeholder="Repetir contrasena"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClosePasswordForm} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={changingPw} className="btn-primary">
                  {changingPw ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserSelector && (
        <UserSelectorModal
          onSelect={handleSelectUserForPassword}
          onClose={() => setShowUserSelector(false)}
        />
      )}
    </div>
  );
}
