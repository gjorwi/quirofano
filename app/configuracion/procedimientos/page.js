'use client';
import CatalogPage from '@/components/CatalogPage';
import { useData } from '@/components/AppProvider';
import { FlaskConical } from 'lucide-react';

const columns = [
  { key: 'nombre',      label: 'Procedimiento', bold: true, accessor: p => p.nombre },
  { key: 'descripcion', label: 'Descripción',               accessor: p => p.descripcion || '—' },
  {
    key: 'duracion', label: 'Duración Promedio',
    accessor: p => p.duracionPromedioMin ? `${p.duracionPromedioMin} min` : '—',
    render: p => (
      <span className="inline-flex items-center gap-1 text-sm">
        <span className="font-semibold text-slate-800">{p.duracionPromedioMin}</span>
        <span className="text-slate-400 text-xs">min</span>
      </span>
    ),
  },
];

const emptyItem = { nombre: '', descripcion: '', duracionPromedioMin: '' };

function Form({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2"><label className="label">Nombre *</label><input className="input-field" value={data.nombre || ''} onChange={e => set('nombre', e.target.value)} /></div>
      <div><label className="label">Duración Promedio (min)</label><input type="number" className="input-field" value={data.duracionPromedioMin || ''} onChange={e => set('duracionPromedioMin', Number(e.target.value))} min={1} /></div>
      <div className="md:col-span-3"><label className="label">Descripción</label><textarea className="input-field" rows={2} value={data.descripcion || ''} onChange={e => set('descripcion', e.target.value)} /></div>
    </div>
  );
}

export default function ProcedimientosPage() {
  const { procedimientos, crearProcedimiento, actualizarProcedimiento, eliminarProcedimiento } = useData();
  return (
    <CatalogPage
      title="Procedimientos"
      icon={FlaskConical}
      columns={columns}
      data={procedimientos}
      emptyItem={emptyItem}
      renderForm={(data, setData) => <Form data={data} setData={setData} />}
      onCreate={crearProcedimiento}
      onUpdate={actualizarProcedimiento}
      onDelete={eliminarProcedimiento}
    />
  );
}
