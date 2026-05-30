'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge, PrioridadBadge, TipoBadge } from '@/components/StatusBadge';
import { useData } from '@/components/AppProvider';
import { estadoConfig } from '@/lib/mockData';
import {
  ArrowLeft, User, Stethoscope, FileText, Calendar,
  CheckCircle, XCircle, Timer, ClipboardList, MapPin
} from 'lucide-react';

const FLUJO = ['pendiente', 'aprobada', 'programada', 'en_admision', 'en_curso', 'finalizado'];

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value || '—'}</span>
    </div>
  );
}

export default function PlanCasoDetallePage() {
  const { id } = useParams();
  const { casos, admisiones, resolveCaso, getQuirofanoById } = useData();

  const caso = casos.find(c => c._id === id);

  if (!caso) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">Caso no encontrado.</p>
        <Link href="/planes" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft size={14} /> Volver al Plan
        </Link>
      </div>
    );
  }

  const r = resolveCaso(caso);
  const admision = admisiones.find(a => String(a.caso) === id);
  const quirofano = r.planObj ? getQuirofanoById(r.planObj.quirofano) : null;

  return (
    <div className="page-enter">
      <Header
        title={caso.procedimientoNombre || r.procedimientoObj?.nombre || 'Detalle del Caso'}
        subtitle={r.pacienteObj?.nombre}
        actions={
          <Link href="/planes" className="btn-secondary text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2">
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Volver al Plan</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-5xl">
        {/* Estado y tipo */}
        <div className="flex flex-wrap items-center gap-3">
          <EstadoBadge estado={caso.estado} />
          <TipoBadge tipo={caso.tipo} />
          <PrioridadBadge prioridad={caso.prioridad} />
          {caso.tipo === 'emergencia' && caso.motivoEmergencia && (
            <span className="text-sm text-red-600 font-medium">⚡ {caso.motivoEmergencia}</span>
          )}
        </div>

        {/* Flujo de estados */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Progreso del Caso</h2>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {FLUJO.map((e, i) => {
              const completado = FLUJO.indexOf(caso.estado) > i;
              const activo = caso.estado === e;
              const terminado = caso.estado === 'rechazada' || caso.estado === 'cancelado';
              return (
                <div key={e} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${activo     ? 'border-blue-600 bg-blue-600 text-white'
                      : completado ? 'border-green-500 bg-green-500 text-white'
                      : terminado && i === 0 ? 'border-red-500 bg-red-100 text-red-600'
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
            {(caso.estado === 'cancelado' || caso.estado === 'rechazada') && (
              <div className="ml-4 flex items-center gap-2">
                <span className={`badge ${caso.estado === 'cancelado' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {estadoConfig[caso.estado]?.label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Paciente */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2">
              <User size={16} className="text-blue-500" /> Paciente
            </h2>
            <div className="space-y-2">
              <InfoRow label="Nombre"          value={r.pacienteObj?.nombre} />
              <InfoRow label="Identificación"  value={r.pacienteObj?.identificacion} />
              <InfoRow label="Fecha Nac."      value={r.pacienteObj?.fechaNacimiento
                ? new Date(r.pacienteObj.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-HN') : '—'} />
              <InfoRow label="Sexo"            value={r.pacienteObj?.sexo} />
              <InfoRow label="Historia Clín."  value={r.pacienteObj?.historiaClinica} />
              <InfoRow label="Email"           value={r.pacienteObj?.email} />
              {r.pacienteObj?.alergias && (
                <div className="flex gap-2">
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">⚠ Alergias</span>
                  <span className="text-sm text-red-700 font-medium">{r.pacienteObj.alergias}</span>
                </div>
              )}
            </div>
          </div>

          {/* Equipo quirúrgico */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-500" /> Equipo Quirúrgico
            </h2>
            <div className="space-y-2">
              <InfoRow label="Especialista"   value={r.especialistaObj?.nombre} />
              <InfoRow label="Especialidad"   value={r.especialistaObj?.especialidad} />
              <InfoRow label="Cód. Colegiado" value={r.especialistaObj?.codigoColegiado} />
              {(r.equipoObjs.length > 0 || caso.asistentesExternos?.length > 0) && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Asistentes</p>
                  <div className="flex flex-wrap gap-2">
                    {r.equipoObjs.map(e => (
                      <span key={e._id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{e.nombre}</span>
                    ))}
                    {(caso.asistentesExternos || []).map(n => (
                      <span key={n} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">{n}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Procedimiento */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> Procedimiento Clínico
            </h2>
            <div className="space-y-2">
              <InfoRow label="Diagnóstico"  value={caso.diagnosticoNombre || (r.diagnosticoObj
                ? `${r.diagnosticoObj.codigo ? r.diagnosticoObj.codigo + ' – ' : ''}${r.diagnosticoObj.nombre}` : '—')} />
              <InfoRow label="Procedimiento" value={caso.procedimientoNombre || r.procedimientoObj?.nombre || '—'} />
              <InfoRow label="Duración Est." value={caso.duracionEstimadaMin ? `${caso.duracionEstimadaMin} min` : '—'} />
              {caso.observaciones && <InfoRow label="Observaciones" value={caso.observaciones} />}
            </div>
          </div>

          {/* Plan quirúrgico */}
          {r.planObj && (
            <div className="card p-5 space-y-3">
              <h2 className="section-title flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" /> Plan Quirúrgico
              </h2>
              <div className="space-y-2">
                <InfoRow label="Fecha" value={new Date(r.planObj.fecha + 'T12:00:00').toLocaleDateString('es-HN',
                  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                <InfoRow label="Hora Inicio"       value={r.planObj.horaInicio} />
                <InfoRow label="Hora Fin Estimada" value={r.planObj.horaFinEstimada} />
                <div className="flex gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">Quirófano</span>
                  <span className="text-sm text-slate-700 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    {quirofano ? `${quirofano.numero} – ${quirofano.ubicacion}` : '—'}
                  </span>
                </div>
                <InfoRow label="Tipo Quirófano"  value={quirofano?.tipo} />
                {r.planObj?.programadoPor && <InfoRow label="Programado por" value={r.planObj.programadoPor} />}
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
                      <span className="font-semibold text-slate-800">
                        {fin ? fin.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }) : <span className="italic text-slate-400">En curso…</span>}
                      </span>
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

        {/* Admisión */}
        {admision && (
          <div className="card p-5 space-y-4">
            <h2 className="section-title flex items-center gap-2">
              <ClipboardList size={16} className="text-blue-500" /> Admisión
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <InfoRow label="Responsable"   value={admision.responsable} />
                <InfoRow label="Fecha Ingreso" value={admision.fechaHoraIngreso
                  ? new Date(admision.fechaHoraIngreso).toLocaleString('es-HN') : '—'} />
                <InfoRow label="Observaciones" value={admision.observaciones} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Signos Vitales</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['P.A.',  admision.signosVitales?.presionArterial],
                    ['F.C.',  admision.signosVitales?.frecuenciaCardiaca ? `${admision.signosVitales.frecuenciaCardiaca} bpm` : '—'],
                    ['Temp.', admision.signosVitales?.temperatura ? `${admision.signosVitales.temperatura} °C` : '—'],
                    ['SpO2',  admision.signosVitales?.saturacionOxigeno ? `${admision.signosVitales.saturacionOxigeno}%` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-slate-500">{k}</p>
                      <p className="text-sm font-bold text-slate-800">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {admision.checklist?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Checklist Preoperatorio</p>
                <div className="space-y-1.5">
                  {admision.checklist.map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                      ${item.cumplido ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {item.cumplido ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {item.item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Verificación de Documentos</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ['Identificación',        admision.verificacionDocumentos?.identificacion],
                  ['Consentimiento Firmado', admision.verificacionDocumentos?.consentimientoFirmado],
                  ['Orden Médica',           admision.verificacionDocumentos?.ordenMedica],
                ].map(([k, v]) => (
                  <span key={k} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                    ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {v ? <CheckCircle size={12} /> : <XCircle size={12} />} {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
