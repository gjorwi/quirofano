'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/components/AppProvider';
import { X, Search, FileSearch, Check } from 'lucide-react';

export default function DiagnosticoSelectorModal({ onSelect, onClose }) {
  const { diagnosticos } = useData();
  const [busqueda, setBusqueda] = useState('');

  const diagnosticosFiltrados = useMemo(() => {
    const txt = busqueda.toLowerCase();
    return diagnosticos.filter(d =>
      d.codigo.toLowerCase().includes(txt) ||
      d.nombre.toLowerCase().includes(txt) ||
      (d.descripcion && d.descripcion.toLowerCase().includes(txt))
    );
  }, [busqueda]);

  const handleSelect = (d) => {
    onSelect(d);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileSearch size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Seleccionar Diagnóstico</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Buscar por código CIE-10, nombre o descripción..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {diagnosticosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <FileSearch size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No se encontraron diagnósticos</p>
              </div>
            )}

            {diagnosticosFiltrados.map(d => (
              <button
                key={d._id}
                onClick={() => handleSelect(d)}
                className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 text-slate-700 group-hover:bg-blue-200 group-hover:text-blue-800">
                        {d.codigo}
                      </span>
                      <p className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm sm:text-base truncate">
                        {d.nombre}
                      </p>
                    </div>
                    {d.descripcion && (
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mt-1">
                        {d.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check size={16} className="text-blue-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
