'use client';
import CatalogPage from '@/components/CatalogPage';
import { useData } from '@/components/AppProvider';
import { Stethoscope } from 'lucide-react';

const columns = [
  { key: 'nombre',       label: 'Nombre',            bold: true, accessor: e => e.nombre },
  { key: 'especialidad', label: 'Especialidad',                  accessor: e => e.especialidad || '—' },
  { key: 'codigo',       label: 'Cód. Colegiado',               accessor: e => e.codigoColegiado || '—' },
  {
    key: 'disponibilidad', label: 'Disponibilidad',
    accessor: e => e.disponibilidad?.map(d => d.dia).join(', ') || '—',
    render: e => (
      <div className="flex flex-wrap gap-1">
        {(e.disponibilidad || []).map((d, i) => (
          <span key={i} className="inline-block px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100">
            {d.dia} {d.horaInicio}–{d.horaFin}
          </span>
        ))}
      </div>
    ),
  },
];

const emptyItem = { nombre: '', especialidad: '', codigoColegiado: '', disponibilidad: [] };

function Form({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div><label className="label">Nombre *</label><input className="input-field" value={data.nombre || ''} onChange={e => set('nombre', e.target.value)} /></div>
      <div><label className="label">Especialidad</label><input className="input-field" value={data.especialidad || ''} onChange={e => set('especialidad', e.target.value)} /></div>
      <div><label className="label">Código Colegiado</label><input className="input-field" value={data.codigoColegiado || ''} onChange={e => set('codigoColegiado', e.target.value)} /></div>
    </div>
  );
}

export default function EspecialistasPage() {
  const { especialistas, crearEspecialista, actualizarEspecialista, eliminarEspecialista } = useData();
  return (
    <CatalogPage
      title="Especialistas"
      icon={Stethoscope}
      columns={columns}
      data={especialistas}
      emptyItem={emptyItem}
      renderForm={(data, setData) => <Form data={data} setData={setData} />}
      onCreate={crearEspecialista}
      onUpdate={actualizarEspecialista}
      onDelete={eliminarEspecialista}
    />
  );
}
