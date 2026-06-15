'use client';
import { useState, useMemo } from 'react';
import { useData, useAuth } from '@/components/AppProvider';
import { getToken, getBaseUrl } from '@/lib/apiClient';
import { TIPOS_ESPACIO } from '@/components/BocetoPiso';
import EspacioModal from '@/components/EspacioModal';
import EspacioForm from '@/components/EspacioForm';
import PisoForm from '@/components/PisoForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Building2, FileSpreadsheet, Printer, Plus,
  ChevronRight, Filter, X, Trophy, AlertCircle,
  Wrench, Search, Trash2, MapPin, Layers
} from 'lucide-react';

const ESTADOS = {
  operativo:       { label: 'Operativo',       cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  en_reparacion:   { label: 'En reparación',   cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  fuera_servicio:  { label: 'Fuera de servicio', cls: 'bg-red-100 text-red-700 border-red-200' },
  planificacion:   { label: 'En planificación', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export default function CedulaHospitalariaPage() {
  const { user } = useAuth();
  const { pisos, espacios, eliminarEspacio, eliminarPiso } = useData();
  const [espacioSel, setEspacioSel] = useState(null);
  const [nuevoEspacio, setNuevoEspacio] = useState(null);
  const [nuevoPiso, setNuevoPiso] = useState(false);
  const [pisoAEliminar, setPisoAEliminar] = useState(null);
  const [espacioAEliminar, setEspacioAEliminar] = useState(null);
  const [pisoSel, setPisoSel] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const puedeEditar = ['cedula', 'administrador', 'directivo'].includes(user?.rol);

  const espaciosVisibles = useMemo(() => {
    if (!pisoSel) return espacios;
    return espacios.filter(e => (e.pisoId?._id || e.pisoId) === pisoSel);
  }, [espacios, pisoSel]);

  const espaciosFiltrados = useMemo(() => {
    return espaciosVisibles.filter(e => {
      if (filtroTipo && e.tipo !== filtroTipo) return false;
      if (filtroEstado && e.estado !== filtroEstado) return false;
      if (busqueda) {
        const t = busqueda.toLowerCase();
        const enTexto = `${e.codigo} ${e.nombre} ${e.responsable || ''} ${e.observaciones || ''}`.toLowerCase();
        if (!enTexto.includes(t)) return false;
      }
      return true;
    });
  }, [espaciosVisibles, filtroTipo, filtroEstado, busqueda]);

  const counts = useMemo(() => {
    const total      = espaciosVisibles.length;
    const reqsPend   = espaciosVisibles.reduce((acc, e) => acc + (e.requerimientos || []).filter(r => r.estado !== 'resuelto').length, 0);
    const logrosTot  = espaciosVisibles.reduce((acc, e) => acc + (e.logros || []).length, 0);
    const enRepar    = espaciosVisibles.filter(e => e.estado === 'en_reparacion' || e.estado === 'fuera_servicio').length;
    return { total, reqsPend, logrosTot, enRepar };
  }, [espaciosVisibles]);

  const handleExportExcel = () => {
    const token = getToken();
    if (!token) return;
    const url = pisoSel
      ? `${getBaseUrl()}/api/cedula/export/excel?pisoId=${pisoSel}`
      : `${getBaseUrl()}/api/cedula/export/excel`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('Error al generar Excel'); return r.blob(); })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'cedula-hospitalaria.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch(err => alert(err.message));
  };

  const handleImprimir = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleEliminarEspacio = async () => {
    if (!espacioAEliminar) return;
    try {
      await eliminarEspacio(espacioAEliminar._id);
      setEspacioAEliminar(null);
      setEspacioSel(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEliminarPiso = async () => {
    if (!pisoAEliminar) return;
    try {
      await eliminarPiso(pisoAEliminar._id);
      if (pisoSel === pisoAEliminar._id) setPisoSel('');
      setPisoAEliminar(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const pisoActual = pisoSel ? pisos.find(p => p._id === pisoSel) : null;

  return (
    <div className="page-enter">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Cédula Hospitalaria</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Inventario físico institucional · logros · requerimientos</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {puedeEditar && (
              <button onClick={() => setNuevoPiso(true)} className="btn-primary" title="Registrar nuevo piso">
                <Plus size={14} />
                <span className="hidden sm:inline">Registrar piso</span>
              </button>
            )}
            <button onClick={handleImprimir} className="btn-secondary" title="Imprimir">
              <Printer size={14} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 transition-colors" title="Exportar a Excel">
              <FileSpreadsheet size={14} />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Espacios"        val={counts.total}     color="bg-slate-100 text-slate-700"  icon={Building2} />
          <StatCard label="Logros"          val={counts.logrosTot} color="bg-emerald-100 text-emerald-700" icon={Trophy} />
          <StatCard label="Requerimientos"  val={counts.reqsPend}  color="bg-red-100 text-red-700"      icon={AlertCircle} />
          <StatCard label="En reparación / fuera" val={counts.enRepar} color="bg-amber-100 text-amber-700" icon={Wrench} />
        </div>

        <div className="card p-3 sm:p-4 print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <Layers size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Piso:</span>
            <button
              onClick={() => setPisoSel('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                !pisoSel
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Todos ({espacios.length})
            </button>
            {pisos.map(p => {
              const cant = espacios.filter(e => (e.pisoId?._id || e.pisoId) === p._id).length;
              const activo = pisoSel === p._id;
              return (
                <div key={p._id} className="relative">
                  <button
                    onClick={() => setPisoSel(p._id)}
                    className={`pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      activo
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {p.nombre} ({cant})
                  </button>
                  {puedeEditar && (
                    <button
                      onClick={(ev) => { ev.stopPropagation(); setPisoAEliminar(p); }}
                      className={`absolute top-1/2 -translate-y-1/2 right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                        activo
                          ? 'bg-white/90 text-red-500 hover:bg-white'
                          : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                      }`}
                      title="Eliminar piso"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
            {puedeEditar && pisos.length === 0 && (
              <span className="text-xs text-slate-400 italic">Aún no hay pisos registrados. Usa &quot;Registrar piso&quot;.</span>
            )}
          </div>
        </div>

        {puedeEditar && pisoSel && (
          <p className="text-xs text-slate-500 print:hidden">
            Estás viendo los espacios de <span className="font-semibold text-slate-700">{pisoActual?.nombre}</span>.
          </p>
        )}

        <div className="card p-3 sm:p-4 print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-field pl-9 text-sm"
                placeholder="Buscar por código, nombre, responsable u observación…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <select className="select-field max-w-[180px] text-sm" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {Object.entries(TIPOS_ESPACIO).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select className="select-field max-w-[180px] text-sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            {(filtroTipo || filtroEstado || busqueda) && (
              <button
                onClick={() => { setFiltroTipo(''); setFiltroEstado(''); setBusqueda(''); }}
                className="btn-secondary text-xs"
              >
                <X size={12} /> <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            {puedeEditar && (
              <button onClick={() => setNuevoEspacio({ pisoId: pisoSel || '' })} className="btn-primary" title="Registrar nuevo espacio">
                <Plus size={14} />
                <span className="hidden sm:inline">Registrar espacio</span>
              </button>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header text-xs">Código</th>
                  <th className="table-header text-xs">Nombre</th>
                  <th className="table-header text-xs hidden md:table-cell">Piso</th>
                  <th className="table-header text-xs">Tipo</th>
                  <th className="table-header text-xs">Estado</th>
                  <th className="table-header text-xs hidden md:table-cell">Área</th>
                  <th className="table-header text-xs text-center">Logros</th>
                  <th className="table-header text-xs text-center">Req. pend.</th>
                  <th className="table-header text-xs text-right print:hidden">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {espaciosFiltrados.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400 text-sm">Sin espacios registrados.</td></tr>
                )}
                {espaciosFiltrados.map(e => {
                  const tipo = TIPOS_ESPACIO[e.tipo] || TIPOS_ESPACIO.otro;
                  const estado = ESTADOS[e.estado] || ESTADOS.operativo;
                  const reqsPend = (e.requerimientos || []).filter(r => r.estado !== 'resuelto').length;
                  const pisoEspId = e.pisoId?._id || e.pisoId;
                  const pisoEsp = pisos.find(p => p._id === pisoEspId);
                  return (
                    <tr key={e._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setEspacioSel(e)}>
                      <td className="table-cell">
                        <span className="font-mono font-bold text-xs text-slate-700">{e.codigo}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: tipo.fill }} />
                          <span className="font-semibold text-sm text-slate-800">{e.nombre}</span>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin size={11} className="text-slate-400" />
                          {pisoEsp?.nombre || '—'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-slate-600">{tipo.label}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${estado.cls}`}>{estado.label}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-xs text-slate-600">{e.areaM2 ? `${e.areaM2} m²` : '—'}</span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                          <Trophy size={11} /> {(e.logros || []).length}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        {reqsPend > 0
                          ? <span className="inline-flex items-center gap-1 text-xs text-red-700 font-bold">
                              <AlertCircle size={11} /> {reqsPend}
                            </span>
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="table-cell text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          {puedeEditar && (
                            <button
                              onClick={(ev) => { ev.stopPropagation(); setEspacioAEliminar(e); }}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <ChevronRight size={15} className="text-slate-400 inline" />
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

      {espacioSel && (
        <EspacioModal
          espacio={espacioSel}
          onClose={() => setEspacioSel(null)}
        />
      )}

      {nuevoEspacio && (
        <EspacioForm
          pisoInicial={nuevoEspacio.pisoId}
          onClose={() => setNuevoEspacio(null)}
        />
      )}

      {nuevoPiso && (
        <PisoForm onClose={() => setNuevoPiso(false)} />
      )}

      {espacioAEliminar && (
        <ConfirmDialog
          title="Eliminar espacio"
          message={`¿Eliminar el espacio "${espacioAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleEliminarEspacio}
          onCancel={() => setEspacioAEliminar(null)}
          confirmLabel="Eliminar espacio"
          danger
        />
      )}

      {pisoAEliminar && (
        <ConfirmDialog
          title="Eliminar piso"
          message={`¿Eliminar el piso "${pisoAEliminar.nombre}"? Se eliminarán también todos los espacios asociados.`}
          onConfirm={handleEliminarPiso}
          onCancel={() => setPisoAEliminar(null)}
          confirmLabel="Eliminar piso"
          danger
        />
      )}
    </div>
  );
}

function StatCard({ label, val, color, icon: Icon }) {
  return (
    <div className="card p-3 sm:p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-900">{val}</p>
        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}
