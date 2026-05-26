'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge } from '@/components/StatusBadge';
import { useAuth } from '@/components/AppProvider';
import { useData } from '@/components/AppProvider';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Printer } from 'lucide-react';

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function MiAgendaPage() {
  const { user } = useAuth();
  const { casos, planes, resolveCaso, getQuirofanoById } = useData();
  const [fechaActual, setFechaActual] = useState(() => new Date().toISOString().split('T')[0]);
  const hoy = new Date().toISOString().split('T')[0];

  // Plans for cases where I'm the primary or team
  const misCasos = casos.filter(c =>
    c.especialistaPrincipal === user?.especialistaId ||
    (c.equipoQuirurgico || []).includes(user?.especialistaId)
  );
  const misCasoIds = new Set(misCasos.map(c => c._id));

  // Week range
  const semanaInicio = (() => {
    const d = new Date(fechaActual + 'T12:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  })();
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaInicio, i));

  const planesMios = planes.filter(p => misCasoIds.has(p.caso));

  const planesPorDia = (dia) => planesMios.filter(p => p.fecha === dia);

  return (
    <div className="page-enter">
      <Header
        title="Mi Agenda Quirúrgica"
        subtitle="Cirugías programadas asignadas a ti"
        actions={
          <button onClick={() => window.print()} className="btn-secondary print:hidden">
            <Printer size={15} /> Imprimir / PDF
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Próximas cirugías */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          {[
            { label: 'Esta semana', planes: planesMios.filter(p => p.fecha >= semanaInicio && p.fecha <= addDays(semanaInicio, 6)) },
            { label: 'Próxima semana', planes: planesMios.filter(p => p.fecha >= addDays(semanaInicio, 7) && p.fecha <= addDays(semanaInicio, 13)) },
            { label: 'Total programadas', planes: planesMios },
          ].map(({ label, planes: ps }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{ps.length}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navegación semana */}
        <div className="card overflow-hidden" id="agenda-calendario">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 print:hidden">
            <button onClick={() => setFechaActual(addDays(semanaInicio, -7))} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              Semana {new Date(semanaInicio + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short' })} –{' '}
              {new Date(addDays(semanaInicio, 6) + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short', year:'numeric' })}
            </span>
            <button onClick={() => setFechaActual(addDays(semanaInicio, 7))} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
          {/* Título visible solo en impresión */}
          <div className="hidden print:block px-5 py-3 border-b border-slate-200 text-center">
            <p className="font-bold text-slate-800">Mi Agenda Quirúrgica — {user?.nombre}</p>
            <p className="text-sm text-slate-500">
              Semana {new Date(semanaInicio + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'long' })} –{' '}
              {new Date(addDays(semanaInicio, 6) + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>

          <div className="overflow-x-auto">
          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[300px] min-w-[560px]">
            {diasSemana.map(dia => {
              const ps = planesPorDia(dia);
              const esHoy = dia === hoy;
              return (
                <div key={dia} className={`p-3 ${esHoy ? 'bg-blue-50' : ''}`}>
                  <div className={`text-xs font-bold mb-0.5 ${esHoy ? 'text-blue-600' : 'text-slate-500'}`}>
                    {new Date(dia + 'T12:00:00').toLocaleDateString('es-HN', { weekday:'short' }).toUpperCase()}
                  </div>
                  <div className={`text-lg font-bold mb-2 ${esHoy ? 'text-blue-600' : 'text-slate-700'}`}>
                    {new Date(dia + 'T12:00:00').getDate()}
                  </div>
                  {ps.length === 0 && <p className="text-xs text-slate-300 italic">Libre</p>}
                  {ps.map(plan => {
                    const c = casos.find(x => x._id === plan.caso);
                    const r = c ? resolveCaso(c) : null;
                    return (
                      <Link key={plan._id} href={`/mis-casos/${plan.caso}`}>
                        <div className="rounded border border-purple-200 bg-purple-50 px-2 py-1.5 mb-1 text-xs hover:bg-purple-100 transition-colors">
                          <p className="font-bold text-purple-700">{plan.horaInicio}</p>
                          <p className="truncate text-purple-800">{r?.pacienteObj?.nombre?.split(' ')[0]}</p>
                          <p className="truncate text-purple-600 opacity-75">{(c?.procedimientoNombre || r?.procedimientoObj?.nombre)?.substring(0, 18)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
          </div>
        </div>

        {/* Lista detallada */}
        {planesMios.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="section-title">Todas mis cirugías programadas</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {planesMios
                .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))
                .map(plan => {
                  const c = casos.find(x => x._id === plan.caso);
                  const r = c ? resolveCaso(c) : null;
                  const q = getQuirofanoById(plan.quirofano);
                  const esPrincipal = c?.especialistaPrincipal === user?.especialistaId;
                  return (
                    <Link key={plan._id} href={`/mis-casos/${plan.caso}`}>
                      <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="text-center w-16 flex-shrink-0">
                          <p className="text-xs text-slate-500">
                            {new Date(plan.fecha + 'T12:00:00').toLocaleDateString('es-HN', { weekday:'short' })}
                          </p>
                          <p className="text-lg font-bold text-slate-800">
                            {new Date(plan.fecha + 'T12:00:00').getDate()}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(plan.fecha + 'T12:00:00').toLocaleDateString('es-HN', { month:'short' })}
                          </p>
                        </div>
                        <div className="w-px h-12 bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-slate-800">{r?.pacienteObj?.nombre}</p>
                            {esPrincipal
                              ? <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Principal</span>
                              : <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Asistente</span>
                            }
                          </div>
                          <p className="text-sm text-slate-500">{c?.procedimientoNombre || r?.procedimientoObj?.nombre}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Clock size={11} /> {plan.horaInicio}–{plan.horaFinEstimada}</span>
                            <span className="flex items-center gap-1"><MapPin size={11} /> {q?.numero} – {q?.ubicacion}</span>
                          </div>
                        </div>
                        <EstadoBadge estado={c?.estado} />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {planesMios.length === 0 && (
          <div className="card p-12 text-center">
            <Calendar size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">No tienes cirugías programadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
