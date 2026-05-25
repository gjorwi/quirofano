'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useData } from '@/components/AppProvider';
import { ArrowLeft, Save, AlertTriangle, Plus, ChevronDown, User, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import PatientSelectorModal from '@/components/PatientSelectorModal';
import EspecialistaSelectorModal from '@/components/EspecialistaSelectorModal';

export default function NuevoCasoPage() {
  const router = useRouter();
  const { especialistas, crearCaso, crearEspecialista } = useData();
  const [form, setForm] = useState({
    tipo: 'electivo',
    paciente: '',
    especialistaPrincipal: '',
    equipoQuirurgico: [],
    asistentesExternos: [],
    diagnostico: '',
    procedimiento: '',
    diagnosticoNombre: '',
    procedimientoNombre: '',
    duracionEstimadaMin: '',
    prioridad: 'media',
    observaciones: '',
    fechaIngresoEmergencia: '',
    motivoEmergencia: '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const [pacienteSeleccionado, setPacienteSeleccionado]           = useState(null);
  const [especialistaSeleccionado, setEspecialistaSeleccionado]   = useState(null);
  const [mostrarModalPaciente, setMostrarModalPaciente]           = useState(false);
  const [mostrarModalEspecialista, setMostrarModalEspecialista]   = useState(false);

  const [formAsistente, setFormAsistente]     = useState({ nombre: '', especialidad: '', codigoColegiado: '' });
  const [mostrarFormAsistente, setMostrarFormAsistente] = useState(false);
  const [errsAsistente, setErrsAsistente]     = useState({});
  const [guardandoAsistente, setGuardandoAsistente] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleEquipo = id => {
    setForm(f => ({
      ...f,
      equipoQuirurgico: f.equipoQuirurgico.includes(id)
        ? f.equipoQuirurgico.filter(x => x !== id)
        : [...f.equipoQuirurgico, id],
    }));
    setErrors(e => ({ ...e, equipo: '' }));
  };

  const setA = (k, v) => { setFormAsistente(f => ({ ...f, [k]: v })); setErrsAsistente(e => ({ ...e, [k]: '' })); };
  const guardarAsistente = async () => {
    const e = {};
    if (!formAsistente.nombre.trim()) e.nombre = 'Requerido';
    if (!formAsistente.especialidad.trim()) e.especialidad = 'Requerida';
    if (Object.keys(e).length) { setErrsAsistente(e); return; }
    setGuardandoAsistente(true);
    try {
      const nuevo = await crearEspecialista({ nombre: formAsistente.nombre.trim(), especialidad: formAsistente.especialidad.trim(), codigoColegiado: formAsistente.codigoColegiado.trim() });
      toggleEquipo(nuevo._id);
      setFormAsistente({ nombre: '', especialidad: '', codigoColegiado: '' });
      setMostrarFormAsistente(false);
      setErrsAsistente({});
    } finally { setGuardandoAsistente(false); }
  };

  const handleSelectPaciente      = p  => { setPacienteSeleccionado(p);      set('paciente', p._id);             setErrors(e => ({ ...e, paciente: '' })); };
  const handleSelectEspecialista  = ep => { setEspecialistaSeleccionado(ep);  set('especialistaPrincipal', ep._id); setErrors(e => ({ ...e, especialistaPrincipal: '' })); };
  const validate = () => {
    const e = {};
    if (!form.paciente) e.paciente = 'Requerido';
    if (!form.especialistaPrincipal) e.especialistaPrincipal = 'Requerido';
    if (!form.procedimientoNombre.trim()) e.procedimientoNombre = 'Requerido';
    if (!form.diagnosticoNombre.trim()) e.diagnosticoNombre = 'Requerido';
    if (form.tipo === 'emergencia' && !form.motivoEmergencia) e.motivoEmergencia = 'Requerido para emergencias';
    if (form.equipoQuirurgico.length === 0) e.equipo = 'Debe agregar al menos un asistente';
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
                {pacienteSeleccionado ? (
                  <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-blue-900 text-sm">{pacienteSeleccionado.nombre}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-blue-700">
                        <span>ID: {pacienteSeleccionado.identificacion}</span>
                        {pacienteSeleccionado.historiaClinica && <span>HC: {pacienteSeleccionado.historiaClinica}</span>}
                        <span>{pacienteSeleccionado.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setPacienteSeleccionado(null); set('paciente', ''); }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex-shrink-0">Cambiar</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setMostrarModalPaciente(true)}
                    className={`w-full p-3 rounded-lg border-2 border-dashed transition-all text-left
                      ${errors.paciente ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                    <div className="flex items-center gap-3">
                      <User size={20} className={errors.paciente ? 'text-red-500' : 'text-slate-400'} />
                      <div>
                        <p className={`font-medium text-sm ${errors.paciente ? 'text-red-700' : 'text-slate-600'}`}>Seleccionar Paciente</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click para buscar o registrar</p>
                      </div>
                    </div>
                  </button>
                )}
                {errors.paciente && <p className="text-xs text-red-500 mt-1">{errors.paciente}</p>}
              </div>

              <div>
                <label className="label">Especialista Principal *</label>
                {especialistaSeleccionado ? (
                  <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-blue-900 text-sm">{especialistaSeleccionado.nombre}</p>
                      <p className="text-xs text-blue-700 mt-1">{especialistaSeleccionado.especialidad}</p>
                      {especialistaSeleccionado.codigoColegiado && <p className="text-xs text-blue-600 mt-0.5">Cód: {especialistaSeleccionado.codigoColegiado}</p>}
                    </div>
                    <button type="button" onClick={() => { setEspecialistaSeleccionado(null); set('especialistaPrincipal', ''); }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex-shrink-0">Cambiar</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setMostrarModalEspecialista(true)}
                    className={`w-full p-3 rounded-lg border-2 border-dashed transition-all text-left
                      ${errors.especialistaPrincipal ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                    <div className="flex items-center gap-3">
                      <Stethoscope size={20} className={errors.especialistaPrincipal ? 'text-red-500' : 'text-slate-400'} />
                      <div>
                        <p className={`font-medium text-sm ${errors.especialistaPrincipal ? 'text-red-700' : 'text-slate-600'}`}>Seleccionar Especialista</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click para buscar</p>
                      </div>
                    </div>
                  </button>
                )}
                {errors.especialistaPrincipal && <p className="text-xs text-red-500 mt-1">{errors.especialistaPrincipal}</p>}
              </div>
            </div>

            <div>
              <label className="label">Equipo Quirúrgico (Asistentes) *</label>
              {errors.equipo && <p className="text-xs text-red-500 mb-1">{errors.equipo}</p>}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {especialistas
                  .filter(e => e._id !== form.especialistaPrincipal)
                  .map(e => (
                    <label key={e._id} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors
                      ${form.equipoQuirurgico.includes(e._id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
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

              {/* Registrar nuevo asistente en catálogo */}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setMostrarFormAsistente(v => !v)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  <Plus size={15} />
                  {mostrarFormAsistente ? 'Cancelar registro' : '¿No está en la lista? Registrar nuevo asistente'}
                  <ChevronDown size={14} className={`transition-transform ${mostrarFormAsistente ? 'rotate-180' : ''}`} />
                </button>
                {mostrarFormAsistente && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Nuevo Asistente</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="label text-xs">Nombre *</label>
                        <input className={`input-field text-sm ${errsAsistente.nombre ? 'border-red-400' : ''}`}
                          value={formAsistente.nombre} onChange={e => setA('nombre', e.target.value)}
                          placeholder="Nombre completo" />
                        {errsAsistente.nombre && <p className="text-xs text-red-500 mt-0.5">{errsAsistente.nombre}</p>}
                      </div>
                      <div>
                        <label className="label text-xs">Especialidad *</label>
                        <input className={`input-field text-sm ${errsAsistente.especialidad ? 'border-red-400' : ''}`}
                          value={formAsistente.especialidad} onChange={e => setA('especialidad', e.target.value)}
                          placeholder="Ej. Anestesiología" />
                        {errsAsistente.especialidad && <p className="text-xs text-red-500 mt-0.5">{errsAsistente.especialidad}</p>}
                      </div>
                      <div>
                        <label className="label text-xs">Código Colegiado</label>
                        <input className="input-field text-sm" value={formAsistente.codigoColegiado}
                          onChange={e => setA('codigoColegiado', e.target.value)} placeholder="Opcional" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="button" onClick={guardarAsistente} disabled={guardandoAsistente}
                        className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        <Save size={14} /> {guardandoAsistente ? 'Registrando…' : 'Registrar y agregar al equipo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Procedimiento Clínico */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Procedimiento Clínico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Diagnóstico *</label>
                <input
                  className={`input-field ${errors.diagnosticoNombre ? 'border-red-400' : ''}`}
                  value={form.diagnosticoNombre}
                  onChange={e => { set('diagnosticoNombre', e.target.value); setErrors(er => ({ ...er, diagnosticoNombre: '' })); }}
                  placeholder="Ej. Apendicitis aguda"
                />
                {errors.diagnosticoNombre && <p className="text-xs text-red-500 mt-1">{errors.diagnosticoNombre}</p>}
              </div>

              <div>
                <label className="label">Procedimiento *</label>
                <input
                  className={`input-field ${errors.procedimientoNombre ? 'border-red-400' : ''}`}
                  value={form.procedimientoNombre}
                  onChange={e => { set('procedimientoNombre', e.target.value); setErrors(er => ({ ...er, procedimientoNombre: '' })); }}
                  placeholder="Ej. Apendicectomía laparoscópica"
                />
                {errors.procedimientoNombre && <p className="text-xs text-red-500 mt-1">{errors.procedimientoNombre}</p>}
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

      {mostrarModalPaciente && (
        <PatientSelectorModal onSelect={handleSelectPaciente} onClose={() => setMostrarModalPaciente(false)} />
      )}
      {mostrarModalEspecialista && (
        <EspecialistaSelectorModal onSelect={handleSelectEspecialista} onClose={() => setMostrarModalEspecialista(false)} />
      )}
    </div>
  );
}
