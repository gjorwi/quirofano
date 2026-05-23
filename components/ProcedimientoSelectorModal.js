'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/components/AppProvider';
import { X, Search, FlaskConical, Check, Clock, Plus, Save, ChevronDown } from 'lucide-react';

export default function ProcedimientoSelectorModal({ onSelect, onClose }) {
  const { procedimientos, crearProcedimiento } = useData();
  const [busqueda, setBusqueda]         = useState('');
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [formNuevo, setFormNuevo]       = useState({ nombre: '', descripcion: '', duracionPromedioMin: '' });
  const [errsNuevo, setErrsNuevo]       = useState({});
  const [guardando, setGuardando]       = useState(false);

  const setN = (k, v) => { setFormNuevo(f => ({ ...f, [k]: v })); setErrsNuevo(e => ({ ...e, [k]: '' })); };

  const procedimientosFiltrados = useMemo(() => {
    const txt = busqueda.toLowerCase();
    return procedimientos.filter(p =>
      p.nombre.toLowerCase().includes(txt) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(txt))
    );
  }, [procedimientos, busqueda]);

  const handleSelect = (p) => { onSelect(p); onClose(); };

  const handleGuardar = async () => {
    const e = {};
    if (!formNuevo.nombre.trim()) e.nombre = 'Requerido';
    if (!formNuevo.duracionPromedioMin || Number(formNuevo.duracionPromedioMin) < 1) e.duracionPromedioMin = 'Requerido (mín. 1 min)';
    if (Object.keys(e).length) { setErrsNuevo(e); return; }
    setGuardando(true);
    try {
      const nuevo = await crearProcedimiento({
        nombre:              formNuevo.nombre.trim(),
        descripcion:         formNuevo.descripcion.trim(),
        duracionPromedioMin: Number(formNuevo.duracionPromedioMin),
      });
      onSelect(nuevo);
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Seleccionar Procedimiento</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">

          {/* Búsqueda */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" className="input-field pl-10"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} autoFocus />
          </div>

          {/* Lista */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {procedimientosFiltrados.length === 0 && (
              <div className="text-center py-6">
                <FlaskConical size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No se encontraron procedimientos</p>
              </div>
            )}
            {procedimientosFiltrados.map(p => (
              <button key={p._id} onClick={() => handleSelect(p)}
                className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm mb-1">{p.nombre}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      {p.duracionPromedioMin && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {p.duracionPromedioMin} min
                        </span>
                      )}
                      {p.descripcion && <span className="line-clamp-1">{p.descripcion}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check size={14} className="text-blue-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Registrar nuevo */}
          <div className="border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setMostrarForm(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              <Plus size={15} />
              {mostrarForm ? 'Cancelar registro' : '¿No está disponible? Registrar nuevo procedimiento'}
              <ChevronDown size={14} className={`transition-transform ${mostrarForm ? 'rotate-180' : ''}`} />
            </button>

            {mostrarForm && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Nuevo Procedimiento</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="label text-xs">Nombre *</label>
                    <input className={`input-field text-sm ${errsNuevo.nombre ? 'border-red-400' : ''}`}
                      value={formNuevo.nombre} onChange={e => setN('nombre', e.target.value)}
                      placeholder="Nombre del procedimiento" />
                    {errsNuevo.nombre && <p className="text-xs text-red-500 mt-0.5">{errsNuevo.nombre}</p>}
                  </div>
                  <div>
                    <label className="label text-xs">Duración Promedio (min) *</label>
                    <input type="number" className={`input-field text-sm ${errsNuevo.duracionPromedioMin ? 'border-red-400' : ''}`}
                      value={formNuevo.duracionPromedioMin} onChange={e => setN('duracionPromedioMin', e.target.value)}
                      placeholder="Ej. 90" min={1} />
                    {errsNuevo.duracionPromedioMin && <p className="text-xs text-red-500 mt-0.5">{errsNuevo.duracionPromedioMin}</p>}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="label text-xs">Descripción</label>
                    <textarea className="input-field text-sm" rows={2} value={formNuevo.descripcion}
                      onChange={e => setN('descripcion', e.target.value)}
                      placeholder="Descripción del procedimiento (opcional)" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={handleGuardar} disabled={guardando}
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                    <Save size={14} /> {guardando ? 'Guardando…' : 'Guardar y seleccionar'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
