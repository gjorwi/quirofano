'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/apiClient';
import {
  Users, Stethoscope, Building2, FlaskConical,
  FileSearch, Package, UserCog, ClipboardList,
  CalendarDays, ShieldAlert, Trash2, AlertTriangle, CheckCircle2, X,
  ScrollText,
} from 'lucide-react';

const RESETS = [
  {
    key: 'usuarios',
    label: 'Usuarios',
    desc: 'Elimina todos los usuarios excepto los administradores.',
    icon: UserCog,
    color: 'bg-indigo-500',
    confirm: 'ELIMINAR USUARIOS',
    danger: 'medium',
  },
  {
    key: 'pacientes',
    label: 'Pacientes',
    desc: 'Elimina todos los pacientes registrados.',
    icon: Users,
    color: 'bg-blue-500',
    confirm: 'ELIMINAR PACIENTES',
    danger: 'medium',
  },
  {
    key: 'especialistas',
    label: 'Especialistas',
    desc: 'Elimina todos los especialistas y cirujanos.',
    icon: Stethoscope,
    color: 'bg-purple-500',
    confirm: 'ELIMINAR ESPECIALISTAS',
    danger: 'medium',
  },
  {
    key: 'quirofanos',
    label: 'Quirófanos',
    desc: 'Elimina todas las salas quirúrgicas.',
    icon: Building2,
    color: 'bg-emerald-500',
    confirm: 'ELIMINAR QUIROFANOS',
    danger: 'medium',
  },
  {
    key: 'procedimientos',
    label: 'Procedimientos',
    desc: 'Elimina el catálogo completo de procedimientos.',
    icon: FlaskConical,
    color: 'bg-orange-500',
    confirm: 'ELIMINAR PROCEDIMIENTOS',
    danger: 'medium',
  },
  {
    key: 'diagnosticos',
    label: 'Diagnósticos',
    desc: 'Elimina el catálogo completo de diagnósticos CIE-10.',
    icon: FileSearch,
    color: 'bg-red-500',
    confirm: 'ELIMINAR DIAGNOSTICOS',
    danger: 'medium',
  },
  {
    key: 'insumos',
    label: 'Insumos',
    desc: 'Elimina todos los materiales y suministros.',
    icon: Package,
    color: 'bg-teal-500',
    confirm: 'ELIMINAR INSUMOS',
    danger: 'medium',
  },
  {
    key: 'baremos',
    label: 'Baremos',
    desc: 'Elimina el catálogo completo de baremos de incapacidades.',
    icon: ScrollText,
    color: 'bg-cyan-500',
    confirm: 'ELIMINAR BAREMOS',
    danger: 'medium',
  },
  {
    key: 'admisiones',
    label: 'Admisiones',
    desc: 'Elimina todos los registros de admisión.',
    icon: ClipboardList,
    color: 'bg-yellow-500',
    confirm: 'ELIMINAR ADMISIONES',
    danger: 'high',
  },
  {
    key: 'planes',
    label: 'Planes Quirúrgicos',
    desc: 'Elimina todos los planes y revierte casos a estado "aprobada".',
    icon: CalendarDays,
    color: 'bg-sky-500',
    confirm: 'ELIMINAR PLANES',
    danger: 'high',
  },
  {
    key: 'casos',
    label: 'Casos Quirúrgicos',
    desc: 'Elimina todos los casos incluyendo planes y admisiones asociados.',
    icon: ShieldAlert,
    color: 'bg-rose-600',
    confirm: 'ELIMINAR CASOS',
    danger: 'critical',
  },
];

const DANGER_STYLES = {
  medium:   'border-orange-200 hover:border-orange-400',
  high:     'border-red-200   hover:border-red-400',
  critical: 'border-rose-300  hover:border-rose-500 bg-rose-50/40',
};

const DANGER_BADGE = {
  medium:   'bg-orange-100 text-orange-700',
  high:     'bg-red-100 text-red-700',
  critical: 'bg-rose-100 text-rose-700 font-semibold',
};

const DANGER_LABEL = { medium: 'Medio', high: 'Alto', critical: 'Crítico' };

function ConfirmModal({ item, onClose }) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const match = texto.trim() === item.confirm;
  const Icon = item.icon;

  const handleConfirm = async () => {
    if (!match) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.resetColeccion(item.key);
      setResultado(res.deleted);
    } catch (e) {
      setError(e.message || 'Error al ejecutar el reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`${item.color} w-9 h-9 rounded-xl flex items-center justify-center`}>
              <Icon size={18} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Reset — {item.label}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {resultado !== null ? (
            /* ── Resultado ── */
            <div className="text-center space-y-3 py-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <p className="font-semibold text-slate-800">Reset completado</p>
              <p className="text-sm text-slate-500">
                Se eliminaron <span className="font-bold text-slate-800">{resultado}</span> registro(s) de <strong>{item.label}</strong>.
              </p>
              <button onClick={onClose} className="mt-2 btn-primary w-full justify-center">
                Cerrar
              </button>
            </div>
          ) : (
            /* ── Confirmación ── */
            <>
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Esta acción <strong>no se puede deshacer</strong>. {item.desc}
                </p>
              </div>

              <div>
                <label className="label mb-1.5">
                  Para confirmar, escribe exactamente:
                  <span className="ml-2 font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs select-all">
                    {item.confirm}
                  </span>
                </label>
                <input
                  className={`input-field font-mono tracking-wider transition-colors
                    ${texto && !match ? 'border-red-300 bg-red-50 focus:ring-red-200' : ''}
                    ${match ? 'border-green-400 bg-green-50 focus:ring-green-200' : ''}`}
                  placeholder={item.confirm}
                  value={texto}
                  onChange={e => setTexto(e.target.value.toUpperCase())}
                  autoFocus
                />
                {texto && !match && (
                  <p className="text-xs text-red-500 mt-1">El texto no coincide.</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1 justify-center">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!match || loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={15} />
                  {loading ? 'Eliminando…' : 'Confirmar Reset'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  const [activo, setActivo] = useState(null);

  return (
    <div className="page-enter">
      <Header
        title="Reset de Datos"
        subtitle="Eliminar colecciones del sistema — acción irreversible"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Advertencia global */}
        <div className="flex items-start gap-4 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Zona de peligro</p>
            <p className="text-sm text-red-700 mt-0.5">
              Los resets eliminan datos permanentemente de la base de datos. Cada acción
              requiere confirmar escribiendo el nombre en mayúsculas. No hay forma de recuperar los datos.
            </p>
          </div>
        </div>

        {/* Grid de acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {RESETS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActivo(item)}
                className={`card p-5 text-left group hover:shadow-md transition-all border-2 ${DANGER_STYLES[item.danger]}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.color} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-slate-800">{item.label}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${DANGER_BADGE[item.danger]}`}>
                        {DANGER_LABEL[item.danger]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    <p className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">
                      {item.confirm}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activo && (
        <ConfirmModal item={activo} onClose={() => setActivo(null)} />
      )}
    </div>
  );
}
