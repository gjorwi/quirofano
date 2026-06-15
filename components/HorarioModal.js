'use client';
import { useState, useMemo, useEffect } from 'react';
import { useData, useAuth } from '@/components/AppProvider';
import { showToast } from '@/components/ToastMessage';
import { X, Save, Calendar, Clock, Stethoscope, FileText } from 'lucide-react';

const TIPOS = [
  { value: 'guardia',    label: 'Guardia',    color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'turno',      label: 'Turno',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'consulta',   label: 'Consulta',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'disponible', label: 'Disponible', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function HorarioModal({ horario, fechaInicial, onClose }) {
  const { especialistas, crearHorario, actualizarHorario } = useData();
  const { user } = useAuth();
  const esEdicion = Boolean(horario);

  const esAdminODirectivo = ['administrador', 'directivo'].includes(user?.rol);
  const miEspecialidad = useMemo(() => {
    if (user?.rol !== 'especialista' || !user?.especialistaId) return null;
    const esp = especialistas.find(e => e._id === user.especialistaId);
    return esp?.especialidad || null;
  }, [user, especialistas]);

  const especialistasPermitidos = useMemo(() => {
    if (esAdminODirectivo) return especialistas;
    if (user?.rol === 'especialista' && user?.esJefeServicio && miEspecialidad) {
      return especialistas.filter(e => e.especialidad === miEspecialidad);
    }
    return [];
  }, [especialistas, esAdminODirectivo, user, miEspecialidad]);

  const puedeRegistrar = especialistasPermitidos.length > 0;

  const [form, setForm] = useState({
    especialista:  horario?.especialista?._id || horario?.especialista || '',
    fecha:         horario?.fecha || fechaInicial || '',
    horaInicio:    horario?.horaInicio || '07:00',
    horaFin:       horario?.horaFin || '15:00',
    tipo:          horario?.tipo || 'guardia',
    observaciones: horario?.observaciones || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!esEdicion && especialistasPermitidos.length === 1 && !form.especialista) {
      setForm(f => ({ ...f, especialista: especialistasPermitidos[0]._id }));
    }
  }, [especialistasPermitidos, esEdicion, form.especialista]);

  const especialistaSel = useMemo(
    () => especialistas.find(e => e._id === form.especialista) || null,
    [especialistas, form.especialista]
  );

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.especialista) e.especialista = 'Seleccione un especialista';
    if (!form.fecha)        e.fecha = 'Requerida';
    if (!form.horaInicio)   e.horaInicio = 'Requerida';
    if (!form.horaFin)      e.horaFin = 'Requerida';
    if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
      e.horaFin = 'Debe ser mayor que la hora de inicio';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!puedeRegistrar) {
      showToast('No tiene permiso para registrar horarios de esta especialidad', 'error');
      return;
    }
    setSaving(true);
    try {
      if (esEdicion) {
        await actualizarHorario(horario._id, form);
        showToast('Horario actualizado correctamente', 'success');
      } else {
        await crearHorario(form);
        showToast('Horario registrado correctamente', 'success');
      }
      setTimeout(onClose, 600);
    } catch (err) {
      showToast(err.message || 'Error al guardar el horario', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!puedeRegistrar) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-3 flex items-center justify-center">
            <X size={20} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Sin permisos</h2>
          <p className="text-sm text-slate-500 mb-4">
            Su rol no permite registrar horarios para esta especialidad.
          </p>
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col">
        <div className="border-b border-slate-100 px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {esEdicion ? 'Editar horario' : 'Registrar horario de guardia'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Especialista */}
          <div>
            <label className="label">Especialista *</label>
            {especialistaSel ? (
              <div className="p-3 rounded-lg border-2 border-blue-300 bg-blue-50 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Stethoscope size={14} className="text-blue-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-blue-900 truncate">{especialistaSel.nombre}</p>
                  </div>
                  <p className="text-xs text-blue-700">{especialistaSel.especialidad}</p>
                  {especialistaSel.codigoColegiado && (
                    <p className="text-[10px] text-blue-600 mt-0.5 font-mono">Cód: {especialistaSel.codigoColegiado}</p>
                  )}
                </div>
                {especialistasPermitidos.length > 1 && !esEdicion && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, especialista: '' }))}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Cambiar
                  </button>
                )}
              </div>
            ) : (
              <select
                className={`select-field ${errors.especialista ? 'border-red-400' : ''}`}
                value={form.especialista}
                onChange={e => set('especialista', e.target.value)}
              >
                <option value="">— Seleccione especialista —</option>
                {especialistasPermitidos.map(e => (
                  <option key={e._id} value={e._id}>
                    {e.nombre} — {e.especialidad}
                  </option>
                ))}
              </select>
            )}
            {errors.especialista && <p className="text-xs text-red-500 mt-1">{errors.especialista}</p>}
            {user?.rol === 'especialista' && user?.esJefeServicio && miEspecialidad && (
              <p className="text-[10px] text-slate-500 mt-1">
                Como jefe de servicio solo puede registrar horarios de la especialidad <b>{miEspecialidad}</b>.
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="label">Fecha *</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                className={`input-field pl-9 ${errors.fecha ? 'border-red-400' : ''}`}
                value={form.fecha}
                onChange={e => set('fecha', e.target.value)}
              />
            </div>
            {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha}</p>}
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Hora inicio *</label>
              <input
                type="time"
                className={`input-field ${errors.horaInicio ? 'border-red-400' : ''}`}
                value={form.horaInicio}
                onChange={e => set('horaInicio', e.target.value)}
              />
              {errors.horaInicio && <p className="text-xs text-red-500 mt-1">{errors.horaInicio}</p>}
            </div>
            <div>
              <label className="label">Hora fin *</label>
              <input
                type="time"
                className={`input-field ${errors.horaFin ? 'border-red-400' : ''}`}
                value={form.horaFin}
                onChange={e => set('horaFin', e.target.value)}
                min={form.horaInicio || undefined}
              />
              {errors.horaFin && <p className="text-xs text-red-500 mt-1">{errors.horaFin}</p>}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="label">Tipo de horario *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIPOS.map(t => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => set('tipo', t.value)}
                  className={`p-2.5 rounded-lg border-2 text-xs font-semibold transition-all
                    ${form.tipo === t.value
                      ? `${t.color} border-current ring-2 ring-offset-1 ring-blue-200`
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="label">Observaciones</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <textarea
                rows={2}
                className="input-field pl-9 resize-none"
                placeholder="Notas adicionales (opcional)"
                value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="border-t border-slate-100 px-5 sm:px-6 py-3 flex items-center justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            <Save size={14} /> {saving ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Registrar horario'}
          </button>
        </div>
      </div>
    </div>
  );
}
