'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge, PrioridadBadge, TipoBadge } from '@/components/StatusBadge';
import { useAuth } from '@/components/AppProvider';
import { useData } from '@/components/AppProvider';
import { estadoConfig } from '@/lib/mockData';
import { ArrowLeft, User, FileText, Calendar, ClipboardList, CheckCircle, XCircle, MapPin, Clock, Stethoscope, Pencil, Plus, X, Save, Timer } from 'lucide-react';
import { useState } from 'react';

const FLUJO = ['pendiente','aprobada','programada','en_admision','en_curso','finalizado'];

export default function MiCasoDetallePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { casos, admisiones, especialistas, actualizarCaso, resolveCaso, getQuirofanoById } = useData();
  const [editandoEquipo, setEditandoEquipo] = useState(false);
  const [equipoEdit,    setEquipoEdit]    = useState([]);
  const [externosEdit,  setExternosEdit]  = useState([]);
  const [inputExterno,  setInputExterno]  = useState('');
  const [savingEquipo,  setSavingEquipo]  = useState(false);

  const caso = casos.find(c => c._id === id);

  if (!caso) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">Caso no encontrado.</p>
        <Link href="/mis-casos" className="btn-secondary mt-4 inline-flex"><ArrowLeft size={14} /> Volver</Link>
      </div>
    );
  }

  // Verificar que es un caso del especialista
  const esMio = caso.especialistaPrincipal === user?.especialistaId ||
    (caso.equipoQuirurgico || []).includes(user?.especialistaId);

  if (!esMio) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">No tienes acceso a este caso.</p>
        <Link href="/mis-casos" className="btn-secondary mt-4 inline-flex"><ArrowLeft size={14} /> Volver</Link>
      </div>
    );
  }

  const r = resolveCaso(caso);
  const admision = admisiones.find(a => String(a.caso) === id);
  const quirofano = r.planObj ? getQuirofanoById(r.planObj.quirofano) : null;

  return (
    <div className="page-enter">
      <Header
        title={r.procedimientoObj?.nombre || 'Detalle del Caso'}
        subtitle={r.pacienteObj?.nombre}
        actions={
          <Link href="/mis-casos" className="btn-secondary">
            <ArrowLeft size={15} /> Mis Casos
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-4xl">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <EstadoBadge estado={caso.estado} />
          <TipoBadge tipo={caso.tipo} />
          <PrioridadBadge prioridad={caso.prioridad} />
        </div>

        {/* Aviso de estado */}
        {caso.estado === 'pendiente' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
            <Clock size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">En espera de aprobación</p>
              <p className="text-xs text-yellow-700 mt-0.5">El administrador revisará este caso y lo aprobará o rechazará.</p>
            </div>
          </div>
        )}
        {caso.estado === 'rechazada' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
            <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Caso rechazado</p>
              <p className="text-xs text-red-700 mt-0.5">{caso.observaciones || 'Sin motivo especificado.'}</p>
            </div>
          </div>
        )}
        {caso.estado === 'aprobada' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Caso aprobado</p>
              <p className="text-xs text-blue-700 mt-0.5">El administrador aprobó el caso. Pendiente de asignación al plan quirúrgico.</p>
            </div>
          </div>
        )}

        {/* Progreso */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Progreso</h2>
          <div className="flex items-center overflow-x-auto pb-2">
            {FLUJO.map((e, i) => {
              const idx = FLUJO.indexOf(caso.estado);
              const completado = idx > i;
              const activo = caso.estado === e;
              return (
                <div key={e} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2
                      ${activo ? 'border-blue-600 bg-blue-600 text-white'
                        : completado ? 'border-green-500 bg-green-500 text-white'
                        : 'border-slate-200 bg-white text-slate-400'}`}>
                      {completado ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs whitespace-nowrap font-medium
                      ${activo ? 'text-blue-600' : completado ? 'text-green-600' : 'text-slate-400'}`}>
                      {estadoConfig[e]?.label}
                    </span>
                  </div>
                  {i < FLUJO.length - 1 && (
                    <div className={`h-0.5 w-8 flex-shrink-0 mb-5 ${completado ? 'bg-green-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Equipo Quirúrgico */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title flex items-center gap-2">
                <Stethoscope size={16} className="text-blue-500" /> Equipo Quirúrgico
              </h2>
              {!['finalizado','cancelado','rechazada'].includes(caso.estado) && (
                editandoEquipo ? (
                  <button onClick={() => setEditandoEquipo(false)} className="text-xs text-slate-500 hover:text-slate-700">
                    <X size={14} />
                  </button>
                ) : (
                  <button onClick={() => {
                    setEquipoEdit([...(caso.equipoQuirurgico || [])]);
                    setExternosEdit([...(caso.asistentesExternos || [])]);
                    setInputExterno('');
                    setEditandoEquipo(true);
                  }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Editar equipo">
                    <Pencil size={14} />
                  </button>
                )
              )}
            </div>

            {!editandoEquipo ? (
              <div className="space-y-2">
                <InfoRow label="Especialista Principal" value={r.especialistaObj?.nombre} />
                <InfoRow label="Especialidad" value={r.especialistaObj?.especialidad} />
                {(r.equipoObjs?.length > 0 || caso.asistentesExternos?.length > 0) && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Asistentes</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(r.equipoObjs || []).map(e => (
                        <span key={e._id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{e.nombre}</span>
                      ))}
                      {(caso.asistentesExternos || []).map(n => (
                        <span key={n} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Especialista principal: <strong>{r.especialistaObj?.nombre}</strong></p>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Asistentes registrados</p>
                  <div className="grid grid-cols-2 gap-2">
                    {especialistas.filter(e => e._id !== caso.especialistaPrincipal).map(e => (
                      <label key={e._id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors
                        ${equipoEdit.includes(e._id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600"
                          checked={equipoEdit.includes(e._id)}
                          onChange={() => setEquipoEdit(prev =>
                            prev.includes(e._id) ? prev.filter(x => x !== e._id) : [...prev, e._id]
                          )} />
                        <span className="truncate">{e.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Asistentes externos</p>
                  <div className="flex gap-2">
                    <input className="input-field flex-1 text-xs py-1.5" placeholder="Nombre del asistente…"
                      value={inputExterno} onChange={e => setInputExterno(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (inputExterno.trim()) { setExternosEdit(p => [...p, inputExterno.trim()]); setInputExterno(''); } } }} />
                    <button type="button" onClick={() => { if (inputExterno.trim()) { setExternosEdit(p => [...p, inputExterno.trim()]); setInputExterno(''); } }}
                      className="btn-secondary px-2.5"><Plus size={14} /></button>
                  </div>
                  {externosEdit.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {externosEdit.map(n => (
                        <span key={n} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                          {n}
                          <button onClick={() => setExternosEdit(p => p.filter(x => x !== n))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setEditandoEquipo(false)} className="btn-secondary text-xs py-1.5">Cancelar</button>
                  <button disabled={savingEquipo} onClick={async () => {
                    setSavingEquipo(true);
                    await actualizarCaso(id, { equipoQuirurgico: equipoEdit, asistentesExternos: externosEdit });
                    setSavingEquipo(false);
                    setEditandoEquipo(false);
                  }} className="btn-primary text-xs py-1.5">
                    <Save size={13} /> {savingEquipo ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paciente */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2"><User size={16} className="text-blue-500" /> Paciente</h2>
            <InfoRow label="Nombre" value={r.pacienteObj?.nombre} />
            <InfoRow label="Identificación" value={r.pacienteObj?.identificacion} />
            <InfoRow label="Sexo" value={r.pacienteObj?.sexo} />
            <InfoRow label="Contacto" value={r.pacienteObj?.contacto} />
            <InfoRow label="Historia Clínica" value={r.pacienteObj?.historiaClinica} />
          </div>

          {/* Procedimiento */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Procedimiento</h2>
            <InfoRow label="Diagnóstico" value={`${r.diagnosticoObj?.codigo} – ${r.diagnosticoObj?.nombre}`} />
            <InfoRow label="Procedimiento" value={r.procedimientoObj?.nombre} />
            <InfoRow label="Duración Estimada" value={caso.duracionEstimadaMin ? `${caso.duracionEstimadaMin} min` : '—'} />
            {caso.observaciones && <InfoRow label="Observaciones" value={caso.observaciones} />}
          </div>

          {/* Plan quirúrgico si está programado */}
          {r.planObj && (
            <div className="card p-5 space-y-3 border-2 border-purple-200 bg-purple-50/20">
              <h2 className="section-title flex items-center gap-2 text-purple-700">
                <Calendar size={16} className="text-purple-500" /> Programación Asignada
              </h2>
              <InfoRow label="Fecha"
                value={new Date(r.planObj.fecha + 'T12:00:00').toLocaleDateString('es-HN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} />
              <InfoRow label="Hora Inicio" value={r.planObj.horaInicio} />
              <InfoRow label="Hora Fin Estimada" value={r.planObj.horaFinEstimada} />
              {quirofano && (
                <>
                  <InfoRow label="Quirófano" value={`${quirofano.numero} – ${quirofano.tipo}`} />
                  <InfoRow label="Ubicación" value={quirofano.ubicacion} />
                </>
              )}
            </div>
          )}

          {/* Admisión */}
          {admision && (
            <div className="card p-5 space-y-3 border-2 border-orange-200 bg-orange-50/20">
              <h2 className="section-title flex items-center gap-2 text-orange-700">
                <ClipboardList size={16} className="text-orange-500" /> Admisión Registrada
              </h2>
              <InfoRow label="Responsable" value={admision.responsable} />
              <InfoRow label="Fecha/Hora Ingreso" value={admision.fechaHoraIngreso ? new Date(admision.fechaHoraIngreso).toLocaleString('es-HN') : '—'} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[['P.A.', admision.signosVitales?.presionArterial],
                  ['F.C.', `${admision.signosVitales?.frecuenciaCardiaca} bpm`],
                  ['Temp.', `${admision.signosVitales?.temperatura} °C`],
                  ['SpO2', `${admision.signosVitales?.saturacionOxigeno}%`]
                ].map(([k,v]) => (
                  <div key={k} className="bg-white rounded-lg p-2 text-center border border-orange-100">
                    <p className="text-xs text-slate-500">{k}</p>
                    <p className="text-sm font-bold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Checklist</p>
                {admision.checklist?.map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 p-1.5 rounded text-xs mb-1
                    ${item.cumplido ? 'text-green-700' : 'text-red-600'}`}>
                    {item.cumplido ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {item.item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tiempos quirúrgicos */}
        {(r.planObj || caso.horaRealInicio || caso.horaRealFin) && (
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <Timer size={16} className="text-blue-500" /> Tiempos Quirúrgicos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {r.planObj && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Estimado (programado)</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Inicio</span>
                    <span className="font-semibold text-slate-800">{r.planObj.horaInicio || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Fin</span>
                    <span className="font-semibold text-slate-800">{r.planObj.horaFinEstimada || '—'}</span>
                  </div>
                  {caso.duracionEstimadaMin && (
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-500">Duración</span>
                      <span className="font-bold text-slate-700">{caso.duracionEstimadaMin} min</span>
                    </div>
                  )}
                </div>
              )}
              {(caso.horaRealInicio || caso.horaRealFin) && (() => {
                const ini = caso.horaRealInicio ? new Date(caso.horaRealInicio) : null;
                const fin = caso.horaRealFin   ? new Date(caso.horaRealFin)   : null;
                const durMin = ini && fin ? Math.round((fin - ini) / 60000) : null;
                const diff = durMin && caso.duracionEstimadaMin ? durMin - caso.duracionEstimadaMin : null;
                return (
                  <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Real (ejecutado)</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Inicio</span>
                      <span className="font-semibold text-slate-800">{ini ? ini.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Fin</span>
                      <span className="font-semibold text-slate-800">{fin ? fin.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }) : <span className="italic text-slate-400">En curso…</span>}</span>
                    </div>
                    {durMin !== null && (
                      <div className="flex justify-between text-sm border-t border-blue-200 pt-2 mt-2">
                        <span className="text-slate-500">Duración</span>
                        <span className="font-bold text-slate-700">{durMin} min
                          {diff !== null && (
                            <span className={`ml-2 text-xs font-medium ${diff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                              ({diff > 0 ? `+${diff}` : diff} min)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value || '—'}</span>
    </div>
  );
}
