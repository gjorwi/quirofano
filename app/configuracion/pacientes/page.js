'use client';
import CatalogPage from '@/components/CatalogPage';
import { useData } from '@/components/AppProvider';
import { Users } from 'lucide-react';

const columns = [
  { key: 'nombre',          label: 'Nombre',           bold: true,  accessor: p => p.nombre },
  { key: 'identificacion',  label: 'Identificación',               accessor: p => p.identificacion },
  { key: 'fechaNacimiento', label: 'Fecha Nacimiento',             accessor: p => p.fechaNacimiento ? new Date(p.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-HN') : '—' },
  { key: 'sexo',            label: 'Sexo',                         accessor: p => p.sexo || '—' },
  { key: 'contacto',        label: 'Contacto',                     accessor: p => p.contacto || '—' },
  { key: 'historiaClinica', label: 'Historia Clínica',             accessor: p => p.historiaClinica || '—' },
];

const emptyItem = { nombre: '', identificacion: '', fechaNacimiento: '', sexo: '', contacto: '', historiaClinica: '' };

function Form({ data, setData }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div><label className="label">Nombre *</label><input className="input-field" value={data.nombre || ''} onChange={e => set('nombre', e.target.value)} /></div>
      <div><label className="label">Identificación *</label><input className="input-field" value={data.identificacion || ''} onChange={e => set('identificacion', e.target.value)} /></div>
      <div><label className="label">Fecha Nacimiento</label><input type="date" className="input-field" value={data.fechaNacimiento || ''} onChange={e => set('fechaNacimiento', e.target.value)} /></div>
      <div><label className="label">Sexo</label>
        <select className="select-field" value={data.sexo || ''} onChange={e => set('sexo', e.target.value)}>
          <option value="">— Seleccione —</option>
          <option>Masculino</option><option>Femenino</option><option>Otro</option>
        </select>
      </div>
      <div><label className="label">Contacto</label><input className="input-field" value={data.contacto || ''} onChange={e => set('contacto', e.target.value)} /></div>
      <div><label className="label">Historia Clínica</label><input className="input-field" value={data.historiaClinica || ''} onChange={e => set('historiaClinica', e.target.value)} /></div>
    </div>
  );
}

export default function PacientesPage() {
  const { pacientes, crearPaciente, actualizarPaciente, eliminarPaciente } = useData();
  return (
    <CatalogPage
      title="Pacientes"
      icon={Users}
      columns={columns}
      data={pacientes}
      onCreate={crearPaciente}
      onUpdate={actualizarPaciente}
      onDelete={eliminarPaciente}
      emptyItem={emptyItem}
      renderForm={(data, setData) => <Form data={data} setData={setData} />}
    />
  );
}
