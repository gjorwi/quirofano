'use client';
import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { useData } from '@/components/AppProvider';
import { estadoConfig } from '@/lib/mockData';
import {
  BarChart3, Clock, Activity, CheckCircle,
  Stethoscope, AlertCircle, Timer, Users
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
const fmtMin = (min) => {
  if (min === null || min === undefined || isNaN(min)) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

const durReal = (c) =>
  c.horaRealInicio && c.horaRealFin
    ? Math.round((new Date(c.horaRealFin) - new Date(c.horaRealInicio)) / 60000)
    : null;

const avg = (sum, count) => (count > 0 ? Math.round(sum / count) : null);

const ESTADO_BAR = {
  pendiente:   'bg-yellow-400',
  aprobada:    'bg-blue-400',
  programada:  'bg-purple-400',
  en_admision: 'bg-orange-400',
  en_curso:    'bg-green-400',
  finalizado:  'bg-slate-400',
  cancelado:   'bg-red-300',
  rechazada:   'bg-red-400',
};

const PERIODOS = [
  { key: 'hoy',    label: 'Hoy'      },
  { key: 'semana', label: 'Semana'   },
  { key: 'mes',    label: 'Mes'      },
  { key: 'año',    label: 'Año'      },
  { key: 'todo',   label: 'Histórico'},
];

function enPeriodo(c, periodo) {
  const ref = c.horaRealFin ? new Date(c.horaRealFin) : new Date(c.updatedAt);
  const now = new Date();
  switch (periodo) {
    case 'hoy':
      return ref.toDateString() === now.toDateString();
    case 'semana': {
      const lun = new Date(now);
      lun.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      lun.setHours(0, 0, 0, 0);
      return ref >= lun;
    }
    case 'mes':
      return ref.getMonth() === now.getMonth() && ref.getFullYear() === now.getFullYear();
    case 'año':
      return ref.getFullYear() === now.getFullYear();
    default:
      return true;
  }
}

// ── page ───────────────────────────────────────────────────────────────────
export default function EstadisticasPage() {
  const { casos, especialistas } = useData();
  const [periodo, setPeriodo] = useState('mes');

  const s = useMemo(() => {
    // Base: SOLO finalizados, filtrados por período
    const finalizados = casos.filter(c => c.estado === 'finalizado');
    const fBase       = finalizados.filter(c => enPeriodo(c, periodo));
    const conTiempo   = fBase.filter(c => durReal(c) !== null);

    const tiempoTotalMin   = conTiempo.reduce((acc, c) => acc + durReal(c), 0);
    const tiempoPromMin    = avg(tiempoTotalMin, conTiempo.length);
    const estimadoTotalMin = fBase
      .filter(c => c.duracionEstimadaMin)
      .reduce((acc, c) => acc + c.duracionEstimadaMin, 0);

    // Por tipo (sobre fBase)
    const porTipo = {
      electivo:   fBase.filter(c => c.tipo === 'electivo').length,
      emergencia: fBase.filter(c => c.tipo === 'emergencia').length,
    };

    // Por prioridad (sobre fBase)
    const porPrioridad = { alta: 0, media: 0, baja: 0 };
    fBase.forEach(c => { if (porPrioridad[c.prioridad] !== undefined) porPrioridad[c.prioridad]++; });

    // Estado actual de TODOS los casos (snapshot, sin filtro de período)
    const ESTADOS = ['pendiente','aprobada','programada','en_admision','en_curso','finalizado','cancelado','rechazada'];
    const porEstado = ESTADOS.reduce((acc, e) => {
      acc[e] = casos.filter(c => c.estado === e).length;
      return acc;
    }, {});

    // ── Por especialidad (sobre fBase) ────────────────────────────────
    const espMap = {};
    fBase.forEach(c => {
      const esp = especialistas.find(e => e._id === c.especialistaPrincipal);
      const key = esp?.especialidad || 'Sin especialidad';
      if (!espMap[key]) espMap[key] = { label: key, count: 0, tiempoTotal: 0, nTiempo: 0, estimadoTotal: 0, nEstimado: 0 };
      espMap[key].count++;
      const d = durReal(c);
      if (d !== null) { espMap[key].tiempoTotal += d; espMap[key].nTiempo++; }
      if (c.duracionEstimadaMin) { espMap[key].estimadoTotal += c.duracionEstimadaMin; espMap[key].nEstimado++; }
    });

    const porEspecialidad = Object.values(espMap)
      .map(e => ({
        ...e,
        promReal:     avg(e.tiempoTotal, e.nTiempo),
        promEstimado: avg(e.estimadoTotal, e.nEstimado),
      }))
      .sort((a, b) => b.count - a.count);

    // ── Por especialista (sobre fBase) ────────────────────────────────
    const docMap = {};
    fBase.forEach(c => {
      const esp = especialistas.find(e => e._id === c.especialistaPrincipal);
      if (!esp) return;
      const id = esp._id;
      if (!docMap[id]) docMap[id] = {
        nombre: esp.nombre, especialidad: esp.especialidad,
        count: 0, tiempoTotal: 0, nTiempo: 0, estimadoTotal: 0, nEstimado: 0,
      };
      docMap[id].count++;
      const d = durReal(c);
      if (d !== null) { docMap[id].tiempoTotal += d; docMap[id].nTiempo++; }
      if (c.duracionEstimadaMin) { docMap[id].estimadoTotal += c.duracionEstimadaMin; docMap[id].nEstimado++; }
    });

    const porEspecialista = Object.values(docMap)
      .map(d => ({
        ...d,
        promReal:     avg(d.tiempoTotal, d.nTiempo),
        promEstimado: avg(d.estimadoTotal, d.nEstimado),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total: casos.length,
      fBase: fBase.length,
      conTiempo: conTiempo.length,
      tiempoTotalMin, tiempoPromMin, estimadoTotalMin,
      porTipo, porPrioridad, porEstado,
      porEspecialidad, porEspecialista,
    };
  }, [casos, especialistas, periodo]);

  const maxEsp = Math.max(...s.porEspecialidad.map(e => e.count), 1);
  const maxDoc = Math.max(...s.porEspecialista.map(d => d.count), 1);

  return (
    <div className="page-enter">
      <Header title="Estadísticas" subtitle="Métricas consolidadas de actividad quirúrgica" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Selector de período ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Período:</span>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {PERIODOS.map(p => (
              <button key={p.key} onClick={() => setPeriodo(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${periodo === p.key
                    ? 'bg-white shadow text-blue-600'
                    : 'text-slate-500 hover:text-slate-700'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 italic">
            — datos basados en intervenciones finalizadas
          </span>
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard icon={CheckCircle} color="blue"   label="Intervenciones Finalizadas" value={s.fBase}        sub={`${s.total} casos en total histórico`} />
          <KpiCard icon={Activity}    color="green"  label="Con Tiempos Registrados"    value={s.conTiempo}    sub={s.fBase ? `${Math.round(s.conTiempo/s.fBase*100)}% de las finalizadas` : '—'} />
          <KpiCard icon={Clock}       color="purple" label="Tiempo Real Total"          value={fmtMin(s.tiempoTotalMin)} sub={`Estimado total: ${fmtMin(s.estimadoTotalMin)}`} />
          <KpiCard icon={Timer}       color="orange" label="Promedio por Intervención"  value={fmtMin(s.tiempoPromMin)} sub={s.conTiempo ? `sobre ${s.conTiempo} con tiempos` : '—'} />
        </div>

        {/* ── Tipo + Prioridad + Estado ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Por tipo */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <BarChart3 size={15} className="text-blue-500" /> Por Tipo
            </h2>
            {s.fBase === 0 ? <Empty /> : (
              <div className="space-y-3">
                {[['electivo','Electivo','bg-blue-500'],['emergencia','Emergencia','bg-red-500']].map(([tipo,label,bar]) => {
                  const n = s.porTipo[tipo]; const pct = s.fBase ? Math.round(n/s.fBase*100) : 0;
                  return (
                    <div key={tipo}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-bold text-slate-800">{n} <span className="text-xs font-normal text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${bar} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Por prioridad */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <AlertCircle size={15} className="text-blue-500" /> Por Prioridad
            </h2>
            {s.fBase === 0 ? <Empty /> : (
              <div className="space-y-3">
                {[['alta','Alta','bg-red-500'],['media','Media','bg-yellow-400'],['baja','Baja','bg-green-500']].map(([p,label,bar]) => {
                  const n = s.porPrioridad[p]; const pct = s.fBase ? Math.round(n/s.fBase*100) : 0;
                  return (
                    <div key={p}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-bold text-slate-800">{n} <span className="text-xs font-normal text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${bar} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Estado actual — snapshot histórico completo */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2 mb-1">
              <Activity size={15} className="text-blue-500" /> Estado Actual
            </h2>
            <p className="text-xs text-slate-400 mb-3 italic">Todos los casos, sin filtro de período</p>
            <div className="space-y-2">
              {Object.entries(s.porEstado).filter(([, n]) => n > 0).map(([estado, n]) => (
                <div key={estado} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ESTADO_BAR[estado]}`} />
                    <span className="text-xs text-slate-600 truncate">{estadoConfig[estado]?.label}</span>
                  </div>
                  <span className="font-bold text-sm text-slate-800 flex-shrink-0">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Por Especialidad ─────────────────────────────────────────── */}
        <div className="card p-5">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Stethoscope size={15} className="text-blue-500" /> Intervenciones por Especialidad
          </h2>
          {s.porEspecialidad.length === 0 ? <Empty /> : (
            <div className="space-y-4">
              {s.porEspecialidad.map(({ label, count, tiempoTotal, promReal, promEstimado }) => {
                const pct  = Math.round(count / maxEsp * 100);
                const diff = promReal !== null && promEstimado !== null ? promReal - promEstimado : null;
                return (
                  <div key={label}>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-1.5">
                      <span className="text-sm font-semibold text-slate-800">{label}</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span><strong className="text-slate-700">{count}</strong> finalizadas</span>
                        {tiempoTotal > 0 && <span>T. total real: <strong className="text-slate-700">{fmtMin(tiempoTotal)}</strong></span>}
                        {promReal     !== null && <span>Prom. real: <strong className="text-slate-700">{fmtMin(promReal)}</strong></span>}
                        {promEstimado !== null && <span>Prom. est.: <strong className="text-slate-700">{fmtMin(promEstimado)}</strong></span>}
                        {diff !== null && (
                          <span className={`font-semibold ${diff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {diff > 0 ? `+${fmtMin(diff)}` : `-${fmtMin(Math.abs(diff))}`} vs estimado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Por Especialista ─────────────────────────────────────────── */}
        <div className="card p-5">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Users size={15} className="text-blue-500" /> Intervenciones por Especialista
          </h2>
          {s.porEspecialista.length === 0 ? <Empty /> : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Especialista','Especialidad','Finalizadas','T. Total','Prom. Real','Prom. Est.','Δ Prom.'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {s.porEspecialista.map(d => {
                      const diff = d.promReal !== null && d.promEstimado !== null ? d.promReal - d.promEstimado : null;
                      return (
                        <tr key={d.nombre} className="hover:bg-slate-50">
                          <td className="py-2.5 pr-4 font-medium text-slate-800">{d.nombre}</td>
                          <td className="py-2.5 pr-4 text-slate-500 text-xs">{d.especialidad}</td>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{d.count}</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.round(d.count/maxDoc*100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-slate-600">{fmtMin(d.tiempoTotal || null)}</td>
                          <td className="py-2.5 pr-4 font-semibold text-slate-800">{fmtMin(d.promReal)}</td>
                          <td className="py-2.5 pr-4 text-slate-500">{fmtMin(d.promEstimado)}</td>
                          <td className="py-2.5">
                            {diff !== null ? (
                              <span className={`text-xs font-semibold ${diff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {diff > 0 ? `+${fmtMin(diff)}` : `-${fmtMin(Math.abs(diff))}`}
                              </span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {s.porEspecialista.map(d => {
                  const diff = d.promReal !== null && d.promEstimado !== null ? d.promReal - d.promEstimado : null;
                  return (
                    <div key={d.nombre} className="bg-slate-50 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{d.nombre}</p>
                          <p className="text-xs text-slate-500">{d.especialidad}</p>
                        </div>
                        <span className="text-2xl font-black text-blue-600">{d.count}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.round(d.count/maxDoc*100)}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-slate-500">T. Total: <strong className="text-slate-700">{fmtMin(d.tiempoTotal || null)}</strong></span>
                        <span className="text-slate-500">Prom. real: <strong className="text-slate-700">{fmtMin(d.promReal)}</strong></span>
                        <span className="text-slate-500">Prom. est.: <strong className="text-slate-700">{fmtMin(d.promEstimado)}</strong></span>
                        {diff !== null && (
                          <span className={`col-span-2 font-semibold ${diff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            Δ {diff > 0 ? `+${fmtMin(diff)}` : `-${fmtMin(Math.abs(diff))}`} vs estimado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────
function Empty() {
  return <p className="text-slate-400 text-sm text-center py-6">Sin datos para el período seleccionado</p>;
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', val: 'text-orange-700' },
};

function KpiCard({ icon: Icon, color, label, value, sub }) {
  const c = COLOR_MAP[color];
  return (
    <div className="card p-4 sm:p-5 flex items-start gap-3">
      <div className={`${c.bg} p-2 sm:p-2.5 rounded-xl flex-shrink-0`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
        <p className={`text-xl sm:text-2xl font-black ${c.val} mt-0.5`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}
