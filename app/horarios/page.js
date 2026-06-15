'use client';
import { useState, useMemo } from 'react';
import { useData, useAuth } from '@/components/AppProvider';
import { showToast } from '@/components/ToastMessage';
import Header from '@/components/Header';
import HorarioModal from '@/components/HorarioModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Clock, ChevronLeft, ChevronRight, Calendar as CalIcon,
  Plus, Filter, Stethoscope, Printer, Trash2, Pencil, X, Search
} from 'lucide-react';

const TIPOS = {
  guardia:    { label: 'Guardia',    bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
  turno:      { label: 'Turno',      bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  consulta:   { label: 'Consulta',   bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  disponible: { label: 'Disponible', bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700',   dot: 'bg-slate-400'   },
};

const VIEWS = [
  { value: 'dia',    label: 'Día'    },
  { value: 'semana', label: 'Semana' },
  { value: 'mes',    label: 'Mes'    },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function startOfMonth(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return ymd(new Date(d.getFullYear(), d.getMonth(), 1));
}

function endOfMonth(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function HorarioCard({ h, especialistas = [], onEdit, onDelete, canManage }) {
  const tipo = TIPOS[h.tipo] || TIPOS.guardia;
  const espObj = h.especialista && typeof h.especialista === 'object'
    ? h.especialista
    : especialistas.find(e => String(e._id) === String(h.especialista));
  const espNombre = espObj?.nombre || '—';
  const espLabel  = espObj?.especialidad || h.especialidad || '';
  return (
    <div className={`rounded-lg border ${tipo.border} ${tipo.bg} p-3 transition-all group`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${tipo.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wide ${tipo.text}`}>
            {tipo.label}
          </span>
        </div>
        {canManage && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(h); }}
              className="p-1 rounded hover:bg-white/60 text-slate-600"
              title="Editar"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(h); }}
              className="p-1 rounded hover:bg-red-100 text-red-600"
              title="Eliminar"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
        <Clock size={11} className="text-slate-500" />
        {h.horaInicio} – {h.horaFin}
      </div>
      <p className="text-sm font-semibold text-slate-700 truncate mt-1" title={espNombre}>
        {espNombre}
      </p>
      {espLabel && (
        <p className="text-[10px] text-slate-500 truncate">{espLabel}</p>
      )}
      {h.observaciones && (
        <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">{h.observaciones}</p>
      )}
    </div>
  );
}

export default function HorariosPage() {
  const { user } = useAuth();
  const { horarios, especialistas, eliminarHorario, refetchHorarios } = useData();

  const [vista, setVista]           = useState('semana');
  const [fecha, setFecha]           = useState(() => ymd(new Date()));
  const [filtroEsp, setFiltroEsp]   = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda]     = useState('');
  const [modal, setModal]           = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const today = ymd(new Date());

  const esEspecialista = user?.rol === 'especialista';
  const esAdminODirectivo = ['administrador', 'directivo'].includes(user?.rol);
  const miEspecialidad = useMemo(() => {
    if (!esEspecialista || !user?.especialistaId) return null;
    return especialistas.find(e => e._id === user.especialistaId)?.especialidad || null;
  }, [esEspecialista, user, especialistas]);

  // Especialistas (jefe o no) están restringidos a su propia especialidad.
  // El filtro del UI nunca debe permitir que vean otras.
  const especialidadFija = esEspecialista ? miEspecialidad : null;

  const puedeGestionar = useMemo(() => {
    if (esAdminODirectivo) return true;
    if (esEspecialista && user?.esJefeServicio) return Boolean(miEspecialidad);
    return false;
  }, [esAdminODirectivo, esEspecialista, user, miEspecialidad]);

  const especialidades = useMemo(() => {
    return Array.from(new Set(especialistas.map(e => e.especialidad).filter(Boolean))).sort();
  }, [especialistas]);

  const getEspObj = (h) => h.especialista && typeof h.especialista === 'object'
    ? h.especialista
    : especialistas.find(e => String(e._id) === String(h.especialista));

  const horariosFiltrados = useMemo(() => {
    return horarios.filter(h => {
      // Restricción dura: especialistas solo ven su propia especialidad
      if (especialidadFija && h.especialidad !== especialidadFija) return false;
      if (filtroEsp && h.especialidad !== filtroEsp) return false;
      if (filtroTipo && h.tipo !== filtroTipo) return false;
      if (busqueda) {
        const t = busqueda.toLowerCase();
        const espObj = getEspObj(h);
        const esp = (espObj?.nombre || '').toLowerCase();
        const obs = (h.observaciones || '').toLowerCase();
        if (!esp.includes(t) && !obs.includes(t)) return false;
      }
      return true;
    });
  }, [horarios, especialistas, especialidadFija, filtroEsp, filtroTipo, busqueda]);

  const horariosPorFecha = useMemo(() => {
    const map = {};
    for (const h of horariosFiltrados) {
      (map[h.fecha] = map[h.fecha] || []).push(h);
    }
    Object.values(map).forEach(arr => arr.sort((a,b) => a.horaInicio.localeCompare(b.horaInicio)));
    return map;
  }, [horariosFiltrados]);

  // Navegación por vista
  const prev = () => {
    if (vista === 'dia')    setFecha(addDays(fecha, -1));
    if (vista === 'semana') setFecha(addDays(startOfWeek(fecha), -7));
    if (vista === 'mes') {
      const d = new Date(fecha + 'T12:00:00');
      setFecha(ymd(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
    }
  };
  const next = () => {
    if (vista === 'dia')    setFecha(addDays(fecha, 1));
    if (vista === 'semana') setFecha(addDays(startOfWeek(fecha), 7));
    if (vista === 'mes') {
      const d = new Date(fecha + 'T12:00:00');
      setFecha(ymd(new Date(d.getFullYear(), d.getMonth() + 1, 1)));
    }
  };
  const goToday = () => setFecha(today);

  const onEditHorario = (h) => setModal({ mode: 'edit', horario: h });
  const onDeleteHorario = (h) => setConfirmDel(h);
  const handleConfirmDelete = async () => {
    const h = confirmDel;
    setConfirmDel(null);
    try {
      await eliminarHorario(h._id);
      showToast('Horario eliminado', 'success');
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const subtitleByView = () => {
    if (vista === 'dia') {
      return new Date(fecha + 'T12:00:00').toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (vista === 'semana') {
      const ini = startOfWeek(fecha);
      return `${new Date(ini + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short' })} – ${new Date(addDays(ini, 6) + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short', year:'numeric' })}`;
    }
    const d = new Date(fecha + 'T12:00:00');
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
  };

  const tituloPagina = useMemo(() => {
    if (user?.rol === 'especialista' && miEspecialidad && !esAdminODirectivo) {
      return `Horarios — ${miEspecialidad}`;
    }
    if (filtroEsp) return `Horarios — ${filtroEsp}`;
    return 'Horarios de Especialistas';
  }, [user, miEspecialidad, filtroEsp, esAdminODirectivo]);

  // ──────────────── Renders de vistas ────────────────
  const renderDia = () => {
    const lista = horariosPorFecha[fecha] || [];
    return (
      <div className="card p-4 sm:p-5">
        {lista.length === 0 ? (
          <div className="text-center py-10">
            <CalIcon size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">No hay horarios registrados para esta fecha.</p>
            {puedeGestionar && (
              <button onClick={() => setModal({ mode: 'new', fecha })} className="btn-primary mt-4 mx-auto">
                <Plus size={15} /> Registrar horario
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lista.map(h => (
              <HorarioCard
                key={h._id}
                h={h}
                especialistas={especialistas}
                onEdit={onEditHorario}
                onDelete={onDeleteHorario}
                canManage={puedeGestionar}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSemana = () => {
    const ini = startOfWeek(fecha);
    const dias = Array.from({ length: 7 }, (_, i) => addDays(ini, i));
    return (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[300px] min-w-[560px]">
            {dias.map(dia => {
              const lista = horariosPorFecha[dia] || [];
              const esHoy = dia === today;
              const esSel = dia === fecha;
              return (
                <div
                  key={dia}
                  onClick={() => { setFecha(dia); setVista('dia'); }}
                  className={`p-2 sm:p-3 cursor-pointer transition-colors ${esSel ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`text-[10px] font-bold mb-0.5 ${esHoy ? 'text-blue-600' : 'text-slate-500'}`}>
                    {new Date(dia + 'T12:00:00').toLocaleDateString('es-HN', { weekday: 'short' }).toUpperCase()}
                  </div>
                  <div className={`text-lg font-bold mb-2 ${esHoy ? 'text-blue-600' : 'text-slate-700'}`}>
                    {new Date(dia + 'T12:00:00').getDate()}
                  </div>
                  {lista.length === 0 && <p className="text-[10px] text-slate-300 italic">Sin horarios</p>}
                  <div className="space-y-1.5">
                    {lista.slice(0, 4).map(h => {
                      const tipo = TIPOS[h.tipo] || TIPOS.guardia;
                      const espObj = getEspObj(h);
                      return (
                        <div key={h._id} className={`rounded border ${tipo.border} ${tipo.bg} px-1.5 py-1`}>
                          <p className={`text-[10px] font-bold ${tipo.text}`}>{h.horaInicio}–{h.horaFin}</p>
                          <p className="text-[10px] text-slate-700 truncate font-medium">
                            {espObj?.nombre?.split(' ').slice(0,2).join(' ')}
                          </p>
                        </div>
                      );
                    })}
                    {lista.length > 4 && (
                      <p className="text-[10px] text-slate-400 font-medium">+{lista.length - 4} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center py-1.5 sm:hidden border-t border-slate-100">
          ← Desliza para ver más días · Toca un día para ver detalle
        </p>
      </div>
    );
  };

  const renderMes = () => {
    const inicioMes = startOfMonth(fecha);
    const finMes    = endOfMonth(fecha);
    const ini       = startOfWeek(inicioMes);
    const totalDias = (() => {
      const start = new Date(ini + 'T12:00:00');
      const end   = new Date(finMes + 'T12:00:00');
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    })();
    const dias = Array.from({ length: totalDias }, (_, i) => addDays(ini, i));
    return (
      <div className="card overflow-hidden">
        {/* Encabezado días */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100">
          {dias.map(dia => {
            const d = new Date(dia + 'T12:00:00');
            const enMes = d.getMonth() === new Date(fecha + 'T12:00:00').getMonth();
            const esHoy = dia === today;
            const lista = horariosPorFecha[dia] || [];
            const counts = lista.reduce((acc, h) => {
              acc[h.tipo] = (acc[h.tipo] || 0) + 1;
              return acc;
            }, {});
            return (
              <button
                key={dia}
                onClick={() => { setFecha(dia); setVista('dia'); }}
                className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 text-left border-b border-slate-100 transition-colors
                  ${enMes ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/40 text-slate-300 hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs sm:text-sm font-bold ${esHoy ? 'text-blue-600' : enMes ? 'text-slate-700' : 'text-slate-400'}`}>
                    {d.getDate()}
                  </span>
                  {lista.length > 0 && (
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      {lista.length}
                    </span>
                  )}
                </div>
                {lista.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {Object.entries(counts).map(([tipo, n]) => (
                      <span key={tipo} className={`w-1.5 h-1.5 rounded-full ${TIPOS[tipo]?.dot || 'bg-slate-400'}`} title={`${TIPOS[tipo]?.label}: ${n}`} />
                    ))}
                  </div>
                )}
                {lista.length > 0 && (() => {
                  const espObj = getEspObj(lista[0]);
                  return (
                    <p className="hidden sm:block text-[10px] text-slate-500 truncate mt-1">
                      {espObj?.nombre?.split(' ').slice(0,2).join(' ')}
                      {lista.length > 1 ? ` +${lista.length - 1}` : ''}
                    </p>
                  );
                })()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Leyenda de tipos
  const leyendaActiva = useMemo(() => {
    const set = new Set(horariosFiltrados.map(h => h.tipo));
    return Object.entries(TIPOS).filter(([k]) => set.has(k));
  }, [horariosFiltrados]);

  const hayFiltros = (!esEspecialista && filtroEsp) || filtroTipo || busqueda;
  const limpiarFiltros = () => {
    if (!esEspecialista) setFiltroEsp('');
    setFiltroTipo('');
    setBusqueda('');
  };

  return (
    <div className="page-enter">
      <Header
        title={tituloPagina}
        subtitle={subtitleByView()}
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {VIEWS.map(v => (
                <button
                  key={v.value}
                  onClick={() => setVista(v.value)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors
                    ${vista === v.value ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className={`btn-secondary relative ${hayFiltros ? 'ring-2 ring-blue-200' : ''}`}
              title="Filtros"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filtros</span>
              {hayFiltros && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            {puedeGestionar && (
              <button onClick={() => setModal({ mode: 'new', fecha })} className="btn-primary">
                <Plus size={14} />
                <span className="hidden sm:inline">Registrar</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Barra de navegación por fecha */}
        <div className="card p-2 flex items-center justify-between gap-2 print:hidden">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-100">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="input-field max-w-[170px] text-center"
            />
            <button onClick={goToday} className="btn-secondary text-xs px-2 py-1.5">
              Hoy
            </button>
          </div>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-slate-100">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Filtros desplegables */}
        {filtersOpen && (
          <div className="card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <Filter size={15} className="text-blue-600" />
                Filtros
              </h3>
              {hayFiltros && (
                <button onClick={limpiarFiltros} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <X size={12} /> Limpiar
                </button>
              )}
            </div>
            <div className={`grid grid-cols-1 ${esEspecialista ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3`}>
              {!esEspecialista && (
                <div>
                  <label className="label">Especialidad</label>
                  <select
                    className="select-field"
                    value={filtroEsp}
                    onChange={e => setFiltroEsp(e.target.value)}
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              )}
              {esEspecialista && miEspecialidad && (
                <div>
                  <label className="label">Especialidad</label>
                  <div className="input-field flex items-center bg-slate-50 text-slate-600 cursor-not-allowed">
                    <Stethoscope size={14} className="mr-2 text-slate-400" />
                    {miEspecialidad}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Mostrando solo los horarios de tu especialidad.</p>
                </div>
              )}
              <div>
                <label className="label">Tipo</label>
                <select
                  className="select-field"
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(TIPOS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Buscar</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="input-field pl-9"
                    placeholder="Especialista u observación…"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:hidden">
          {[
            { label: 'Total visibles', val: horariosFiltrados.length, color: 'bg-slate-100 text-slate-700' },
            { label: 'Guardias',       val: horariosFiltrados.filter(h => h.tipo === 'guardia').length,    color: 'bg-rose-100 text-rose-700' },
            { label: 'Turnos',         val: horariosFiltrados.filter(h => h.tipo === 'turno').length,      color: 'bg-blue-100 text-blue-700' },
            { label: 'Consultas',      val: horariosFiltrados.filter(h => h.tipo === 'consulta').length,   color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Disponibles',    val: horariosFiltrados.filter(h => h.tipo === 'disponible').length, color: 'bg-slate-100 text-slate-700' },
          ].map(s => (
            <div key={s.label} className="card p-3 sm:p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Clock size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-900">{s.val}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        {leyendaActiva.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Tipos:</span>
            {leyendaActiva.map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${v.dot}`} />
                <span className="text-xs text-slate-600">{v.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Vista seleccionada */}
        {vista === 'dia'    && renderDia()}
        {vista === 'semana' && renderSemana()}
        {vista === 'mes'    && renderMes()}

        {/* Lista plana (resumen) */}
        {horariosFiltrados.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <Stethoscope size={15} className="text-blue-600" />
                Detalle de horarios
              </h3>
              <span className="text-xs text-slate-500">{horariosFiltrados.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header text-[10px] sm:text-xs">Fecha</th>
                    <th className="table-header text-[10px] sm:text-xs">Horario</th>
                    <th className="table-header text-[10px] sm:text-xs">Especialista</th>
                    <th className="table-header text-[10px] sm:text-xs hidden sm:table-cell">Especialidad</th>
                    <th className="table-header text-[10px] sm:text-xs">Tipo</th>
                    <th className="table-header text-[10px] sm:text-xs hidden md:table-cell">Registrado por</th>
                    {puedeGestionar && <th className="table-header text-[10px] sm:text-xs text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {horariosFiltrados
                    .slice()
                    .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))
                    .map(h => {
                      const tipo = TIPOS[h.tipo] || TIPOS.guardia;
                      const espObj = getEspObj(h);
                      return (
                        <tr key={h._id} className="hover:bg-slate-50">
                          <td className="table-cell whitespace-nowrap">
                            <p className="text-xs font-bold text-slate-800">
                              {new Date(h.fecha + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short' })}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(h.fecha + 'T12:00:00').toLocaleDateString('es-HN', { weekday:'short' })}
                            </p>
                          </td>
                          <td className="table-cell whitespace-nowrap">
                            <p className="text-xs font-bold text-blue-700">{h.horaInicio} – {h.horaFin}</p>
                          </td>
                          <td className="table-cell">
                            <p className="text-xs font-semibold text-slate-700">{espObj?.nombre || '—'}</p>
                          </td>
                          <td className="table-cell hidden sm:table-cell">
                            <p className="text-xs text-slate-600">{h.especialidad || espObj?.especialidad || '—'}</p>
                          </td>
                          <td className="table-cell">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tipo.bg} ${tipo.text} ${tipo.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tipo.dot}`} />
                              {tipo.label}
                            </span>
                          </td>
                          <td className="table-cell hidden md:table-cell">
                            <p className="text-xs text-slate-600 truncate max-w-[140px]">{h.creadoPor || '—'}</p>
                          </td>
                          {puedeGestionar && (
                            <td className="table-cell text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => onEditHorario(h)}
                                  className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                                  title="Editar"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => onDeleteHorario(h)}
                                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                                  title="Eliminar"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {horariosFiltrados.length === 0 && horarios.length > 0 && (
          <div className="card p-10 text-center">
            <Filter size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No hay horarios que coincidan con los filtros aplicados.</p>
            <button onClick={limpiarFiltros} className="btn-secondary mt-3 mx-auto text-xs">Limpiar filtros</button>
          </div>
        )}

        {horarios.length === 0 && (
          <div className="card p-12 text-center">
            <Clock size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">No hay horarios registrados todavía.</p>
            {puedeGestionar && (
              <button onClick={() => setModal({ mode: 'new', fecha: today })} className="btn-primary mt-4 mx-auto">
                <Plus size={15} /> Registrar el primer horario
              </button>
            )}
          </div>
        )}
      </div>

      {modal && (
        <HorarioModal
          horario={modal.mode === 'edit' ? modal.horario : null}
          fechaInicial={modal.fecha}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Eliminar horario"
          message={`¿Eliminar el horario de ${getEspObj(confirmDel)?.nombre || 'este especialista'} del ${new Date(confirmDel.fecha + 'T12:00:00').toLocaleDateString('es-HN')}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}
