'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge, PrioridadBadge, TipoBadge } from '@/components/StatusBadge';
import { useData } from '@/components/AppProvider';
import { estadoConfig } from '@/lib/mockData';
import {
  ArrowLeft, User, Stethoscope, FileText, Calendar,
  CheckCircle, XCircle, PlayCircle, StopCircle, Ban, ClipboardList, ShieldCheck
} from 'lucide-react';

const FLUJO = ['pendiente', 'aprobada', 'programada', 'en_admision', 'en_curso', 'finalizado'];

export default function CasoDetallePage() {
  const { id } = useParams();
  const { casos, admisiones, insumos, aprobarCaso, rechazarCaso, actualizarEstadoCaso, cancelarCaso, resolveCaso, getQuirofanoById } = useData();

  const caso = casos.find(c => c._id === id);

  if (!caso) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">Caso no encontrado.</p>
        <Link href="/casos" className="btn-secondary mt-4 inline-flex">Volver</Link>
      </div>
    );
  }

  const r = resolveCaso(caso);
  const admision = admisiones.find(a => a.caso === id);
  const quirofano = r.planObj ? getQuirofanoById(r.planObj.quirofano) : null;

  const transicionesDisponibles = () => {
    const t = [];
    if (caso.estado === 'pendiente') {
      t.push({ accion: () => aprobarCaso(id),                        label: 'Aprobar',          icon: CheckCircle, cls: 'btn-success' });
      t.push({ accion: () => rechazarCaso(id),                       label: 'Rechazar',         icon: XCircle,     cls: 'btn-danger'  });
    }
    if (caso.estado === 'en_admision') {
      t.push({ accion: () => actualizarEstadoCaso(id, 'en_curso'),   label: 'Iniciar Cirugía',  icon: PlayCircle,  cls: 'btn-success' });
    }
    if (caso.estado === 'en_curso') {
      t.push({ accion: () => actualizarEstadoCaso(id, 'finalizado'), label: 'Finalizar',        icon: StopCircle,  cls: 'btn-primary' });
    }
    if (!['finalizado', 'cancelado', 'rechazada'].includes(caso.estado)) {
      t.push({ accion: () => cancelarCaso(id),                       label: 'Cancelar Caso',    icon: Ban,         cls: 'btn-danger'  });
    }
    return t;
  };

  return (
    <div className="page-enter">
      <Header
        title={`Caso #${id.toUpperCase()}`}
        subtitle={r.pacienteObj?.nombre}
        actions={
          <div className="flex items-center gap-2">
            {transicionesDisponibles().map(({ accion, label, icon: Icon, cls }) => (
              <button key={label} className={cls} onClick={accion}>
                <Icon size={15} /> {label}
              </button>
            ))}
            <Link href="/casos" className="btn-secondary">
              <ArrowLeft size={15} /> Volver
            </Link>
          </div>
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
              const rechazado = caso.estado === 'rechazada' || caso.estado === 'cancelado';
              return (
                <div key={e} className="flex items-center">
                  <div className={`flex flex-col items-center gap-1 px-2`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                      ${activo ? 'border-blue-600 bg-blue-600 text-white'
                        : completado ? 'border-green-500 bg-green-500 text-white'
                        : rechazado && i === 0 ? 'border-red-500 bg-red-100 text-red-600'
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
              <InfoRow label="Nombre" value={r.pacienteObj?.nombre} />
              <InfoRow label="Identificación" value={r.pacienteObj?.identificacion} />
              <InfoRow label="Fecha de Nacimiento" value={r.pacienteObj?.fechaNacimiento ? new Date(r.pacienteObj.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-HN') : '—'} />
              <InfoRow label="Sexo" value={r.pacienteObj?.sexo} />
              <InfoRow label="Contacto" value={r.pacienteObj?.contacto} />
              <InfoRow label="Historia Clínica" value={r.pacienteObj?.historiaClinica} />
            </div>
          </div>

          {/* Equipo */}
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-500" /> Equipo Quirúrgico
            </h2>
            <div className="space-y-2">
              <InfoRow label="Especialista Principal" value={r.especialistaObj?.nombre} />
              <InfoRow label="Especialidad" value={r.especialistaObj?.especialidad} />
              <InfoRow label="Código Colegiado" value={r.especialistaObj?.codigoColegiado} />
              {r.equipoObjs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Asistentes</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {r.equipoObjs.map(e => (
                      <span key={e._id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{e.nombre}</span>
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
              <InfoRow label="Diagnóstico" value={`${r.diagnosticoObj?.codigo} – ${r.diagnosticoObj?.nombre}`} />
              <InfoRow label="Procedimiento" value={r.procedimientoObj?.nombre} />
              <InfoRow label="Duración Estimada" value={caso.duracionEstimadaMin ? `${caso.duracionEstimadaMin} min` : '—'} />
              {caso.observaciones && <InfoRow label="Observaciones" value={caso.observaciones} />}
            </div>
          </div>

          {/* Plan */}
          {r.planObj && (
            <div className="card p-5 space-y-3">
              <h2 className="section-title flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" /> Plan Quirúrgico
              </h2>
              <div className="space-y-2">
                <InfoRow label="Fecha" value={new Date(r.planObj.fecha + 'T12:00:00').toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                <InfoRow label="Hora Inicio" value={r.planObj.horaInicio} />
                <InfoRow label="Hora Fin Estimada" value={r.planObj.horaFinEstimada} />
                <InfoRow label="Quirófano" value={`${quirofano?.numero} – ${quirofano?.ubicacion}`} />
                <InfoRow label="Tipo de Quirófano" value={quirofano?.tipo} />
                {r.planObj?.programadoPor && <InfoRow label="Programado por" value={r.planObj.programadoPor} />}
              </div>
            </div>
          )}
        </div>

        {/* Trazabilidad */}
        {(caso.registradoPor || caso.aprobadoPor || caso.rechazadoPor) && (
          <div className="card p-5 space-y-3">
            <h2 className="section-title flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" /> Trazabilidad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {caso.registradoPor && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Registrado por</p>
                  <p className="text-sm font-medium text-slate-800">{caso.registradoPor}</p>
                  <p className="text-xs text-slate-400">{new Date(caso.createdAt).toLocaleDateString('es-HN')}</p>
                </div>
              )}
              {caso.aprobadoPor && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Aprobado por</p>
                  <p className="text-sm font-medium text-slate-800">{caso.aprobadoPor}</p>
                </div>
              )}
              {caso.rechazadoPor && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Rechazado por</p>
                  <p className="text-sm font-medium text-slate-800">{caso.rechazadoPor}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admision */}
        {admision && (
          <div className="card p-5 space-y-4">
            <h2 className="section-title flex items-center gap-2">
              <ClipboardList size={16} className="text-blue-500" /> Admisión
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <InfoRow label="Responsable" value={admision.responsable} />
                <InfoRow label="Fecha Ingreso" value={admision.fechaHoraIngreso ? new Date(admision.fechaHoraIngreso).toLocaleString('es-HN') : '—'} />
                <InfoRow label="Observaciones" value={admision.observaciones} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Signos Vitales</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['P.A.', admision.signosVitales?.presionArterial],
                    ['F.C.', admision.signosVitales?.frecuenciaCardiaca ? `${admision.signosVitales.frecuenciaCardiaca} bpm` : '—'],
                    ['Temp.', admision.signosVitales?.temperatura ? `${admision.signosVitales.temperatura} °C` : '—'],
                    ['SpO2', admision.signosVitales?.saturacionOxigeno ? `${admision.signosVitales.saturacionOxigeno}%` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-slate-500">{k}</p>
                      <p className="text-sm font-bold text-slate-800">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist */}
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

            {/* Verificación docs */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Verificación de Documentos</p>
              <div className="flex flex-wrap gap-2">
                {[['Identificación', admision.verificacionDocumentos?.identificacion], ['Consentimiento Firmado', admision.verificacionDocumentos?.consentimientoFirmado], ['Orden Médica', admision.verificacionDocumentos?.ordenMedica]].map(([k, v]) => (
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

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value || '—'}</span>
    </div>
  );
}
