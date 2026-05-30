'use client';
import { useState, useMemo } from 'react';
import { useData } from '@/components/AppProvider';
import { api } from '@/lib/apiClient';
import { X, Search, Plus, User, Check } from 'lucide-react';

export default function PatientSelectorModal({ onSelect, onClose }) {
  const { pacientes, crearPaciente } = useData();
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [creandoPaciente, setCreandoPaciente] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({
    nombre: '',
    identificacion: '',
    email: '',
    fechaNacimiento: '',
    sexo: 'M',
    contacto: '',
    direccion: '',
    historiaClinica: '',
  });

  const pacientesFiltrados = useMemo(() => {
    const txt = busqueda.toLowerCase();
    return pacientes.filter(p =>
      p.nombre.toLowerCase().includes(txt) ||
      p.identificacion.toLowerCase().includes(txt) ||
      (p.historiaClinica && p.historiaClinica.toLowerCase().includes(txt))
    );
  }, [busqueda]);

  const handleSelectPaciente = (p) => {
    onSelect(p);
    onClose();
  };

  const handleCrearPaciente = async () => {
    if (!nuevoForm.email.trim() || !nuevoForm.historiaClinica.trim() || !nuevoForm.identificacion.trim() || !nuevoForm.nombre.trim()) {
      return;
    }
    setCreandoPaciente(true);
    try {
      const nuevo = await crearPaciente({ ...nuevoForm });
      onSelect(nuevo);
      onClose();
    } finally {
      setCreandoPaciente(false);
    }
  };

  const set = (k, v) => setNuevoForm(f => ({ ...f, [k]: v }));

  if (mostrarForm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Registrar Nuevo Paciente</h2>
            </div>
            <button onClick={() => setMostrarForm(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleCrearPaciente(); }} className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="label">Nombre Completo *</label>
                <input
                  className="input-field"
                  value={nuevoForm.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  placeholder="Ej. Juan Pérez García"
                  required
                />
              </div>
              <div>
                <label className="label">Identificación *</label>
                <input
                  className="input-field"
                  value={nuevoForm.identificacion}
                  onChange={e => set('identificacion', e.target.value)}
                  placeholder="Ej. 0801-1990-12345"
                  required
                />
              </div>
              <div>
                <label className="label">Correo Electrónico *</label>
                <input
                  type="email"
                  className="input-field"
                  value={nuevoForm.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="Ej. correo@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="input-field"
                  value={nuevoForm.fechaNacimiento}
                  onChange={e => set('fechaNacimiento', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Sexo *</label>
                <select className="select-field" value={nuevoForm.sexo} onChange={e => set('sexo', e.target.value)} required>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="label">Contacto</label>
                <input
                  className="input-field"
                  value={nuevoForm.contacto}
                  onChange={e => set('contacto', e.target.value)}
                  placeholder="Ej. +504 9999-9999"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Dirección</label>
                <input
                  className="input-field"
                  value={nuevoForm.direccion}
                  onChange={e => set('direccion', e.target.value)}
                  placeholder="Ej. Col. Kennedy, Tegucigalpa"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Historia Clínica *</label>
                <input
                  className="input-field"
                  value={nuevoForm.historiaClinica}
                  onChange={e => set('historiaClinica', e.target.value)}
                  placeholder="Ej. HC-2024-001234"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="btn-secondary w-full sm:w-auto">
                Cancelar
              </button>
              <button type="submit" disabled={creandoPaciente} className="btn-primary w-full sm:w-auto">
                <Check size={15} /> {creandoPaciente ? 'Registrando...' : 'Registrar y Seleccionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Seleccionar Paciente</h2>
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
              placeholder="Buscar por nombre, identificación o historia clínica..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
            />
          </div>

          <button
            onClick={() => setMostrarForm(true)}
            className="w-full btn-primary justify-center py-3"
          >
            <Plus size={16} /> Registrar Nuevo Paciente
          </button>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pacientesFiltrados.length === 0 && (
              <div className="text-center py-8">
                <User size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No se encontraron pacientes</p>
                <button
                  onClick={() => setMostrarForm(true)}
                  className="btn-primary mt-3 inline-flex text-sm"
                >
                  <Plus size={14} /> Registrar Paciente
                </button>
              </div>
            )}

            {pacientesFiltrados.map(p => (
              <button
                key={p._id}
                onClick={() => handleSelectPaciente(p)}
                className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm sm:text-base">
                      {p.nombre}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-slate-500">
                      <span>ID: {p.identificacion}</span>
                      {p.historiaClinica && <span>HC: {p.historiaClinica}</span>}
                      <span>{p.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                    </div>
                    {p.contacto && (
                      <p className="text-xs text-slate-400 mt-1">{p.contacto}</p>
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
