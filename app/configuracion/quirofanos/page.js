'use client';
import CatalogPage from '@/components/CatalogPage';
import { useData } from '@/components/AppProvider';
import { Building2 } from 'lucide-react';

const TIPO_COLORS = {
  general:      'bg-blue-50 text-blue-700 border-blue-100',
  especializado: 'bg-purple-50 text-purple-700 border-purple-100',
  emergencia:   'bg-red-50 text-red-700 border-red-100',
};

const columns = [
  { key: 'numero',    label: 'N° Quirófano', bold: true,  accessor: q => q.numero },
  { key: 'ubicacion', label: 'Ubicación',                 accessor: q => q.ubicacion || '—' },
  {
    key: 'tipo', label: 'Tipo',
    accessor: q => q.tipo,
    render: q => (
      <span className={`badge ${TIPO_COLORS[q.tipo] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
        {q.tipo}
      </span>
    ),
  },
  {
    key: 'equipamiento', label: 'Equipamiento',
    accessor: q => (q.equipamiento || []).join(', '),
    render: q => (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {(q.equipamiento || []).map((eq, i) => (
          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{eq}</span>
        ))}
      </div>
    ),
  },
  {
    key: 'habilitado', label: 'Estado',
    accessor: q => q.habilitado ? 'Habilitado' : 'Deshabilitado',
    render: q => (
      <span className={`badge ${q.habilitado ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
        {q.habilitado ? 'Habilitado' : 'Deshabilitado'}
      </span>
    ),
  },
];

const emptyItem = { numero: '', ubicacion: '', tipo: 'general', equipamiento: [], habilitado: true };

function Form({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="label">Número *</label><input className="input-field" value={data.numero || ''} onChange={e => set('numero', e.target.value)} placeholder="Ej. Q-05" /></div>
      <div><label className="label">Ubicación</label><input className="input-field" value={data.ubicacion || ''} onChange={e => set('ubicacion', e.target.value)} /></div>
      <div>
        <label className="label">Tipo</label>
        <select className="select-field" value={data.tipo || 'general'} onChange={e => set('tipo', e.target.value)}>
          <option value="general">General</option>
          <option value="especializado">Especializado</option>
          <option value="emergencia">Emergencia</option>
        </select>
      </div>
      <div>
        <label className="label">Estado</label>
        <select className="select-field" value={data.habilitado ? 'true' : 'false'} onChange={e => set('habilitado', e.target.value === 'true')}>
          <option value="true">Habilitado</option>
          <option value="false">Deshabilitado</option>
        </select>
      </div>
    </div>
  );
}

export default function QuirofanosPage() {
  const { quirofanos, crearQuirofano, actualizarQuirofano, eliminarQuirofano } = useData();
  return (
    <CatalogPage
      title="Quirófanos"
      icon={Building2}
      columns={columns}
      data={quirofanos}
      emptyItem={emptyItem}
      renderForm={(data, setData) => <Form data={data} setData={setData} />}
      onCreate={crearQuirofano}
      onUpdate={actualizarQuirofano}
      onDelete={eliminarQuirofano}
    />
  );
}
