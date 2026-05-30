'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge, PrioridadBadge } from '@/components/StatusBadge';
import { useAuth } from '@/components/AppProvider';
import { useData } from '@/components/AppProvider';
import { Plus, Eye, Clock, CheckCircle, XCircle, CalendarDays, ClipboardList, Pencil, Trash2 } from 'lucide-react';
import ProponerCasoModal from '@/components/ProponerCasoModal';
import { showToast } from '@/components/ToastMessage';
import ConfirmDialog from '@/components/ConfirmDialog';

const ESTADO_TABS = [
  { key: '',           label: 'Todos' },
  { key: 'pendiente',  label: 'Pendientes' },
  { key: 'aprobada',   label: 'Aprobadas' },
  { key: 'rechazada',  label: 'Rechazadas' },
  { key: 'programada', label: 'Programadas' },
  { key: 'en_admision',label: 'En Admisión' },
  { key: 'en_curso',   label: 'En Curso' },
  { key: 'finalizado', label: 'Finalizados' },
];

export default function MisCasosPage() {
  const { user } = useAuth();
  const { casos, resolveCaso, getQuirofanoById, eliminarCaso } = useData();
  const [tabEstado, setTabEstado] = useState('');
  const [eliminandoId, setEliminandoId] = useState(null);
  const [modalCaso, setModalCaso] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const misCasos = useMemo(() =>
    casos
      .filter(c =>
        c.especialistaPrincipal === user?.especialistaId ||
        (c.equipoQuirurgico || []).includes(user?.especialistaId)
      )
      .filter(c => !tabEstado || c.estado === tabEstado)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [casos, user, tabEstado]
  );

  const conteos = useMemo(() =>
    ESTADO_TABS.slice(1).reduce((acc, t) => {
      acc[t.key] = casos.filter(c =>
        (c.especialistaPrincipal === user?.especialistaId ||
          (c.equipoQuirurgico || []).includes(user?.especialistaId)) &&
        c.estado === t.key
      ).length;
      return acc;
    }, {}),
    [casos, user]
  );

  return (
    <div className="page-enter">
      <Header
        title="Mis Casos"
        subtitle="Casos quirúrgicos propuestos y su seguimiento"
        actions={
          <Link href="/mis-casos/nuevo" className="btn-primary">
            <Plus size={16} /> Proponer Caso
          </Link>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pendientes de Aprobación', key: 'pendiente',  icon: Clock,         color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Aprobados',                key: 'aprobada',   icon: CheckCircle,   color: 'text-blue-600 bg-blue-50' },
            { label: 'Programados',              key: 'programada', icon: CalendarDays,  color: 'text-purple-600 bg-purple-50' },
            { label: 'En Admisión / En Curso',   key: 'activos',    icon: ClipboardList, color: 'text-orange-600 bg-orange-50' },
          ].map(({ label, key, icon: Icon, color }) => (
            <div key={key} className={`card p-4 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {key === 'activos'
                    ? (conteos['en_admision'] || 0) + (conteos['en_curso'] || 0)
                    : conteos[key] || 0}
                </p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm">
          {ESTADO_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTabEstado(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${tabEstado === t.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
              {t.label}
              {t.key && conteos[t.key] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${tabEstado === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {conteos[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {misCasos.length === 0 && (
            <div className="card p-12 text-center">
              <Clock size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">
                {tabEstado ? `No tienes casos con estado "${tabEstado}".` : 'Aún no has propuesto ningún caso.'}
              </p>
              {!tabEstado && (
                <Link href="/mis-casos/nuevo" className="btn-primary mt-4 inline-flex">
                  <Plus size={14} /> Proponer mi primer caso
                </Link>
              )}
            </div>
          )}

          {misCasos.map(c => {
            const r = resolveCaso(c);
            const esPendiente = c.estado === 'pendiente';
            return (
              <div key={c._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <EstadoBadge estado={c.estado} />
                      <PrioridadBadge prioridad={c.prioridad} />
                      {c.tipo === 'emergencia' && (
                        <span className="text-xs font-bold text-red-600">⚡ Emergencia</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 text-base">{r.pacienteObj?.nombre}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{c.procedimientoNombre || r.procedimientoObj?.nombre || '—'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.diagnosticoNombre || (r.diagnosticoObj ? `${r.diagnosticoObj.codigo ? r.diagnosticoObj.codigo + ' · ' : ''}${r.diagnosticoObj.nombre}` : '')}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-2">
                    {/* Estado visual */}
                    {c.estado === 'pendiente' && (
                      <div className="flex items-center gap-1.5 text-yellow-600 text-xs">
                        <Clock size={13} /> Esperando aprobación
                      </div>
                    )}
                    {c.estado === 'aprobada' && (
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                        <CheckCircle size={13} /> Aprobado, sin programar
                      </div>
                    )}
                    {c.estado === 'rechazada' && (
                      <div className="flex items-center gap-1.5 text-red-600 text-xs">
                        <XCircle size={13} /> Rechazado
                      </div>
                    )}
                    {c.estado === 'programada' && r.planObj && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-purple-600">
                          {new Date(r.planObj.fecha + 'T12:00:00').toLocaleDateString('es-HN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500">{r.planObj.horaInicio} – {r.planObj.horaFinEstimada}</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('es-HN')}
                    </p>
                  </div>
                </div>

                {/* Plan info si está programado */}
                {c.estado === 'programada' && r.planObj && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> Programado</span>
                    <span>Quirófano: {r.planObj ? (getQuirofanoById(r.planObj.quirofano)?.numero || '—') : ''}</span>
                  </div>
                )}

                {/* Acciones */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Link href={`/mis-casos/${c._id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                    <Eye size={12} /> Ver
                  </Link>
                  {esPendiente && (
                    <>
                      <button
                        onClick={() => { setModalCaso(r); setMostrarModal(true); }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Pencil size={12} /> Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(c)}
                        disabled={eliminandoId === c._id}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 size={12} /> {eliminandoId === c._id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mostrarModal && (
        <ProponerCasoModal
          caso={modalCaso}
          onClose={() => { setMostrarModal(false); setModalCaso(null); }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar Caso"
          message="¿Estás seguro de eliminar este caso? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          danger
          onConfirm={async () => {
            const idToDelete = confirmDelete._id;
            setConfirmDelete(null);
            setEliminandoId(idToDelete);
            try {
              await eliminarCaso(idToDelete);
              showToast('Caso eliminado exitosamente.', 'success');
            } catch (err) {
              showToast(err.message, 'error');
            }
            setEliminandoId(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
