'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import { EstadoBadge, PrioridadBadge, TipoBadge } from '@/components/StatusBadge';
import { useData } from '@/components/AppProvider';
import { Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react';

const ESTADOS = ['', 'pendiente', 'aprobada', 'rechazada', 'programada', 'en_admision', 'en_curso', 'finalizado', 'cancelado'];
const TIPOS = ['', 'electivo', 'emergencia'];
const PRIORIDADES = ['', 'alta', 'media', 'baja'];

function CasosContent() {
  const searchParams = useSearchParams();
  const { casos, aprobarCaso, rechazarCaso, resolveCaso } = useData();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || '');
  const [filtroTipo, setFiltroTipo] = useState(searchParams.get('tipo') || '');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const casosFiltrados = useMemo(() => {
    return casos
      .filter(c => {
        const r = resolveCaso(c);
        const texto = busqueda.toLowerCase();
        const coincideBusqueda = !texto ||
          r.pacienteObj?.nombre?.toLowerCase().includes(texto) ||
          r.especialistaObj?.nombre?.toLowerCase().includes(texto) ||
          r.procedimientoObj?.nombre?.toLowerCase().includes(texto) ||
          r.diagnosticoObj?.nombre?.toLowerCase().includes(texto);
        return coincideBusqueda &&
          (!filtroEstado || c.estado === filtroEstado) &&
          (!filtroTipo || c.tipo === filtroTipo) &&
          (!filtroPrioridad || c.prioridad === filtroPrioridad);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [busqueda, filtroEstado, filtroTipo, filtroPrioridad]);

  return (
    <div className="page-enter">
      <Header
        title="Casos Quirúrgicos"
        subtitle={`${casosFiltrados.length} de ${casos.length} casos`}
        actions={
          <Link href="/casos/nuevo" className="btn-primary">
            <Plus size={16} /> Nuevo Caso
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente, especialista, procedimiento…"
                className="input-field pl-9"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            <select className="select-field w-40" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {ESTADOS.filter(Boolean).map(e => (
                <option key={e} value={e}>{e.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
              ))}
            </select>

            <select className="select-field w-36" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {TIPOS.filter(Boolean).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>

            <select className="select-field w-36" value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
              <option value="">Toda prioridad</option>
              {PRIORIDADES.filter(Boolean).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            {(busqueda || filtroEstado || filtroTipo || filtroPrioridad) && (
              <button
                className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroTipo(''); setFiltroPrioridad(''); }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header">Paciente</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Prioridad</th>
                  <th className="table-header">Procedimiento / Diagnóstico</th>
                  <th className="table-header">Especialista</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {casosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-cell text-center text-slate-400 py-12">
                      No se encontraron casos con los filtros aplicados.
                    </td>
                  </tr>
                )}
                {casosFiltrados.map(c => {
                  const r = resolveCaso(c);
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="table-cell">
                        <div>
                          <p className="font-semibold text-slate-800">{r.pacienteObj?.nombre}</p>
                          <p className="text-xs text-slate-400">{r.pacienteObj?.identificacion}</p>
                        </div>
                      </td>
                      <td className="table-cell"><TipoBadge tipo={c.tipo} /></td>
                      <td className="table-cell"><PrioridadBadge prioridad={c.prioridad} /></td>
                      <td className="table-cell">
                        <p className="text-slate-700">{r.procedimientoObj?.nombre || '—'}</p>
                        <p className="text-xs text-slate-400">{r.diagnosticoObj?.codigo} · {r.diagnosticoObj?.nombre?.substring(0, 30)}</p>
                      </td>
                      <td className="table-cell text-slate-600">{r.especialistaObj?.nombre}</td>
                      <td className="table-cell"><EstadoBadge estado={c.estado} /></td>
                      <td className="table-cell text-slate-500 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('es-HN')}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/casos/${c._id}`}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={15} />
                          </Link>
                          {c.estado === 'pendiente' && (
                            <>
                              <button
                                onClick={e => { e.preventDefault(); aprobarCaso(c._id); }}
                                className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={e => { e.preventDefault(); rechazarCaso(c._id); }}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                title="Rechazar"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
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
    </div>
  );
}

export default function CasosPage() {
  return (
    <Suspense fallback={<div className="p-4 sm:p-6 lg:p-8 text-slate-400">Cargando...</div>}>
      <CasosContent />
    </Suspense>
  );
}
