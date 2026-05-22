'use client';
import CatalogPage from '@/components/CatalogPage';
import { useData } from '@/components/AppProvider';
import { Package } from 'lucide-react';

const columns = [
  { key: 'nombre',      label: 'Insumo',       bold: true, accessor: i => i.nombre },
  { key: 'descripcion', label: 'Descripción',              accessor: i => i.descripcion || '—' },
];

const emptyItem = { nombre: '', descripcion: '' };

function Form({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="label">Nombre *</label><input className="input-field" value={data.nombre || ''} onChange={e => set('nombre', e.target.value)} /></div>
      <div><label className="label">Descripción</label><input className="input-field" value={data.descripcion || ''} onChange={e => set('descripcion', e.target.value)} /></div>
    </div>
  );
}

export default function InsumosPage() {
  const { insumos, crearInsumo, actualizarInsumo, eliminarInsumo } = useData();
  return (
    <CatalogPage
      title="Insumos"
      icon={Package}
      columns={columns}
      data={insumos}
      emptyItem={emptyItem}
      renderForm={(data, setData) => <Form data={data} setData={setData} />}
      onCreate={crearInsumo}
      onUpdate={actualizarInsumo}
      onDelete={eliminarInsumo}
    />
  );
}
