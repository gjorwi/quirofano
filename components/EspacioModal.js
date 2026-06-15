'use client';
import { useState, useEffect, useMemo } from 'react';
import { useData, useAuth } from '@/components/AppProvider';
import { showToast } from '@/components/ToastMessage';
import { TIPOS_ESPACIO } from '@/components/BocetoPiso';
import {
  X, Save, Building2, Wrench, Trophy, AlertCircle, FileText,
  Plus, Trash2, Pencil, Check, MapPin, User, Maximize2, Activity
} from 'lucide-react';

const TABS = [
  { id: 'general',        label: 'General',        icon: Building2  },
  { id: 'equipamiento',   label: 'Equipamiento',   icon: Wrench     },
  { id: 'logros',         label: 'Logros',         icon: Trophy     },
  { id: 'requerimientos', label: 'Requerimientos', icon: AlertCircle },
  { id: 'observaciones',  label: 'Observaciones',  icon: FileText   },
];

const ESTADOS_ESP = {
  operativo:       { label: 'Operativo',       cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  en_reparacion:   { label: 'En reparación',   cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  fuera_servicio:  { label: 'Fuera de servicio', cls: 'bg-red-100 text-red-700 border-red-200' },
  planificacion:   { label: 'En planificación', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const PRIORIDAD_CLS = {
  alta:  'bg-red-100 text-red-700 border-red-200',
  media: 'bg-amber-100 text-amber-700 border-amber-200',
  baja:  'bg-slate-100 text-slate-700 border-slate-200',
};

const REQ_ESTADO_CLS = {
  pendiente:  'bg-amber-100 text-amber-700 border-amber-200',
  en_proceso: 'bg-blue-100 text-blue-700 border-blue-200',
  resuelto:   'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EspacioModal({ espacio, onClose, onEdit, onDelete }) {
  const { user } = useAuth();
  const { actualizarEspacio, eliminarEspacio, pisos } = useData();
  const [tab, setTab] = useState('general');
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [nuevoEquipo, setNuevoEquipo] = useState('');
  const [editLogro, setEditLogro] = useState(null);
  const [editReq, setEditReq] = useState(null);

  const piso = useMemo(
    () => form ? pisos.find(p => p._id === (form.pisoId?._id || form.pisoId)) : null,
    [pisos, form]
  );

  useEffect(() => {
    setForm(espacio ? {
      ...espacio,
      pisoId: espacio.pisoId?._id || espacio.pisoId,
      equipamiento: Array.isArray(espacio.equipamiento) ? [...espacio.equipamiento] : [],
      logros: Array.isArray(espacio.logros) ? espacio.logros.map(l => ({ ...l })) : [],
      requerimientos: Array.isArray(espacio.requerimientos) ? espacio.requerimientos.map(r => ({ ...r })) : [],
    } : null);
    setEditando(false);
    setTab('general');
  }, [espacio]);

  if (!espacio || !form) return null;
  const tipo = TIPOS_ESPACIO[form.tipo] || TIPOS_ESPACIO.otro;
  const estado = ESTADOS_ESP[form.estado] || ESTADOS_ESP.operativo;
  const puedeEditar = ['cedula', 'administrador', 'directivo'].includes(user?.rol);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Equipamiento ──
  const addEquipo = () => {
    const t = nuevoEquipo.trim();
    if (!t) return;
    if (form.equipamiento.includes(t)) { showToast('Ese equipo ya está registrado', 'warning'); return; }
    set('equipamiento', [...form.equipamiento, t]);
    setNuevoEquipo('');
  };
  const removeEquipo = (i) => set('equipamiento', form.equipamiento.filter((_, idx) => idx !== i));

  // ── Logros ──
  const saveLogro = (l) => {
    if (!l.descripcion?.trim()) { showToast('La descripción es requerida', 'error'); return; }
    const list = form.logros.filter(x => x !== editLogro);
    list.push({ fecha: l.fecha || todayStr(), descripcion: l.descripcion.trim(), autor: l.autor || '' });
    set('logros', list);
    setEditLogro(null);
  };
  const delLogro = (l) => set('logros', form.logros.filter(x => x !== l));

  // ── Requerimientos ──
  const saveReq = (r) => {
    if (!r.descripcion?.trim()) { showToast('La descripción es requerida', 'error'); return; }
    const list = form.requerimientos.filter(x => x !== editReq);
    list.push({
      fecha: r.fecha || todayStr(),
      descripcion: r.descripcion.trim(),
      prioridad: r.prioridad || 'media',
      estado: r.estado || 'pendiente',
      fechaResolucion: r.estado === 'resuelto' ? (r.fechaResolucion || todayStr()) : '',
    });
    set('requerimientos', list);
    setEditReq(null);
  };
  const delReq = (r) => set('requerimientos', form.requerimientos.filter(x => x !== r));
  const toggleReq = (r) => {
    const list = form.requerimientos.map(x => x === r
      ? { ...x, estado: x.estado === 'resuelto' ? 'pendiente' : 'resuelto', fechaResolucion: x.estado === 'resuelto' ? '' : todayStr() }
      : x
    );
    set('requerimientos', list);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, pisoId: form.pisoId?._id || form.pisoId };
      await actualizarEspacio(espacio._id, payload);
      showToast('Espacio actualizado', 'success');
      setEditando(false);
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el espacio "${espacio.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarEspacio(espacio._id);
      showToast('Espacio eliminado', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header con gradiente del tipo */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${tipo.fill}22, ${tipo.fill}10)` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: tipo.fill }}>
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{form.nombre}</h2>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/80 text-slate-700">
                  {form.codigo}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold" style={{ color: tipo.text }}>{tipo.label}</span>
                {piso && <><span>·</span><MapPin size={11} /><span>{piso.nombre}</span></>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/60 text-slate-500 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-3 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
                ${tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <t.icon size={14} /> {t.label}
              {t.id === 'logros' && form.logros.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded-full font-bold">{form.logros.length}</span>
              )}
              {t.id === 'requerimientos' && form.requerimientos.filter(r => r.estado !== 'resuelto').length > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded-full font-bold">
                  {form.requerimientos.filter(r => r.estado !== 'resuelto').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Estado" value={<span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${estado.cls}`}>{estado.label}</span>} />
                <Stat label="Área" value={form.areaM2 ? `${form.areaM2} m²` : '—'} />
                <Stat label="Capacidad" value={form.capacidad ? `${form.capacidad} pers.` : '—'} />
                <Stat label="Piso" value={piso?.nombre || '—'} />
              </div>

              <div>
                <label className="label">Responsable</label>
                {editando ? (
                  <input className="input-field" value={form.responsable || ''} onChange={e => set('responsable', e.target.value)} />
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700">{form.responsable || '—'}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo</label>
                  {editando ? (
                    <select className="select-field" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                      {Object.entries(TIPOS_ESPACIO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  ) : (
                    <div className="input-field flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: tipo.fill }} />
                      <span className="text-sm text-slate-700">{tipo.label}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Estado</label>
                  {editando ? (
                    <select className="select-field" value={form.estado} onChange={e => set('estado', e.target.value)}>
                      {Object.entries(ESTADOS_ESP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  ) : (
                    <div className="input-field">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${estado.cls}`}>{estado.label}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Área (m²)</label>
                  {editando
                    ? <input type="number" min="0" className="input-field" value={form.areaM2 || 0} onChange={e => set('areaM2', Number(e.target.value))} />
                    : <div className="input-field text-sm">{form.areaM2 ? `${form.areaM2} m²` : '—'}</div>}
                </div>
                <div>
                  <label className="label">Capacidad</label>
                  {editando
                    ? <input type="number" min="0" className="input-field" value={form.capacidad || 0} onChange={e => set('capacidad', Number(e.target.value))} />
                    : <div className="input-field text-sm">{form.capacidad || '—'}</div>}
                </div>
              </div>
            </div>
          )}

          {tab === 'equipamiento' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">Inventario físico del espacio. Lista los equipos, instrumentos e instalaciones que lo componen.</div>
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {form.equipamiento.length === 0 && (
                  <li className="p-4 text-sm text-slate-400 text-center">Sin equipamiento registrado.</li>
                )}
                {form.equipamiento.map((eq, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 p-3 bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wrench size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{eq}</span>
                    </div>
                    {editando && (
                      <button onClick={() => removeEquipo(i)} className="p-1 rounded hover:bg-red-100 text-red-600 flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {editando && (
                <div className="flex items-center gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="Ej. Mesa quirúrgica, Monitor, …"
                    value={nuevoEquipo}
                    onChange={e => setNuevoEquipo(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEquipo(); } }}
                  />
                  <button onClick={addEquipo} className="btn-secondary"><Plus size={14} /> Agregar</button>
                </div>
              )}
            </div>
          )}

          {tab === 'logros' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">Hitos y avances relevantes conseguidos en este espacio.</div>
              {editLogro ? (
                <div className="border-2 border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-[10px]">Fecha</label>
                      <input type="date" className="input-field" value={editLogro.fecha} onChange={e => setEditLogro({ ...editLogro, fecha: e.target.value })} />
                    </div>
                    <div>
                      <label className="label text-[10px]">Autor</label>
                      <input className="input-field" value={editLogro.autor || ''} onChange={e => setEditLogro({ ...editLogro, autor: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label text-[10px]">Descripción</label>
                    <textarea rows={2} className="input-field resize-none" value={editLogro.descripcion} onChange={e => setEditLogro({ ...editLogro, descripcion: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditLogro(null)} className="btn-secondary">Cancelar</button>
                    <button onClick={() => saveLogro(editLogro)} className="btn-primary"><Check size={14} /> Guardar</button>
                  </div>
                </div>
              ) : editando && (
                <button onClick={() => setEditLogro({ fecha: todayStr(), descripcion: '', autor: '' })} className="btn-secondary w-full">
                  <Plus size={14} /> Agregar logro
                </button>
              )}
              <ul className="space-y-2">
                {form.logros.length === 0 && !editando && (
                  <li className="p-4 text-sm text-slate-400 text-center border border-dashed border-slate-200 rounded-lg">Sin logros registrados.</li>
                )}
                {form.logros.map((l, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
                    <Trophy size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800">{l.descripcion}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <span>{l.fecha}</span>
                        {l.autor && <><span>·</span><span>{l.autor}</span></>}
                      </div>
                    </div>
                    {editando && (
                      <button onClick={() => delLogro(l)} className="p-1 rounded hover:bg-red-100 text-red-600 flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'requerimientos' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">Necesidades, faltantes o tareas pendientes para este espacio.</div>
              {editReq ? (
                <div className="border-2 border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-[10px]">Fecha</label>
                      <input type="date" className="input-field" value={editReq.fecha} onChange={e => setEditReq({ ...editReq, fecha: e.target.value })} />
                    </div>
                    <div>
                      <label className="label text-[10px]">Prioridad</label>
                      <select className="select-field" value={editReq.prioridad} onChange={e => setEditReq({ ...editReq, prioridad: e.target.value })}>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label text-[10px]">Descripción</label>
                    <textarea rows={2} className="input-field resize-none" value={editReq.descripcion} onChange={e => setEditReq({ ...editReq, descripcion: e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-[10px]">Estado</label>
                    <select className="select-field" value={editReq.estado} onChange={e => setEditReq({ ...editReq, estado: e.target.value, fechaResolucion: e.target.value === 'resuelto' ? (editReq.fechaResolucion || todayStr()) : '' })}>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditReq(null)} className="btn-secondary">Cancelar</button>
                    <button onClick={() => saveReq(editReq)} className="btn-primary"><Check size={14} /> Guardar</button>
                  </div>
                </div>
              ) : editando && (
                <button onClick={() => setEditReq({ fecha: todayStr(), descripcion: '', prioridad: 'media', estado: 'pendiente' })} className="btn-secondary w-full">
                  <Plus size={14} /> Agregar requerimiento
                </button>
              )}
              <ul className="space-y-2">
                {form.requerimientos.length === 0 && !editando && (
                  <li className="p-4 text-sm text-slate-400 text-center border border-dashed border-slate-200 rounded-lg">Sin requerimientos registrados.</li>
                )}
                {form.requerimientos.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                    <AlertCircle size={15} className={`flex-shrink-0 mt-0.5 ${r.estado === 'resuelto' ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${r.estado === 'resuelto' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{r.descripcion}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${PRIORIDAD_CLS[r.prioridad]}`}>
                          {r.prioridad}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${REQ_ESTADO_CLS[r.estado]}`}>
                          {r.estado.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">{r.fecha}</span>
                        {r.fechaResolucion && r.estado === 'resuelto' && (
                          <span className="text-[10px] text-emerald-600">· resuelto {r.fechaResolucion}</span>
                        )}
                      </div>
                    </div>
                    {editando && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleReq(r)} title="Cambiar estado" className="p-1 rounded hover:bg-emerald-100 text-emerald-600">
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditReq({ ...r })} className="p-1 rounded hover:bg-blue-100 text-blue-600">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => delReq(r)} className="p-1 rounded hover:bg-red-100 text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'observaciones' && (
            <div>
              {editando
                ? <textarea rows={8} className="input-field resize-none" value={form.observaciones || ''} onChange={e => set('observaciones', e.target.value)} />
                : <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap min-h-[100px]">{form.observaciones || '—'}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 sm:px-6 py-3 flex items-center justify-between gap-2 flex-shrink-0">
          <div>
            {puedeEditar && !editando && (
              <button onClick={handleDelete} className="text-xs text-red-600 hover:text-red-700 hover:underline">Eliminar espacio</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary">Cerrar</button>
            {puedeEditar && (
              editando
                ? <button onClick={handleSave} disabled={saving} className="btn-primary">
                    <Save size={14} /> {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                : <button onClick={() => setEditando(true)} className="btn-primary">
                    <Pencil size={14} /> Editar
                  </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}
