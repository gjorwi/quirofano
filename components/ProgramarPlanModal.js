'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/components/AppProvider';
import { Calendar, X, Save, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function semanaDeInicio(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

const Q_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];

export default function ProgramarPlanModal({ casoPreseleccionado, onClose }) {
  const { casos, planes, quirofanos, crearPlan, resolveCaso } = useData();

  const casosAprobados = casos.filter(c => c.estado === 'aprobada');

  const [form, setForm] = useState({
    caso: casoPreseleccionado || '',
    fecha: '',
    horaInicio: '07:00',
    horaFinEstimada: '',
    quirofano: '',
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [calSemana, setCalSemana] = useState(null);

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    if (k === 'caso' || k === 'horaInicio') {
      const casoSel = casos.find(c => c._id === next.caso);
      if (casoSel && casoSel.duracionEstimadaMin && next.horaInicio) {
        const [h, m] = next.horaInicio.split(':').map(Number);
        const total = h * 60 + m + casoSel.duracionEstimadaMin;
        next.horaFinEstimada = `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
      }
    }
    if (k === 'fecha' && v) setCalSemana(semanaDeInicio(v));
    setForm(next);
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const conflictos = form.quirofano && form.fecha
    ? planes.filter(p => p.quirofano === form.quirofano && p.fecha === form.fecha && p.caso !== form.caso)
    : [];

  const validate = () => {
    const e = {};
    if (!form.caso)          e.caso          = 'Seleccione un caso';
    if (!form.fecha)         e.fecha         = 'Requerido';
    if (!form.horaInicio)    e.horaInicio    = 'Requerido';
    if (!form.horaFinEstimada) e.horaFinEstimada = 'Requerido';
    if (!form.quirofano)     e.quirofano     = 'Seleccione un quirófano';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    crearPlan(form);
    setSaved(true);
    setTimeout(onClose, 1000);
  };

  const casoSel  = casos.find(c => c._id === form.caso);
  const casoRes  = casoSel ? resolveCaso(casoSel) : null;

  // Calendar state
  const semanaIni = calSemana || semanaDeInicio(new Date().toISOString().split('T')[0]);
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaIni, i));

  const qColorMap = useMemo(() => {
    const m = {};
    quirofanos.forEach((q, i) => { m[q._id] = Q_COLORS[i % Q_COLORS.length]; });
    return m;
  }, [quirofanos]);

  const planesPorDia = (dia) => planes.filter(p => p.fecha === dia);

  const prevSemana = () => setCalSemana(addDays(semanaIni, -7));
  const nextSemana = () => setCalSemana(addDays(semanaIni, 7));

  const selDia = (dia) => set('fecha', dia);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Programar Caso</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><X size={16} /></button>
        </div>

        {saved && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Caso programado exitosamente.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-0 overflow-y-auto flex-1">
          {/* ── Formulario ────────────────────────── */}
          <form id="plan-form" onSubmit={handleSubmit} className="p-6 space-y-4 lg:w-80 xl:w-96 flex-shrink-0 lg:border-r border-slate-100">
            {/* Caso */}
            <div>
              <label className="label">Caso Quirúrgico *</label>
              <select className={`select-field ${errors.caso ? 'border-red-400' : ''}`}
                value={form.caso} onChange={e => set('caso', e.target.value)}
                disabled={!!casoPreseleccionado}>
                <option value="">— Seleccione caso aprobado —</option>
                {casosAprobados.map(c => {
                  const r = resolveCaso(c);
                  return <option key={c._id} value={c._id}>{r.pacienteObj?.nombre} – {r.procedimientoObj?.nombre}</option>;
                })}
              </select>
              {errors.caso && <p className="text-xs text-red-500 mt-1">{errors.caso}</p>}
              {casoRes && (
                <p className="text-xs text-slate-500 mt-1">
                  <strong>{casoSel.duracionEstimadaMin} min</strong> · {casoRes.especialistaObj?.nombre}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="label">Fecha *</label>
              <input type="date" className={`input-field ${errors.fecha ? 'border-red-400' : ''}`}
                value={form.fecha} onChange={e => set('fecha', e.target.value)} />
              {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha}</p>}
            </div>

            {/* Horas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hora Inicio *</label>
                <input type="time" className={`input-field ${errors.horaInicio ? 'border-red-400' : ''}`}
                  value={form.horaInicio} onChange={e => set('horaInicio', e.target.value)} />
              </div>
              <div>
                <label className="label">Hora Fin *</label>
                <input type="time" className={`input-field ${errors.horaFinEstimada ? 'border-red-400' : ''}`}
                  value={form.horaFinEstimada} onChange={e => set('horaFinEstimada', e.target.value)} />
              </div>
            </div>

            {/* Quirofano */}
            <div>
              <label className="label">Quirófano *</label>
              <select className={`select-field ${errors.quirofano ? 'border-red-400' : ''}`}
                value={form.quirofano} onChange={e => set('quirofano', e.target.value)}>
                <option value="">— Seleccione quirófano —</option>
                {quirofanos.filter(q => q.habilitado).map(q => (
                  <option key={q._id} value={q._id}>{q.numero} – {q.ubicacion} ({q.tipo})</option>
                ))}
              </select>
              {errors.quirofano && <p className="text-xs text-red-500 mt-1">{errors.quirofano}</p>}
              {conflictos.length > 0 && (
                <div className="mt-1.5 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                  ⚠️ Este quirófano ya tiene {conflictos.length} cirugía(s) ese día.
                </div>
              )}
            </div>

            <div className="hidden lg:flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saved}>
                <Save size={14} /> Programar
              </button>
            </div>
          </form>

          {/* ── Calendario semanal ────────────────── */}
          <div className="flex-1 p-4 min-w-0">
            {/* Nav semana */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <LayoutGrid size={15} />
                <span className="text-sm font-semibold">Ocupación semanal</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prevSemana} className="p-1 rounded hover:bg-slate-100"><ChevronLeft size={15} /></button>
                <span className="text-xs text-slate-500 font-medium px-1">
                  {new Date(semanaIni + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short' })}
                  {' – '}
                  {new Date(addDays(semanaIni,6) + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short', year:'numeric' })}
                </span>
                <button onClick={nextSemana} className="p-1 rounded hover:bg-slate-100"><ChevronRight size={15} /></button>
              </div>
            </div>

            {/* Leyenda quirofanos */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quirofanos.map((q, i) => (
                <span key={q._id} className="flex items-center gap-1 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${Q_COLORS[i % Q_COLORS.length]}`} />
                  {q.numero}
                </span>
              ))}
            </div>

            {/* Grid días — scroll horizontal en mobile */}
            <div className="overflow-x-auto -mx-1">
            <div className="grid grid-cols-7 gap-1 min-w-[400px] px-1">
              {diasSemana.map(dia => {
                const ps     = planesPorDia(dia);
                const esHoy  = dia === new Date().toISOString().split('T')[0];
                const seleccionado = dia === form.fecha;
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => selDia(dia)}
                    className={`rounded-lg p-1.5 text-left transition-all border-2 min-h-[90px]
                      ${seleccionado ? 'border-blue-500 bg-blue-50' : esHoy ? 'border-blue-200 bg-blue-50/40' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className={`text-[10px] font-bold uppercase mb-0.5 ${seleccionado ? 'text-blue-600' : esHoy ? 'text-blue-400' : 'text-slate-400'}`}>
                      {new Date(dia + 'T12:00:00').toLocaleDateString('es-HN', { weekday: 'short' })}
                    </div>
                    <div className={`text-base font-bold mb-1 ${seleccionado ? 'text-blue-700' : 'text-slate-700'}`}>
                      {new Date(dia + 'T12:00:00').getDate()}
                    </div>
                    {ps.length === 0 && (
                      <div className="text-[9px] text-slate-300 italic">Libre</div>
                    )}
                    {ps.slice(0, 4).map(p => {
                      const color = qColorMap[p.quirofano] || 'bg-slate-400';
                      const esMismo = p.quirofano === form.quirofano;
                      return (
                        <div key={p._id}
                          className={`rounded text-[9px] px-1 py-0.5 mb-0.5 text-white truncate ${color} ${esMismo ? 'ring-1 ring-white ring-offset-1 ring-offset-blue-50' : ''}`}
                          title={`${p.horaInicio} – ${p.horaFinEstimada}`}
                        >
                          {p.horaInicio}
                        </div>
                      );
                    })}
                    {ps.length > 4 && <div className="text-[9px] text-slate-400">+{ps.length - 4}</div>}
                  </button>
                );
              })}
            </div>
            </div>

            {/* Detalle del día seleccionado */}
            {form.fecha && (() => {
              const ps = planesPorDia(form.fecha);
              if (!ps.length) return (
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700 font-medium">
                  ✓ Sin cirugías ese día — fecha disponible
                </div>
              );
              return (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Cirugías el {new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-HN', { weekday:'long', day:'numeric', month:'short' })}
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {ps.sort((a,b) => a.horaInicio.localeCompare(b.horaInicio)).map(p => {
                      const color  = qColorMap[p.quirofano] || 'bg-slate-400';
                      const qObj   = quirofanos.find(q => q._id === p.quirofano);
                      const cObj   = casos.find(c => c._id === p.caso);
                      const cRes   = cObj ? resolveCaso(cObj) : null;
                      const esMismo = p.quirofano === form.quirofano;
                      return (
                        <div key={p._id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${esMismo ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'}`}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                          <span className="font-semibold text-slate-700 w-20 flex-shrink-0">{p.horaInicio}–{p.horaFinEstimada}</span>
                          <span className="text-slate-500 w-10 flex-shrink-0">{qObj?.numero}</span>
                          <span className="text-slate-600 truncate">{cRes?.pacienteObj?.nombre}</span>
                          {esMismo && <span className="ml-auto text-yellow-600 font-semibold flex-shrink-0">Conflicto</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer mobile — visible solo en mobile */}
        <div className="lg:hidden flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" form="plan-form" className="btn-primary" disabled={saved}>
            <Save size={14} /> Programar
          </button>
        </div>
      </div>
    </div>
  );
}
