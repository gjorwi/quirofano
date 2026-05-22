'use client';
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { EstadoBadge, TipoBadge } from '@/components/StatusBadge';
import { useData } from '@/components/AppProvider';
import { 
  Users, Stethoscope, CheckCircle, XCircle, Clock, 
  ChevronRight, AlertCircle, Calendar, CheckCheck
} from 'lucide-react';

export default function ProyeccionQuirurgicaPage() {
  const { casos, actualizarCaso, resolveCaso } = useData();
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Agrupar casos pendientes por especialista
  const casosPorEspecialista = useMemo(() => {
    const pendientes = casos.filter(c => c.estado === 'pendiente');
    const agrupados = {};
    
    pendientes.forEach(caso => {
      const resuelto = resolveCaso(caso);
      const especialistaId = caso.especialistaPrincipal;
      const especialista = resuelto.especialistaObj;
      
      if (!agrupados[especialistaId]) {
        agrupados[especialistaId] = {
          especialista,
          casos: [],
          total: 0,
          emergencias: 0,
          electivos: 0,
        };
      }
      
      agrupados[especialistaId].casos.push({ ...caso, resuelto });
      agrupados[especialistaId].total++;
      if (caso.tipo === 'emergencia') {
        agrupados[especialistaId].emergencias++;
      } else {
        agrupados[especialistaId].electivos++;
      }
    });
    
    return Object.values(agrupados);
  }, [casos]);

  const casosDelEspecialista = useMemo(() => {
    if (!especialistaSeleccionado) return [];
    const grupo = casosPorEspecialista.find(
      g => g.especialista._id === especialistaSeleccionado
    );
    return grupo?.casos || [];
  }, [especialistaSeleccionado, casosPorEspecialista]);

  const handleAprobar = async (casoId) => {
    setProcesando(true);
    await actualizarCaso(casoId, { estado: 'aprobada' });
    setProcesando(false);
  };

  const handleRechazar = async (casoId) => {
    setProcesando(true);
    await actualizarCaso(casoId, { estado: 'rechazada' });
    setProcesando(false);
  };

  const handleAprobarTodos = async () => {
    if (!confirm(`¿Aprobar todos los ${casosDelEspecialista.length} casos de este especialista?`)) {
      return;
    }
    setProcesando(true);
    for (const caso of casosDelEspecialista) {
      await actualizarCaso(caso._id, { estado: 'aprobada' });
    }
    setProcesando(false);
    setEspecialistaSeleccionado(null);
  };

  return (
    <div className="page-enter">
      <Header
        title="Proyección Quirúrgica"
        subtitle="Revisión de casos propuestos por especialistas"
        actions={
          especialistaSeleccionado && casosDelEspecialista.length > 0 && (
            <button
              onClick={handleAprobarTodos}
              disabled={procesando}
              className="btn-success text-xs sm:text-sm"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Aprobar Todos</span>
              <span className="sm:hidden">Todos</span>
            </button>
          )
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {!especialistaSeleccionado ? (
          <>
            {/* Vista de especialistas */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-slate-600" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Especialistas con Casos Pendientes
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                {casosPorEspecialista.length} especialista{casosPorEspecialista.length !== 1 ? 's' : ''}
              </div>
            </div>

            {casosPorEspecialista.length === 0 ? (
              <div className="card p-8 sm:p-12 text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No hay casos pendientes
                </h3>
                <p className="text-sm text-slate-500">
                  Todos los casos propuestos han sido revisados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {casosPorEspecialista.map(({ especialista, total, emergencias, electivos }) => (
                  <button
                    key={especialista._id}
                    onClick={() => setEspecialistaSeleccionado(especialista._id)}
                    className="card p-4 sm:p-5 hover:shadow-lg transition-all text-left group border-2 border-transparent hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                        <Stethoscope size={20} className="text-blue-600 group-hover:text-white sm:w-[22px] sm:h-[22px]" />
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base truncate">
                      {especialista.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 truncate">{especialista.especialidad}</p>
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <div className="flex-1 text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">{total}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500">Total</p>
                      </div>
                      {emergencias > 0 && (
                        <div className="flex-1 text-center">
                          <p className="text-xl sm:text-2xl font-bold text-red-600">{emergencias}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500">Urgente</p>
                        </div>
                      )}
                      {electivos > 0 && (
                        <div className="flex-1 text-center">
                          <p className="text-xl sm:text-2xl font-bold text-slate-600">{electivos}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500">Electivo</p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Vista de casos del especialista */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setEspecialistaSeleccionado(null)}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ChevronRight size={18} className="rotate-180 text-slate-600" />
              </button>
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  {casosPorEspecialista.find(g => g.especialista._id === especialistaSeleccionado)?.especialista.nombre}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {casosDelEspecialista.length} caso{casosDelEspecialista.length !== 1 ? 's' : ''} pendiente{casosDelEspecialista.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {casosDelEspecialista.map(caso => (
                <div key={caso._id} className="card p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <TipoBadge tipo={caso.tipo} />
                        {caso.tipo === 'emergencia' && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle size={14} />
                            <span className="text-xs font-medium">Urgente</span>
                          </div>
                        )}
                        <span className="text-xs text-slate-400">
                          {caso.createdAt ? new Date(caso.createdAt).toLocaleDateString('es-HN') : '—'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Paciente</p>
                          <p className="text-sm font-medium text-slate-900">{caso.resuelto.pacienteObj?.nombre}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Procedimiento</p>
                          <p className="text-sm text-slate-700 line-clamp-1">{caso.resuelto.procedimientoObj?.nombre}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Diagnóstico</p>
                          <p className="text-sm text-slate-700 line-clamp-1">
                            {caso.resuelto.diagnosticoObj?.codigo} - {caso.resuelto.diagnosticoObj?.nombre}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Duración Est.</p>
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-slate-400" />
                            <p className="text-sm text-slate-700">{caso.duracionEstimadaMin} min</p>
                          </div>
                        </div>
                      </div>

                      {caso.observaciones && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Observaciones</p>
                          <p className="text-sm text-slate-600">{caso.observaciones}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() => handleAprobar(caso._id)}
                        disabled={procesando}
                        className="btn-success flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <CheckCircle size={16} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(caso._id)}
                        disabled={procesando}
                        className="btn-danger flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <XCircle size={16} />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
