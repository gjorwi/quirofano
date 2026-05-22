'use client';
import CatalogPage from '@/components/CatalogPage';
import { useData } from '@/components/AppProvider';
import { FileSearch } from 'lucide-react';

const columns = [
  { key: 'codigo',      label: 'Código CIE-10', bold: true, accessor: d => d.codigo || '—' },
  { key: 'nombre',      label: 'Diagnóstico',               accessor: d => d.nombre },
  { key: 'descripcion', label: 'Descripción',               accessor: d => d.descripcion || '—' },
];

const emptyItem = { codigo: '', nombre: '', descripcion: '' };

function Form({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div><label className="label">Código CIE-10</label><input className="input-field" value={data.codigo || ''} onChange={e => set('codigo', e.target.value)} placeholder="Ej. K35.2" /></div>
      <div className="md:col-span-2"><label className="label">Nombre *</label><input className="input-field" value={data.nombre || ''} onChange={e => set('nombre', e.target.value)} /></div>
      <div className="md:col-span-3"><label className="label">Descripción</label><textarea className="input-field" rows={2} value={data.descripcion || ''} onChange={e => set('descripcion', e.target.value)} /></div>
    </div>
  );
}

export default function DiagnosticosPage() {
  const { diagnosticos, crearDiagnostico, actualizarDiagnostico, eliminarDiagnostico } = useData();
  return (
    <CatalogPage
      title="Diagnósticos"
      icon={FileSearch}
      columns={columns}
      data={diagnosticos}
      emptyItem={emptyItem}
      renderForm={(data, setData) => <Form data={data} setData={setData} />}
      onCreate={crearDiagnostico}
      onUpdate={actualizarDiagnostico}
      onDelete={eliminarDiagnostico}
    />
  );
}
