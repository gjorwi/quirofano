'use client';
import { useState } from 'react';
import { useData } from '@/components/AppProvider';
import { showToast } from '@/components/ToastMessage';
import { X, Save, Building2 } from 'lucide-react';

export default function PisoForm({ piso, onClose }) {
  const { crearPiso, actualizarPiso } = useData();
  const esEdicion = Boolean(piso);
  const [form, setForm] = useState({
    nombre: piso?.nombre || '',
    orden:  piso?.orden ?? 0,
    descripcion: piso?.descripcion || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'Requerido';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (esEdicion) {
        await actualizarPiso(piso._id, form);
        showToast('Piso actualizado', 'success');
      } else {
        await crearPiso(form);
        showToast('Piso creado', 'success');
      }
      setTimeout(onClose, 500);
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-100 px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {esEdicion ? 'Editar piso' : 'Nuevo piso'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3">
          <div>
            <label className="label">Nombre *</label>
            <input
              className={`input-field ${errors.nombre ? 'border-red-400' : ''}`}
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej. Planta Baja"
              autoFocus
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <label className="label">Orden</label>
            <input
              type="number"
              className="input-field"
              value={form.orden}
              onChange={e => set('orden', Number(e.target.value))}
              placeholder="0 = primero"
            />
            <p className="text-[10px] text-slate-500 mt-1">Orden de aparición (menor = primero).</p>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Breve descripción del piso"
            />
          </div>
        </form>

        <div className="border-t border-slate-100 px-5 sm:px-6 py-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            <Save size={14} /> {saving ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear piso'}
          </button>
        </div>
      </div>
    </div>
  );
}
