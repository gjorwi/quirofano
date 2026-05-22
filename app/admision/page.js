'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { EstadoBadge, TipoBadge } from '@/components/StatusBadge';
import { useData } from '@/components/AppProvider';
import { CheckCircle, XCircle, Plus, Eye, Search, ClipboardList, Activity } from 'lucide-react';

function AdmisionForm({ caso, onClose }) {
  const { crearAdmision, insumos, resolveCaso, actualizarPaciente } = useData();
  const r = resolveCaso(caso);
  const [form, setForm] = useState({
    responsable: '',
    fechaHoraIngreso: new Date().toISOString().slice(0, 16),
    presionArterial: '',
    frecuenciaCardiaca: '',
    temperatura: '',
    saturacionOxigeno: '',
    identificacion: false,
    consentimientoFirmado: false,
    ordenMedica: false,
    checklist: [
      { item: 'Ayuno de 8 horas', cumplido: false },
      { item: 'Área quirúrgica preparada', cumplido: false },
      { item: 'Medicación preoperatoria administrada', cumplido: false },
      { item: 'Vía periférica colocada', cumplido: false },
      { item: 'Exámenes de laboratorio', cumplido: false },
    ],
    insumosUsados: [{ insumo: '', cantidad: 1 }],
    observaciones: '',
    alergias: r.pacienteObj?.alergias || '',
  });
  const [saved, setSaved] = useState(false);

  const setChecklist = (i, val) => setForm(f => ({
    ...f,
    checklist: f.checklist.map((c, idx) => idx === i ? { ...c, cumplido: val } : c),
  }));

  const setInsumo = (i, key, val) => setForm(f => ({
    ...f,
    insumosUsados: f.insumosUsados.map((ins, idx) => idx === i ? { ...ins, [key]: val } : ins),
  }));

  const addInsumo = () => setForm(f => ({ ...f, insumosUsados: [...f.insumosUsados, { insumo: '', cantidad: 1 }] }));
  const removeInsumo = i => setForm(f => ({ ...f, insumosUsados: f.insumosUsados.filter((_, idx) => idx !== i) }));

  const handleSubmit = async e => {
    e.preventDefault();
    await crearAdmision({
      caso: caso._id,
      responsable: form.responsable,
      fechaHoraIngreso: form.fechaHoraIngreso,
      signosVitales: {
        presionArterial: form.presionArterial,
        frecuenciaCardiaca: form.frecuenciaCardiaca,
        temperatura: form.temperatura,
        saturacionOxigeno: form.saturacionOxigeno,
      },
      verificacionDocumentos: {
        identificacion: form.identificacion,
        consentimientoFirmado: form.consentimientoFirmado,
        ordenMedica: form.ordenMedica,
      },
      checklist: form.checklist,
      insumosUtilizados: form.insumosUsados.filter(i => i.insumo),
      observaciones: form.observaciones,
    });
    if (caso.paciente && form.alergias !== (r.pacienteObj?.alergias || '')) {
      await actualizarPaciente(caso.paciente, { alergias: form.alergias });
    }
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registrar Admisión</h2>
            <p className="text-sm text-slate-500">{r.pacienteObj?.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
        </div>

        {saved && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Admisión registrada. El caso pasó a estado "En Admisión".
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info paciente */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Datos del Paciente</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div><span className="text-slate-500 text-xs">Identificación:</span> <span className="font-medium text-slate-800">{r.pacienteObj?.identificacion || '—'}</span></div>
              <div><span className="text-slate-500 text-xs">Sexo:</span> <span className="font-medium text-slate-800 capitalize">{r.pacienteObj?.sexo || '—'}</span></div>
              <div><span className="text-slate-500 text-xs">F. Nacimiento:</span> <span className="font-medium text-slate-800">{r.pacienteObj?.fechaNacimiento ? new Date(r.pacienteObj.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-HN') : '—'}</span></div>
              <div><span className="text-slate-500 text-xs">Contacto:</span> <span className="font-medium text-slate-800">{r.pacienteObj?.contacto || '—'}</span></div>
            </div>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Responsable *</label>
              <input className="input-field" value={form.responsable} onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))} placeholder="Ej. Enf. Rosa Jiménez" required />
            </div>
            <div>
              <label className="label">Fecha/Hora Ingreso</label>
              <input type="datetime-local" className="input-field" value={form.fechaHoraIngreso} onChange={e => setForm(f => ({ ...f, fechaHoraIngreso: e.target.value }))} />
            </div>
          </div>

          {/* Signos vitales */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Signos Vitales</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['presionArterial', 'P.A. (mmHg)', '120/80'], ['frecuenciaCardiaca', 'F.C. (bpm)', '72'], ['temperatura', 'Temp. (°C)', '36.5'], ['saturacionOxigeno', 'SpO2 (%)', '98']].map(([key, lbl, ph]) => (
                <div key={key}>
                  <label className="label">{lbl}</label>
                  <input className="input-field" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} />
                </div>
              ))}
            </div>
          </div>

          {/* Verificación documentos */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Verificación de Documentos</p>
            <div className="flex flex-wrap gap-3">
              {[['identificacion', 'Identificación'], ['consentimientoFirmado', 'Consentimiento Firmado'], ['ordenMedica', 'Orden Médica']].map(([key, lbl]) => (
                <label key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                  ${form[key] ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="hidden" />
                  {form[key] ? <CheckCircle size={14} /> : <XCircle size={14} className="text-slate-400" />}
                  <span className="text-sm font-medium">{lbl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Checklist Preoperatorio</p>
            <div className="space-y-2">
              {form.checklist.map((item, i) => (
                <label key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors
                  ${item.cumplido ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={item.cumplido} onChange={e => setChecklist(i, e.target.checked)} className="rounded border-slate-300 text-green-600" />
                  <span className="text-sm text-slate-700">{item.item}</span>
                  {item.cumplido && <CheckCircle size={14} className="text-green-500 ml-auto" />}
                </label>
              ))}
            </div>
          </div>

          {/* Insumos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Insumos Utilizados</p>
              <button type="button" onClick={addInsumo} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {form.insumosUsados.map((ins, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select className="select-field flex-1" value={ins.insumo} onChange={e => setInsumo(i, 'insumo', e.target.value)}>
                    <option value="">Seleccione insumo</option>
                    {insumos.map(ins => <option key={ins._id} value={ins._id}>{ins.nombre}</option>)}
                  </select>
                  <input type="number" min={1} className="input-field w-20" value={ins.cantidad} onChange={e => setInsumo(i, 'cantidad', e.target.value)} />
                  <button type="button" onClick={() => removeInsumo(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alergias */}
          <div>
            <label className="label">Alergias del Paciente</label>
            <textarea className="input-field" rows={2} value={form.alergias}
              onChange={e => setForm(f => ({ ...f, alergias: e.target.value }))}
              placeholder="Ej. Penicilina, latex, AINES… (dejar en blanco si ninguna)" />
          </div>

          <div>
            <label className="label">Observaciones</label>
            <textarea className="input-field" rows={2} value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} placeholder="Notas adicionales…" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saved}>
              <ClipboardList size={15} /> Registrar Admisión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TIPO_TAGS  = ['todos', 'electiva', 'urgencia', 'emergencia'];
const ESTADO_TAGS = ['todos', 'programada', 'en_admision'];
const ESTADO_LABELS = { programada: 'Pendiente de admisión', en_admision: 'En admisión' };
const TIPO_LABELS   = { electiva: 'Electiva', urgencia: 'Urgencia', emergencia: 'Emergencia' };

export default function AdmisionPage() {
  const { casos, admisiones, insumos, resolveCaso } = useData();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo]   = useState('todos');
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);
  const [viendoAdmision, setViendoAdmision]     = useState(null);

  const casosAdmisibles = casos
    .filter(c => ['programada', 'en_admision'].includes(c.estado))
    .sort((a, b) => {
      const aAdmitido = admisiones.some(adm => adm.caso === a._id);
      const bAdmitido = admisiones.some(adm => adm.caso === b._id);
      if (aAdmitido !== bAdmitido) return aAdmitido ? 1 : -1;
      return 0;
    });

  const casosFiltrados = casosAdmisibles.filter(c => {
    const r = resolveCaso(c);
    const txt = busqueda.toLowerCase();
    const matchTxt   = !txt || r.pacienteObj?.nombre.toLowerCase().includes(txt) || r.procedimientoObj?.nombre.toLowerCase().includes(txt);
    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
    const matchTipo   = filtroTipo   === 'todos' || c.tipo   === filtroTipo;
    return matchTxt && matchEstado && matchTipo;
  });

  return (
    <div className="page-enter">
      <Header title="Admisión Quirúrgica" subtitle="Registro de ingreso y checklist preoperatorio" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ClipboardList size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{casos.filter(c => c.estado === 'en_admision').length}</p>
              <p className="text-xs text-slate-500">En Admisión</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{casos.filter(c => c.estado === 'programada').length}</p>
              <p className="text-xs text-slate-500">Pendientes de Admisión</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{admisiones.length}</p>
              <p className="text-xs text-slate-500">Admisiones Registradas</p>
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="card p-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Buscar por paciente o procedimiento…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          {/* Tags de estado */}
          <div className="flex flex-wrap gap-2">
            {ESTADO_TAGS.map(tag => (
              <button key={tag} onClick={() => setFiltroEstado(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${filtroEstado === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                {tag === 'todos' ? 'Todos los estados' : ESTADO_LABELS[tag]}
              </button>
            ))}
            <span className="w-px bg-slate-200 mx-1" />
            {TIPO_TAGS.map(tag => (
              <button key={tag} onClick={() => setFiltroTipo(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${filtroTipo === tag ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                {tag === 'todos' ? 'Todos los tipos' : TIPO_LABELS[tag]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista casos programados */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="section-title">Casos para Admisión</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Paciente</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Procedimiento</th>
                  <th className="table-header">Especialista</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {casosFiltrados.length === 0 && (
                  <tr><td colSpan={6} className="table-cell text-center text-slate-400 py-10">Sin casos para admisión.</td></tr>
                )}
                {casosFiltrados.map(c => {
                  const r = resolveCaso(c);
                  const admisionExistente = admisiones.find(a => a.caso === c._id);
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-cell">
                        <p className="font-semibold text-slate-800">{r.pacienteObj?.nombre}</p>
                        <p className="text-xs text-slate-400">{r.pacienteObj?.identificacion}</p>
                      </td>
                      <td className="table-cell"><TipoBadge tipo={c.tipo} /></td>
                      <td className="table-cell text-slate-600">{r.procedimientoObj?.nombre}</td>
                      <td className="table-cell text-slate-600">{r.especialistaObj?.nombre}</td>
                      <td className="table-cell"><EstadoBadge estado={c.estado} /></td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          {admisionExistente ? (
                            <button
                              onClick={() => setViendoAdmision(admisionExistente)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Eye size={13} /> Ver Admisión
                            </button>
                          ) : (
                            <button
                              onClick={() => setCasoSeleccionado(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus size={13} /> Registrar Admisión
                            </button>
                          )}
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

      {casoSeleccionado && (
        <AdmisionForm caso={casoSeleccionado} onClose={() => setCasoSeleccionado(null)} />
      )}

      {viendoAdmision && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          {(() => {
            const casoAdm  = casos.find(c => c._id === viendoAdmision.caso);
            const rAdm     = casoAdm ? resolveCaso(casoAdm) : null;
            return (
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Detalle de Admisión</h2>
              <button onClick={() => setViendoAdmision(null)} className="p-2 rounded-lg hover:bg-slate-100">✕</button>
            </div>

            {/* Datos del paciente */}
            {rAdm?.pacienteObj && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Paciente</p>
                <p className="font-semibold text-slate-800 text-sm">{rAdm.pacienteObj.nombre}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5 text-xs text-slate-600">
                  <span>ID: <strong>{rAdm.pacienteObj.identificacion}</strong></span>
                  <span>Sexo: <strong className="capitalize">{rAdm.pacienteObj.sexo || '—'}</strong></span>
                  <span>Especialista: <strong>{rAdm.especialistaObj?.nombre || '—'}</strong></span>
                  <span>Procedimiento: <strong>{rAdm.procedimientoObj?.nombre || '—'}</strong></span>
                  {rAdm.pacienteObj.alergias && (
                    <span className="col-span-2 text-red-600">Alergias: <strong>{rAdm.pacienteObj.alergias}</strong></span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[['Responsable', viendoAdmision.responsable], ['Fecha Ingreso', viendoAdmision.fechaHoraIngreso ? new Date(viendoAdmision.fechaHoraIngreso).toLocaleString('es-HN') : '—']].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k}</p>
                  <p className="text-sm text-slate-800 mt-0.5">{v}</p>
                </div>
              ))}
              {viendoAdmision.ingresadoPor && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ingresado por</p>
                  <p className="text-sm text-slate-800 mt-0.5">{viendoAdmision.ingresadoPor}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Signos Vitales</p>
              <div className="grid grid-cols-2 gap-2">
                {[['P.A.', viendoAdmision.signosVitales?.presionArterial], ['F.C.', `${viendoAdmision.signosVitales?.frecuenciaCardiaca} bpm`], ['Temp.', `${viendoAdmision.signosVitales?.temperatura} °C`], ['SpO2', `${viendoAdmision.signosVitales?.saturacionOxigeno}%`]].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">{k}</p>
                    <p className="text-sm font-bold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Checklist</p>
              {viendoAdmision.checklist?.map((item, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg mb-1 text-sm
                  ${item.cumplido ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {item.cumplido ? <CheckCircle size={13} /> : <XCircle size={13} />}
                  {item.item}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Insumos</p>
              {viendoAdmision.insumosUtilizados?.map((ins, i) => {
                const insumo = insumos.find(i => i._id === ins.insumo);
                return (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700">{insumo?.nombre}</span>
                    <span className="font-semibold text-slate-900">×{ins.cantidad}</span>
                  </div>
                );
              })}
            </div>
            {viendoAdmision.observaciones && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Observaciones</p>
                <p className="text-sm text-slate-700 mt-1">{viendoAdmision.observaciones}</p>
              </div>
            )}
          </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
