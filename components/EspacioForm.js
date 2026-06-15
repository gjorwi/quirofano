'use client';
import { useState } from 'react';
import { useData, useAuth } from '@/components/AppProvider';
import { showToast } from '@/components/ToastMessage';
import { TIPOS_ESPACIO } from '@/components/BocetoPiso';
import { X, Save, Building2, Wrench, Plus, Trash2 } from 'lucide-react';

export default function EspacioForm({ espacio, pisoInicial, onClose }) {
  const { user } = useAuth();
  const { pisos, espacios, crearEspacio, actualizarEspacio } = useData();
  const esEdicion = Boolean(espacio);

  const [form, setForm] = useState(() => {
    if (espacio) {
      return {
        ...espacio,
        pisoId: espacio.pisoId?._id || espacio.pisoId,
        equipamiento: Array.isArray(espacio.equipamiento) ? [...espacio.equipamiento] : [],
        logros:        Array.isArray(espacio.logros)        ? espacio.logros.map(l => ({ ...l }))        : [],
        requerimientos:Array.isArray(espacio.requerimientos)? espacio.requerimientos.map(r => ({ ...r })) : [],
      };
    }
    return {
      pisoId: pisoInicial?._id || pisoInicial || '',
      codigo: '',
      nombre: '',
      tipo: 'oficina',
      areaM2: 0,
      capacidad: 0,
      responsable: '',
      estado: 'operativo',
      equipamiento: [],
      logros: [],
      requerimientos: [],
      observaciones: '',
    };
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [nuevoEquipo, setNuevoEquipo] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.pisoId) e.pisoId = 'Seleccione un piso';
    if (!form.codigo?.trim()) e.codigo = 'Requerido';
    if (!form.nombre?.trim()) e.nombre = 'Requerido';
    if (!form.tipo) e.tipo = 'Requerido';
    if (!form.estado) e.estado = 'Requerido';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (esEdicion) {
        await actualizarEspacio(espacio._id, form);
        showToast('Espacio actualizado', 'success');
      } else {
        await crearEspacio(form);
        showToast('Espacio creado', 'success');
      }
      setTimeout(onClose, 500);
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addEquipo = () => {
    const t = nuevoEquipo.trim();
    if (!t) return;
    if (form.equipamiento.includes(t)) { showToast('Ese equipo ya está registrado', 'warning'); return; }
    set('equipamiento', [...form.equipamiento, t]);
    setNuevoEquipo('');
  };
  const removeEquipo = (i) => set('equipamiento', form.equipamiento.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        <div className="border-b border-slate-100 px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {esEdicion ? 'Editar espacio' : 'Nuevo espacio'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Piso, código, nombre, tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Piso *</label>
              <select
                className={`select-field ${errors.pisoId ? 'border-red-400' : ''}`}
                value={form.pisoId}
                onChange={e => set('pisoId', e.target.value)}
                disabled={esEdicion}
              >
                <option value="">— Seleccione piso —</option>
                {pisos.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
              </select>
              {errors.pisoId && <p className="text-xs text-red-500 mt-1">{errors.pisoId}</p>}
            </div>
            <div>
              <label className="label">Código *</label>
              <input
                className={`input-field ${errors.codigo ? 'border-red-400' : ''}`}
                value={form.codigo}
                onChange={e => set('codigo', e.target.value.toUpperCase())}
                placeholder="Ej. PB-08"
              />
              {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>}
            </div>
          </div>

          <div>
            <label className="label">Nombre *</label>
            <input
              className={`input-field ${errors.nombre ? 'border-red-400' : ''}`}
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej. Quirófano 5"
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">Tipo *</label>
              <select className="select-field" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {Object.entries(TIPOS_ESPACIO).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="select-field" value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="operativo">Operativo</option>
                <option value="en_reparacion">En reparación</option>
                <option value="fuera_servicio">Fuera de servicio</option>
                <option value="planificacion">En planificación</option>
              </select>
            </div>
            <div>
              <label className="label">Responsable</label>
              <input className="input-field" value={form.responsable} onChange={e => set('responsable', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Área (m²)</label>
              <input type="number" min="0" className="input-field" value={form.areaM2} onChange={e => set('areaM2', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Capacidad</label>
              <input type="number" min="0" className="input-field" value={form.capacidad} onChange={e => set('capacidad', Number(e.target.value))} />
            </div>
          </div>

          {/* Equipamiento */}
          <div>
            <label className="label flex items-center gap-1.5"><Wrench size={12} /> Equipamiento</label>
            <ul className="border border-slate-100 rounded-lg divide-y divide-slate-100 mb-2">
              {form.equipamiento.length === 0 && <li className="p-3 text-sm text-slate-400 text-center">Sin equipamiento</li>}
              {form.equipamiento.map((eq, i) => (
                <li key={i} className="flex items-center justify-between gap-2 p-2.5 px-3">
                  <span className="text-sm text-slate-700 truncate">{eq}</span>
                  <button type="button" onClick={() => removeEquipo(i)} className="p-1 rounded hover:bg-red-100 text-red-600">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <input
                className="input-field flex-1"
                placeholder="Ej. Mesa quirúrgica"
                value={nuevoEquipo}
                onChange={e => setNuevoEquipo(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEquipo(); } }}
              />
              <button type="button" onClick={addEquipo} className="btn-secondary"><Plus size={14} /> Agregar</button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="label">Observaciones</label>
            <textarea rows={3} className="input-field resize-none" value={form.observaciones} onChange={e => set('observaciones', e.target.value)} />
          </div>
        </form>

        <div className="border-t border-slate-100 px-5 sm:px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            <Save size={14} /> {saving ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear espacio'}
          </button>
        </div>
      </div>
    </div>
  );
}
