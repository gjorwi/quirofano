'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge, TipoBadge } from '@/components/StatusBadge';
import { useData } from '@/components/AppProvider';
import ProgramarPlanModal from '@/components/ProgramarPlanModal';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, MapPin, User, Printer } from 'lucide-react';

const Q_COLORS_SOLID = ['bg-blue-500','bg-purple-500','bg-emerald-500','bg-red-500','bg-orange-500'];
const Q_COLORS_LIGHT = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-red-50 border-red-200 text-red-800',
  'bg-orange-50 border-orange-200 text-orange-800',
];

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function formatFecha(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-HN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
}

function formatFechaLarga(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-HN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function PlanCard({ plan, casos, resolveCaso, getQuirofanoById, qColorLight }) {
  const caso = casos.find(c => c._id === plan.caso);
  if (!caso) return null;
  const r = resolveCaso(caso);
  const q = getQuirofanoById(plan.quirofano);
  const colorLight = qColorLight || 'bg-slate-50 border-slate-200 text-slate-800';

  return (
    <Link href={`/casos/${caso._id}`}>
      <div className={`rounded-lg border p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer ${colorLight}`}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Clock size={11} />
            {plan.horaInicio} – {plan.horaFinEstimada}
          </div>
          <TipoBadge tipo={caso.tipo} />
        </div>
        <p className="text-sm font-semibold truncate">{r.pacienteObj?.nombre}</p>
        <p className="text-xs opacity-75 truncate mt-0.5">{r.procedimientoObj?.nombre}</p>
        <div className="flex items-center gap-1 mt-1.5 text-xs opacity-70">
          <User size={10} />
          <span className="truncate">{r.especialistaObj?.nombre}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5 text-xs opacity-70">
          <MapPin size={10} />
          <span>{q?.numero} – {q?.ubicacion}</span>
        </div>
        <div className="mt-2">
          <EstadoBadge estado={caso.estado} />
        </div>
      </div>
    </Link>
  );
}

export default function PlanesPage() {
  const { casos, planes, quirofanos, resolveCaso, getQuirofanoById } = useData();
  const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const hoy = localToday();
  const [fechaActual, setFechaActual] = useState(localToday);

  const qColorSolidMap = Object.fromEntries(quirofanos.map((q, i) => [q._id, Q_COLORS_SOLID[i % Q_COLORS_SOLID.length]]));
  const qColorLightMap = Object.fromEntries(quirofanos.map((q, i) => [q._id, Q_COLORS_LIGHT[i % Q_COLORS_LIGHT.length]]));
  const [vistaMode, setVistaMode] = useState('semana');
  const [mostrarModal, setMostrarModal] = useState(false);

  const semanaInicio = (() => {
    const d = new Date(fechaActual + 'T12:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  })();

  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaInicio, i));

  const planesDelDia = planes.filter(p => p.fecha === fechaActual);
  const planesSemana = diasSemana.map(dia => ({
    dia,
    planes: planes.filter(p => p.fecha === dia),
  }));

  const prevSemana = () => setFechaActual(addDays(semanaInicio, -7));
  const nextSemana = () => setFechaActual(addDays(semanaInicio, 7));

  return (
    <div className="page-enter">
      <Header
        title="Plan Quirúrgico"
        subtitle={vistaMode === 'dia' ? formatFechaLarga(fechaActual) : `Semana del ${formatFecha(semanaInicio)}`}
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {['dia', 'semana'].map(v => (
                <button
                  key={v}
                  onClick={() => setVistaMode(v)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors
                    ${vistaMode === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {v === 'dia' ? 'Día' : 'Semana'}
                </button>
              ))}
            </div>
            <button className="btn-secondary text-xs sm:text-sm" onClick={() => window.print()}>
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button className="btn-primary text-xs sm:text-sm" onClick={() => setMostrarModal(true)}>
              <Plus size={14} />
              <span className="hidden sm:inline">Programar Caso</span>
              <span className="sm:hidden">Programar</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Leyenda quirófanos */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Quirófanos:</span>
          {quirofanos.map(q => (
            <div key={q._id} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${qColorSolidMap[q._id] || 'bg-slate-400'}`} />
              <span className="text-xs text-slate-600">{q.numero} – {q.tipo}</span>
            </div>
          ))}
        </div>

        {/* Vista Semana */}
        {vistaMode === 'semana' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <button onClick={prevSemana} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                {formatFecha(semanaInicio)} – {formatFecha(addDays(semanaInicio, 6))}
              </span>
              <button onClick={nextSemana} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
            {/* En móvil: scroll horizontal. En desktop: grid */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[300px] min-w-[560px]">
                {planesSemana.map(({ dia, planes: planesDelDia }) => {
                  const esHoy = dia === hoy;
                  const esSel = dia === fechaActual;
                  return (
                    <div
                      key={dia}
                      className={`p-2 cursor-pointer transition-colors ${esSel ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      onClick={() => { setFechaActual(dia); setVistaMode('dia'); }}
                    >
                      <div className={`text-[10px] font-semibold mb-0.5 ${esHoy ? 'text-blue-600' : 'text-slate-500'}`}>
                        {new Date(dia + 'T12:00:00').toLocaleDateString('es-HN', { weekday: 'short' }).toUpperCase()}
                      </div>
                      <div className={`text-base font-bold mb-1.5 ${esHoy ? 'text-blue-600' : 'text-slate-700'}`}>
                        {new Date(dia + 'T12:00:00').getDate()}
                      </div>
                      {planesDelDia.length === 0 && (
                        <p className="text-[10px] text-slate-300 italic">Sin<br/>cirugías</p>
                      )}
                      {planesDelDia.map(p => {
                        const c = casos.find(x => x._id === p.caso);
                        const r = c ? resolveCaso(c) : null;
                        const colorCls = qColorLightMap[p.quirofano] || 'bg-slate-50 border-slate-200 text-slate-700';
                        return (
                          <div key={p._id} className={`rounded border px-1.5 py-1 mb-1 text-[10px] ${colorCls}`}>
                            <p className="font-bold">{p.horaInicio}</p>
                            <p className="truncate">{r?.pacienteObj?.nombre?.split(' ')[0]}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center py-1.5 sm:hidden border-t border-slate-100">
              ← Desliza para ver más días · Toca un día para ver detalle
            </p>
          </div>
        )}

        {/* Vista Día */}
        {vistaMode === 'dia' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setFechaActual(addDays(fechaActual, -1))} className="btn-secondary">
                <ChevronLeft size={15} />
              </button>
              <h2 className="text-base font-semibold text-slate-800 flex-1 text-center">
                {formatFechaLarga(fechaActual)}
              </h2>
              <button onClick={() => setFechaActual(addDays(fechaActual, 1))} className="btn-secondary">
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Columnas por quirófano */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {quirofanos.map(q => {
                const planesQ = planesDelDia.filter(p => p.quirofano === q._id);
                const headerColor = qColorSolidMap[q._id] || 'bg-slate-500';
                return (
                  <div key={q._id} className="card overflow-hidden">
                    <div className={`${headerColor} px-4 py-3`}>
                      <p className="text-white font-bold text-sm">{q.numero}</p>
                      <p className="text-white/75 text-xs">{q.ubicacion}</p>
                      <span className="text-white/70 text-xs capitalize">{q.tipo}</span>
                    </div>
                    <div className="p-3">
                      {planesQ.length === 0 ? (
                        <div className="py-8 text-center">
                          <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Sin cirugías</p>
                        </div>
                      ) : (
                        planesQ
                          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                          .map(p => <PlanCard key={p._id} plan={p} casos={casos} resolveCaso={resolveCaso} getQuirofanoById={getQuirofanoById} qColorLight={qColorLightMap[p.quirofano]} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {planesDelDia.length === 0 && (
              <div className="card p-12 text-center">
                <Calendar size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">No hay cirugías programadas para esta fecha.</p>
                <button className="btn-primary mt-4 mx-auto">
                  <Plus size={15} /> Programar Caso
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabla resumen */}
        {vistaMode === 'dia' && planesDelDia.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
              <h2 className="section-title text-sm sm:text-base">Detalle del Día</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4">Hora</th>
                    <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4">Quirófano</th>
                    <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4">Paciente</th>
                    <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4 hidden sm:table-cell">Procedimiento</th>
                    <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4 hidden md:table-cell">Especialista</th>
                    <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {planesDelDia
                    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                    .map(plan => {
                      const caso = casos.find(c => c._id === plan.caso);
                      const r = caso ? resolveCaso(caso) : null;
                      const q = getQuirofanoById(plan.quirofano);
                      return (
                        <tr key={plan._id} className="hover:bg-slate-50">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-bold text-blue-700 whitespace-nowrap">
                            {plan.horaInicio}–{plan.horaFinEstimada}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-sm flex-shrink-0 ${qColorSolidMap[plan.quirofano] || 'bg-slate-400'}`} />
                              <span className="text-xs">{q?.numero}</span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-slate-800 truncate max-w-[90px] sm:max-w-none">{r?.pacienteObj?.nombre}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600 truncate max-w-[120px] hidden sm:table-cell">{r?.procedimientoObj?.nombre}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600 hidden md:table-cell">{r?.especialistaObj?.nombre}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3"><EstadoBadge estado={caso?.estado} /></td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {mostrarModal && (
        <ProgramarPlanModal onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
}
