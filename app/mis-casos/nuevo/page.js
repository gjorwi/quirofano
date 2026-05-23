'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/components/AppProvider';
import { useData } from '@/components/AppProvider';
import PatientSelectorModal from '@/components/PatientSelectorModal';
import DiagnosticoSelectorModal from '@/components/DiagnosticoSelectorModal';
import ProcedimientoSelectorModal from '@/components/ProcedimientoSelectorModal';
import { ArrowLeft, Send, User, FileSearch, FlaskConical, Plus, X, ChevronDown, Save } from 'lucide-react';

export default function NuevoCasoEspecialistaPage() {
  const { user } = useAuth();
  const { crearCaso, especialistas, crearEspecialista } = useData();
  const router = useRouter();

  const [form, setForm] = useState({
    tipo: 'electivo',
    paciente: '',
    equipoQuirurgico: [],
    asistentesExternos: [],
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
  const [formAsistente, setFormAsistente] = useState({ nombre: '', especialidad: '', codigoColegiado: '' });
  const [mostrarFormAsistente, setMostrarFormAsistente] = useState(false);
  const [errsAsistente, setErrsAsistente] = useState({});
  const [guardandoAsistente, setGuardandoAsistente] = useState(false);
  const [mostrarModalPaciente, setMostrarModalPaciente] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mostrarModalDiagnostico, setMostrarModalDiagnostico] = useState(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState(null);
  const [mostrarModalProcedimiento, setMostrarModalProcedimiento] = useState(false);
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState(null);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

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

  const handleSelectPaciente = (p) => {
    setPacienteSeleccionado(p);
    set('paciente', p._id);
  };

  const handleSelectDiagnostico = (d) => {
    setDiagnosticoSeleccionado(d);
    set('diagnostico', d._id);
  };

  const handleSelectProcedimiento = (p) => {
    setProcedimientoSeleccionado(p);
    set('procedimiento', p._id);
    if (p.duracionEstimadaMin) {
      set('duracionEstimadaMin', p.duracionEstimadaMin);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.paciente) e.paciente = 'Requerido';
    if (!form.procedimiento) e.procedimiento = 'Requerido';
    if (!form.diagnostico) e.diagnostico = 'Requerido';
    if (form.tipo === 'emergencia' && !form.motivoEmergencia) e.motivoEmergencia = 'Requerido';
    if (form.equipoQuirurgico.length === 0) e.equipo = 'Debe agregar al menos un asistente';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    crearCaso({
      ...form,
      especialistaPrincipal: user.especialistaId,
      duracionEstimadaMin: Number(form.duracionEstimadaMin) || null,
    });
    setSaved(true);
    setTimeout(() => router.push('/mis-casos'), 1200);
  };

  const otrosEspecialistas = especialistas.filter(e => e._id !== user?.especialistaId);

  return (
    <div className="page-enter">
      <Header
        title="Proponer Caso Quirúrgico"
        subtitle="El caso quedará pendiente de aprobación por el administrador"
        actions={
          <Link href="/mis-casos" className="btn-secondary">
            <ArrowLeft size={15} /> Volver
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {saved && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            ✓ Caso enviado para aprobación. Redirigiendo…
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
          <Send size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700">Propuesta quirúrgica</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Este caso será enviado al administrador para su revisión y aprobación.
              Una vez aprobado, será programado en el plan quirúrgico.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo y prioridad */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de Caso *</label>
                <div className="flex gap-3">
                  {['electivo', 'emergencia'].map(t => (
                    <button key={t} type="button" onClick={() => set('tipo', t)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                        ${form.tipo === t
                          ? t === 'emergencia' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {t === 'emergencia' ? '⚡ Emergencia' : '📋 Electivo'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Prioridad *</label>
                <div className="flex gap-3">
                  {[['alta','border-red-400 bg-red-50 text-red-700'],['media','border-yellow-400 bg-yellow-50 text-yellow-700'],['baja','border-green-400 bg-green-50 text-green-700']].map(([p,cls]) => (
                    <button key={p} type="button" onClick={() => set('prioridad', p)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                        ${form.prioridad === p ? cls : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {form.tipo === 'emergencia' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label text-red-600">Motivo de Emergencia *</label>
                  <input className={`input-field ${errors.motivoEmergencia ? 'border-red-400' : ''}`}
                    value={form.motivoEmergencia} onChange={e => set('motivoEmergencia', e.target.value)} />
                  {errors.motivoEmergencia && <p className="text-xs text-red-500 mt-1">{errors.motivoEmergencia}</p>}
                </div>
                <div>
                  <label className="label text-red-600">Fecha/Hora de Ingreso</label>
                  <input type="datetime-local" className="input-field" value={form.fechaIngresoEmergencia}
                    onChange={e => set('fechaIngresoEmergencia', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Paciente */}
          <div className="card p-4 sm:p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Paciente</h2>
            <div>
              <label className="label">Paciente *</label>
              {pacienteSeleccionado ? (
                <div className="p-3 sm:p-4 rounded-lg border-2 border-blue-200 bg-blue-50 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-900 text-sm sm:text-base">{pacienteSeleccionado.nombre}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-blue-700">
                      <span>ID: {pacienteSeleccionado.identificacion}</span>
                      {pacienteSeleccionado.historiaClinica && <span>HC: {pacienteSeleccionado.historiaClinica}</span>}
                      <span>{pacienteSeleccionado.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPacienteSeleccionado(null); set('paciente', ''); }}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarModalPaciente(true)}
                  className={`w-full p-3 sm:p-4 rounded-lg border-2 border-dashed transition-all text-left
                    ${errors.paciente ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className={errors.paciente ? 'text-red-500' : 'text-slate-400'} />
                    <div>
                      <p className={`font-medium text-sm sm:text-base ${errors.paciente ? 'text-red-700' : 'text-slate-600'}`}>
                        Seleccionar Paciente
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Click para buscar o registrar</p>
                    </div>
                  </div>
                </button>
              )}
              {errors.paciente && <p className="text-xs text-red-500 mt-1">{errors.paciente}</p>}
            </div>

            <div>
                <label className="label">Asistentes / Equipo *</label>
                {errors.equipo && <p className="text-xs text-red-500 mb-1">{errors.equipo}</p>}

                {/* Especialistas registrados */}
                {otrosEspecialistas.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                    {otrosEspecialistas.map(e => (
                      <label key={e._id} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors
                        ${form.equipoQuirurgico.includes(e._id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={form.equipoQuirurgico.includes(e._id)}
                          onChange={() => toggleEquipo(e._id)} className="rounded border-slate-300 text-blue-600" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{e.nombre}</p>
                          <p className="text-xs text-slate-400 truncate">{e.especialidad}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

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

          {/* Procedimiento */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-slate-100 pb-3">Procedimiento Clínico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Diagnóstico *</label>
                {diagnosticoSeleccionado ? (
                  <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-200 text-blue-800">
                          {diagnosticoSeleccionado.codigo}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-blue-900 line-clamp-1">{diagnosticoSeleccionado.nombre}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDiagnosticoSeleccionado(null); set('diagnostico', ''); }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMostrarModalDiagnostico(true)}
                    className={`w-full p-3 rounded-lg border-2 border-dashed transition-all text-left
                      ${errors.diagnostico ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileSearch size={18} className={errors.diagnostico ? 'text-red-500' : 'text-slate-400'} />
                      <div>
                        <p className={`font-medium text-sm ${errors.diagnostico ? 'text-red-700' : 'text-slate-600'}`}>
                          Seleccionar Diagnóstico
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Click para buscar CIE-10</p>
                      </div>
                    </div>
                  </button>
                )}
                {errors.diagnostico && <p className="text-xs text-red-500 mt-1">{errors.diagnostico}</p>}
              </div>
              <div>
                <label className="label">Procedimiento *</label>
                {procedimientoSeleccionado ? (
                  <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900">{procedimientoSeleccionado.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-200 text-blue-800">
                          {procedimientoSeleccionado.tipo}
                        </span>
                        {procedimientoSeleccionado.duracionEstimadaMin && (
                          <span className="text-xs text-blue-700">
                            {procedimientoSeleccionado.duracionEstimadaMin} min
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setProcedimientoSeleccionado(null); set('procedimiento', ''); }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMostrarModalProcedimiento(true)}
                    className={`w-full p-3 rounded-lg border-2 border-dashed transition-all text-left
                      ${errors.procedimiento ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <FlaskConical size={18} className={errors.procedimiento ? 'text-red-500' : 'text-slate-400'} />
                      <div>
                        <p className={`font-medium text-sm ${errors.procedimiento ? 'text-red-700' : 'text-slate-600'}`}>
                          Seleccionar Procedimiento
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Click para buscar</p>
                      </div>
                    </div>
                  </button>
                )}
                {errors.procedimiento && <p className="text-xs text-red-500 mt-1">{errors.procedimiento}</p>}
              </div>
              <div>
                <label className="label">Duración Estimada (min)</label>
                <input type="number" className="input-field" value={form.duracionEstimadaMin}
                  onChange={e => set('duracionEstimadaMin', e.target.value)} min={10} max={600} />
              </div>
            </div>
            <div>
              <label className="label">Observaciones Clínicas</label>
              <textarea className="input-field" rows={3} value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
                placeholder="Condiciones especiales, alergias, indicaciones relevantes…" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pb-4">
            <Link href="/mis-casos" className="btn-secondary w-full sm:w-auto text-center">Cancelar</Link>
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saved}>
              <Send size={15} /> Enviar para Aprobación
            </button>
          </div>
        </form>
      </div>

      {mostrarModalPaciente && (
        <PatientSelectorModal
          onSelect={handleSelectPaciente}
          onClose={() => setMostrarModalPaciente(false)}
        />
      )}

      {mostrarModalDiagnostico && (
        <DiagnosticoSelectorModal
          onSelect={handleSelectDiagnostico}
          onClose={() => setMostrarModalDiagnostico(false)}
        />
      )}

      {mostrarModalProcedimiento && (
        <ProcedimientoSelectorModal
          onSelect={handleSelectProcedimiento}
          onClose={() => setMostrarModalProcedimiento(false)}
        />
      )}
    </div>
  );
}
