'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useData } from '@/components/AppProvider';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NuevoCasoPage() {
  const router = useRouter();
  const { pacientes, especialistas, procedimientos, diagnosticos, crearCaso } = useData();
  const [form, setForm] = useState({
    tipo: 'electivo',
    paciente: '',
    especialistaPrincipal: '',
    equipoQuirurgico: [],
    diagnostico: '',
    procedimiento: '',
    duracionEstimadaMin: '',
    prioridad: 'media',
    observaciones: '',
    fechaIngresoEmergencia: '',
    motivoEmergencia: '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleEquipo = id => {
    setForm(f => ({
      ...f,
      equipoQuirurgico: f.equipoQuirurgico.includes(id)
        ? f.equipoQuirurgico.filter(x => x !== id)
        : [...f.equipoQuirurgico, id],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.paciente) e.paciente = 'Requerido';
    if (!form.especialistaPrincipal) e.especialistaPrincipal = 'Requerido';
    if (!form.procedimiento) e.procedimiento = 'Requerido';
    if (!form.diagnostico) e.diagnostico = 'Requerido';
    if (form.tipo === 'emergencia' && !form.motivoEmergencia) e.motivoEmergencia = 'Requerido para emergencias';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await crearCaso(form);
    setSaved(true);
    setTimeout(() => router.push('/casos'), 1200);
  };

  return (
    <div className="page-enter">
      <Header
        title="Nuevo Caso Quirúrgico"
        subtitle="Complete los datos del caso"
        actions={
          <Link href="/casos" className="btn-secondary">
            <ArrowLeft size={15} /> Volver
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {saved && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
            ✓ Caso creado exitosamente. Redirigiendo…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo y prioridad */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de Caso *</label>
                <div className="flex gap-3">
                  {['electivo', 'emergencia'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('tipo', t)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                        ${form.tipo === t
                          ? t === 'emergencia' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      {t === 'emergencia' ? '⚡ Emergencia' : '📋 Electivo'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Prioridad *</label>
                <div className="flex gap-3">
                  {[['alta', 'bg-red-50 border-red-400 text-red-700'], ['media', 'bg-yellow-50 border-yellow-400 text-yellow-700'], ['baja', 'bg-green-50 border-green-400 text-green-700']].map(([p, cls]) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set('prioridad', p)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                        ${form.prioridad === p ? cls : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {form.tipo === 'emergencia' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold text-red-700">Datos de Emergencia</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label text-red-600">Motivo de Emergencia *</label>
                      <input
                        className={`input-field ${errors.motivoEmergencia ? 'border-red-400' : ''}`}
                        value={form.motivoEmergencia}
                        onChange={e => set('motivoEmergencia', e.target.value)}
                        placeholder="Ej. Apendicitis perforada"
                      />
                      {errors.motivoEmergencia && <p className="text-xs text-red-500 mt-1">{errors.motivoEmergencia}</p>}
                    </div>
                    <div>
                      <label className="label text-red-600">Fecha/Hora de Ingreso</label>
                      <input
                        type="datetime-local"
                        className="input-field"
                        value={form.fechaIngresoEmergencia}
                        onChange={e => set('fechaIngresoEmergencia', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Paciente y Especialista */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Paciente y Equipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Paciente *</label>
                <select
                  className={`select-field ${errors.paciente ? 'border-red-400' : ''}`}
                  value={form.paciente}
                  onChange={e => set('paciente', e.target.value)}
                >
                  <option value="">Seleccione un paciente</option>
                  {pacientes.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre} — {p.identificacion}</option>
                  ))}
                </select>
                {errors.paciente && <p className="text-xs text-red-500 mt-1">{errors.paciente}</p>}
              </div>

              <div>
                <label className="label">Especialista Principal *</label>
                <select
                  className={`select-field ${errors.especialistaPrincipal ? 'border-red-400' : ''}`}
                  value={form.especialistaPrincipal}
                  onChange={e => set('especialistaPrincipal', e.target.value)}
                >
                  <option value="">Seleccione un especialista</option>
                  {especialistas.map(e => (
                    <option key={e._id} value={e._id}>{e.nombre} – {e.especialidad}</option>
                  ))}
                </select>
                {errors.especialistaPrincipal && <p className="text-xs text-red-500 mt-1">{errors.especialistaPrincipal}</p>}
              </div>
            </div>

            <div>
              <label className="label">Equipo Quirúrgico (Asistentes)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {especialistas
                  .filter(e => e._id !== form.especialistaPrincipal)
                  .map(e => (
                    <label key={e._id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.equipoQuirurgico.includes(e._id)}
                        onChange={() => toggleEquipo(e._id)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{e.nombre}</p>
                        <p className="text-xs text-slate-400 truncate">{e.especialidad}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          </div>

          {/* Procedimiento y Diagnóstico */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Procedimiento Clínico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Diagnóstico *</label>
                <select
                  className={`select-field ${errors.diagnostico ? 'border-red-400' : ''}`}
                  value={form.diagnostico}
                  onChange={e => set('diagnostico', e.target.value)}
                >
                  <option value="">Seleccione un diagnóstico</option>
                  {diagnosticos.map(d => (
                    <option key={d._id} value={d._id}>{d.codigo} — {d.nombre}</option>
                  ))}
                </select>
                {errors.diagnostico && <p className="text-xs text-red-500 mt-1">{errors.diagnostico}</p>}
              </div>

              <div>
                <label className="label">Procedimiento *</label>
                <select
                  className={`select-field ${errors.procedimiento ? 'border-red-400' : ''}`}
                  value={form.procedimiento}
                  onChange={e => { set('procedimiento', e.target.value); const p = procedimientos.find(x => x._id === e.target.value); if (p) set('duracionEstimadaMin', p.duracionPromedioMin); }}
                >
                  <option value="">Seleccione un procedimiento</option>
                  {procedimientos.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre} ({p.duracionPromedioMin} min)</option>
                  ))}
                </select>
                {errors.procedimiento && <p className="text-xs text-red-500 mt-1">{errors.procedimiento}</p>}
              </div>

              <div>
                <label className="label">Duración Estimada (minutos)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.duracionEstimadaMin}
                  onChange={e => set('duracionEstimadaMin', e.target.value)}
                  placeholder="Ej. 90"
                  min={10}
                  max={600}
                />
              </div>
            </div>

            <div>
              <label className="label">Observaciones</label>
              <textarea
                className="input-field"
                rows={3}
                value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
                placeholder="Notas relevantes, alergias, condiciones especiales…"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <Link href="/casos" className="btn-secondary">Cancelar</Link>
            <button type="submit" className="btn-primary" disabled={saved}>
              <Save size={15} /> Crear Caso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
