'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/components/AppProvider';
import { X, Search, ClipboardList, AlertCircle, Filter } from 'lucide-react';
import { TipoBadge, PrioridadBadge } from '@/components/StatusBadge';

const PRIORIDADES = ['', 'alta', 'media', 'baja'];
const TIPOS       = ['', 'electivo', 'emergencia'];

export default function CasoSelectorModal({ onSelect, onClose }) {
  const { casos, resolveCaso } = useData();
  const [busqueda,       setBusqueda]       = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroTipo,      setFiltroTipo]      = useState('');

  const casosAprobados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return casos
      .filter(c => c.estado === 'aprobada')
      .filter(c => {
        const r = resolveCaso(c);
        if (!texto) return true;
        return (
          r.pacienteObj?.nombre?.toLowerCase().includes(texto) ||
          r.especialistaObj?.nombre?.toLowerCase().includes(texto) ||
          r.procedimientoObj?.nombre?.toLowerCase().includes(texto) ||
          r.diagnosticoObj?.nombre?.toLowerCase().includes(texto)
        );
      })
      .filter(c => !filtroPrioridad || c.prioridad === filtroPrioridad)
      .filter(c => !filtroTipo      || c.tipo      === filtroTipo)
      .sort((a, b) => {
        const order = { alta: 0, media: 1, baja: 2 };
        return (order[a.prioridad] ?? 1) - (order[b.prioridad] ?? 1);
      });
  }, [casos, busqueda, filtroPrioridad, filtroTipo, resolveCaso]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Seleccionar Caso Aprobado</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="px-5 py-3 border-b border-slate-100 space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              className="input-field pl-9"
              placeholder="Buscar por paciente, especialista, procedimiento…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500">Filtrar:</span>
            </div>
            {TIPOS.filter(Boolean).map(t => (
              <button key={t} onClick={() => setFiltroTipo(filtroTipo === t ? '' : t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors
                  ${filtroTipo === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <span className="text-slate-200 text-xs">|</span>
            {PRIORIDADES.filter(Boolean).map(p => (
              <button key={p} onClick={() => setFiltroPrioridad(filtroPrioridad === p ? '' : p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors
                  ${filtroPrioridad === p
                    ? p === 'alta' ? 'bg-red-500 text-white border-red-500'
                      : p === 'media' ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
            {(busqueda || filtroPrioridad || filtroTipo) && (
              <button onClick={() => { setBusqueda(''); setFiltroPrioridad(''); setFiltroTipo(''); }}
                className="px-2.5 py-1 rounded-lg text-xs text-red-600 border border-red-200 hover:bg-red-50">
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {casosAprobados.length === 0 && (
            <div className="py-12 text-center">
              <ClipboardList size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No se encontraron casos aprobados con esos filtros.</p>
            </div>
          )}
          {casosAprobados.map(c => {
            const r = resolveCaso(c);
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                        {r.pacienteObj?.nombre || 'Paciente'}
                      </p>
                      <TipoBadge tipo={c.tipo} />
                      <PrioridadBadge prioridad={c.prioridad} />
                    </div>
                    <p className="text-xs text-slate-600 truncate">{r.procedimientoObj?.nombre || '—'}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-slate-400">
                      <span>{r.especialistaObj?.nombre}</span>
                      {c.duracionEstimadaMin && <span>· {c.duracionEstimadaMin} min</span>}
                      {r.diagnosticoObj?.codigo && <span>· {r.diagnosticoObj.codigo}</span>}
                    </div>
                    {c.tipo === 'emergencia' && c.motivoEmergencia && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                        <AlertCircle size={11} />
                        <span>{c.motivoEmergencia}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString('es-HN')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">{casosAprobados.length} caso{casosAprobados.length !== 1 ? 's' : ''} disponible{casosAprobados.length !== 1 ? 's' : ''}</span>
          <button onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
