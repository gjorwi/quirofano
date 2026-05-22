import { estadoConfig, prioridadConfig } from '@/lib/mockData';

export function EstadoBadge({ estado }) {
  const cfg = estadoConfig[estado] || { label: estado, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`badge ${cfg.color}`}>{cfg.label}</span>
  );
}

export function PrioridadBadge({ prioridad }) {
  const cfg = prioridadConfig[prioridad] || { label: prioridad, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function TipoBadge({ tipo }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
      ${tipo === 'emergencia' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
      {tipo === 'emergencia' ? '⚡ Emergencia' : 'Electivo'}
    </span>
  );
}
