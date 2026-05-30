'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/components/AppProvider';
import { ROL_LABELS, ROL_COLORS } from '@/lib/auth';
import { X, Search, User, Check } from 'lucide-react';

export default function UserSelectorModal({ onSelect, onClose }) {
  const { usuarios, especialistas } = useData();
  const [busqueda, setBusqueda] = useState('');

  const usuariosFiltrados = useMemo(() => {
    const txt = busqueda.toLowerCase();
    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(txt) ||
      u.username.toLowerCase().includes(txt)
    );
  }, [usuarios, busqueda]);

  const handleSelect = (u) => {
    onSelect(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Seleccionar Usuario</h2>
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
              placeholder="Buscar por nombre o usuario..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <User size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No se encontraron usuarios</p>
              </div>
            )}

            {usuariosFiltrados.map(u => {
              const esp = u.especialistaId ? especialistas.find(e => e._id === u.especialistaId) : null;
              return (
                <button
                  key={u._id}
                  onClick={() => handleSelect(u)}
                  className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm sm:text-base">
                        {u.nombre}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-slate-500">
                        <span>@{u.username}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${ROL_COLORS[u.rol] || 'bg-slate-100 text-slate-600'}`}>
                          {ROL_LABELS[u.rol]}
                        </span>
                        {esp && <span>{esp.nombre}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check size={16} className="text-blue-600" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}