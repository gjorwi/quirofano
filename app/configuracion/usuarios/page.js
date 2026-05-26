'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useData } from '@/components/AppProvider';
import { ROL_LABELS, ROL_COLORS } from '@/lib/auth';
import { ArrowLeft, Plus, Pencil, Power, PowerOff, X, Save, Users } from 'lucide-react';

export default function UsuariosPage() {
  const { usuarios, especialistas, crearUsuario, actualizarUsuario, toggleUsuario } = useData();
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEdit = u => { setEditando(u._id); setFormData({ ...u }); setCreando(false); };
  const handleNew = () => {
    setCreando(true);
    setEditando(null);
    setFormData({ nombre: '', username: '', password: '', rol: 'especialista', especialistaId: null });
  };
  const handleSave = async () => {
    if (creando) {
      await crearUsuario(formData);
    } else {
      await actualizarUsuario(editando, formData);
    }
    setEditando(null);
    setCreando(false);
    setFormData({});
  };
  const handleCancel = () => { setEditando(null); setCreando(false); setFormData({}); };

  const set = (k, v) => setFormData(d => ({ ...d, [k]: v }));

  return (
    <div className="page-enter">
      <Header
        title="Usuarios del Sistema"
        subtitle={`${usuarios.length} usuarios registrados`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleNew} className="btn-primary">
              <Plus size={15} /> Nuevo Usuario
            </button>
            <Link href="/configuracion" className="btn-secondary">
              <ArrowLeft size={15} /> Volver
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Form inline */}
        {(creando || editando) && (
          <div className="card p-5 border-2 border-blue-200 bg-blue-50/30">
            <h3 className="section-title mb-4">{creando ? 'Nuevo Usuario' : 'Editar Usuario'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Nombre Completo *</label>
                <input className="input-field" value={formData.nombre || ''} onChange={e => set('nombre', e.target.value)} />
              </div>
              <div>
                <label className="label">Usuario (login) *</label>
                <input className="input-field" value={formData.username || ''} onChange={e => set('username', e.target.value)} />
              </div>
              <div>
                <label className="label">Contraseña *</label>
                <input type="password" className="input-field" value={formData.password || ''} onChange={e => set('password', e.target.value)} placeholder={editando ? '(dejar vacío para no cambiar)' : ''} />
              </div>
              <div>
                <label className="label">Rol *</label>
                <select className="select-field" value={formData.rol || 'especialista'} onChange={e => set('rol', e.target.value)}>
                  <option value="administrador">Administrador</option>
                  <option value="especialista">Especialista</option>
                  <option value="admision">Personal de Admisión</option>
                </select>
              </div>
              {formData.rol === 'especialista' && (
                <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <input
                    type="checkbox"
                    id="esJefeServicio"
                    checked={!!formData.esJefeServicio}
                    onChange={e => set('esJefeServicio', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="esJefeServicio" className="text-sm font-medium text-blue-800 cursor-pointer select-none">
                    Jefe de Servicio — puede ver el Plan Quirúrgico de todos los especialistas
                  </label>
                </div>
              )}
              {formData.rol === 'especialista' && (
                <div className="md:col-span-2">
                  <label className="label">Vincular a Especialista</label>
                  <select className="select-field" value={formData.especialistaId || ''} onChange={e => set('especialistaId', e.target.value)}>
                    <option value="">— Sin vincular —</option>
                    {especialistas.map(e => (
                      <option key={e._id} value={e._id}>{e.nombre} – {e.especialidad}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Vincula este usuario a un especialista del catálogo para que pueda ver sus casos.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCancel} className="btn-secondary"><X size={14} /> Cancelar</button>
              <button onClick={handleSave} className="btn-primary"><Save size={14} /> Guardar</button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Nombre</th>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header">Especialista Vinculado</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuarios.map(u => {
                  const esp = u.especialistaId ? especialistas.find(e => e._id === u.especialistaId) : null;
                  return (
                    <tr key={u._id} className={`hover:bg-slate-50 transition-colors group ${editando === u._id ? 'bg-blue-50' : ''}`}>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="font-semibold text-slate-800">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-sm text-slate-600">{u.username}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${ROL_COLORS[u.rol] || 'bg-slate-100 text-slate-600'}`}>
                          {ROL_LABELS[u.rol]}
                        </span>
                      </td>
                      <td className="table-cell">
                        {esp ? (
                          <div>
                            <p className="text-sm text-slate-700">{esp.nombre}</p>
                            <p className="text-xs text-slate-400">{esp.especialidad}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                          ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => toggleUsuario(u._id)}
                            className={`p-1.5 rounded-lg transition-colors ${u.activo ? 'hover:bg-red-100 text-red-600' : 'hover:bg-green-100 text-green-600'}`}
                            title={u.activo ? 'Desactivar' : 'Activar'}
                          >
                            {u.activo ? <PowerOff size={14} /> : <Power size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
