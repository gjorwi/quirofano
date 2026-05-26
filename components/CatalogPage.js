'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Plus, Search, Pencil, Trash2, X, Save, ArrowLeft } from 'lucide-react';

export default function CatalogPage({ title, backHref = '/configuracion', icon: Icon, columns, data, renderForm, emptyItem, onCreate, onUpdate, onDelete }) {
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtrado = (data || []).filter(item =>
    columns.some(col => {
      const val = col.accessor(item);
      return typeof val === 'string' && val.toLowerCase().includes(busqueda.toLowerCase());
    })
  );

  const handleEdit = item => { setEditando(item._id); setFormData({ ...item }); setCreando(false); };
  const handleNew = () => { setCreando(true); setEditando(null); setFormData({ ...emptyItem }); };
  const handleSave = async () => {
    setSaving(true);
    try {
      if (creando) {
        if (onCreate) await onCreate(formData);
      } else {
        if (onUpdate) await onUpdate(editando, formData);
      }
    } finally {
      setSaving(false);
      setEditando(null); setCreando(false); setFormData({});
    }
  };
  const handleDelete = async id => {
    if (onDelete) await onDelete(id);
    setConfirmDelete(null);
  };
  const handleCancel = () => { setEditando(null); setCreando(false); setFormData({}); };

  const isEditing = id => editando === id;

  return (
    <div className="page-enter">
      <Header
        title={title}
        subtitle={`${data.length} registros`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleNew} className="btn-primary">
              <Plus size={15} /> Nuevo
            </button>
            <Link href={backHref} className="btn-secondary">
              <ArrowLeft size={15} /> Volver
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-5">
        {/* Nuevo / Editar inline form */}
        {(creando || editando) && (
          <div className="card p-5 border-2 border-blue-200 bg-blue-50/30">
            <h3 className="section-title mb-4">{creando ? 'Nuevo Registro' : 'Editar Registro'}</h3>
            {renderForm(formData, setFormData)}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCancel} className="btn-secondary"><X size={14} /> Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary"><Save size={14} /> {saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="card p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder={`Buscar en ${title.toLowerCase()}…`}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {columns.map(col => (
                    <th key={col.key} className="table-header">{col.label}</th>
                  ))}
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrado.length === 0 && (
                  <tr><td colSpan={columns.length + 1} className="table-cell text-center text-slate-400 py-10">Sin registros.</td></tr>
                )}
                {filtrado.map(item => (
                  <tr key={item._id} className={`hover:bg-slate-50 transition-colors group ${isEditing(item._id) ? 'bg-blue-50' : ''}`}>
                    {columns.map(col => (
                      <td key={col.key} className="table-cell">
                        {col.render ? col.render(item) : <span className={col.bold ? 'font-semibold text-slate-800' : 'text-slate-600'}>{col.accessor(item)}</span>}
                      </td>
                    ))}
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(item._id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Eliminar registro?</h3>
            <p className="text-sm text-slate-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="btn-danger">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
