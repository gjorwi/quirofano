'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import { EstadoBadge, TipoBadge } from '@/components/StatusBadge';
import { useData, useAuth } from '@/components/AppProvider';
import {
  ClipboardList, CheckCircle, Clock, AlertCircle,
  Activity, Calendar, TrendingUp, Users, Stethoscope, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const estadoStats = [
  { key: 'pendiente',   label: 'Pendientes',   icon: Clock,          color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
  { key: 'aprobada',    label: 'Aprobadas',    icon: CheckCircle,    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
  { key: 'programada',  label: 'Programadas',  icon: Calendar,       color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  { key: 'en_admision', label: 'En Admisión',  icon: ClipboardList,  color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  { key: 'en_curso',    label: 'En Curso',     icon: Activity,       color: 'text-green-600',  bg: 'bg-green-50 border-green-100' },
  { key: 'finalizado',  label: 'Finalizados',  icon: TrendingUp,     color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-100' },
];

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#a855f7', '#f97316', '#10b981', '#64748b', '#ef4444', '#dc2626'];

export default function DashboardPage() {
  const { casos, planes, resolveCaso, getQuirofanoById } = useData();
  const { user } = useAuth();
  const hoy = '2026-05-21';

  const statCounts = estadoStats.map(s => ({
    ...s,
    count: casos.filter(c => c.estado === s.key).length,
  }));

  const total = casos.length;
  const emergencias = casos.filter(c => c.tipo === 'emergencia').length;
  const electivos = total - emergencias;

  const distribucionEstado = Object.entries(
    casos.reduce((acc, c) => { acc[c.estado] = (acc[c.estado] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const barData = [
    { name: 'Pendiente', value: casos.filter(c => c.estado === 'pendiente').length, fill: '#f59e0b' },
    { name: 'Aprobada', value: casos.filter(c => c.estado === 'aprobada').length, fill: '#3b82f6' },
    { name: 'Programada', value: casos.filter(c => c.estado === 'programada').length, fill: '#a855f7' },
    { name: 'En Admisión', value: casos.filter(c => c.estado === 'en_admision').length, fill: '#f97316' },
    { name: 'En Curso', value: casos.filter(c => c.estado === 'en_curso').length, fill: '#10b981' },
    { name: 'Finalizado', value: casos.filter(c => c.estado === 'finalizado').length, fill: '#64748b' },
  ];

  const planesHoy = planes.filter(p => p.fecha === hoy);
  const casosUrgentes = casos.filter(c => c.tipo === 'emergencia' && ['en_admision', 'en_curso', 'programada'].includes(c.estado));

  return (
    <div className="page-enter">
      <Header
        title="Dashboard"
        subtitle={`Hoy: ${new Date(hoy + 'T12:00:00').toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {statCounts.map(({ key, label, icon: Icon, color, bg, count }) => (
            <Link href={`/casos?estado=${key}`} key={key}>
              <div className={`card border p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer ${bg}`}>
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <Icon size={16} className={`${color} sm:w-[18px] sm:h-[18px]`} />
                  <span className={`text-xl sm:text-2xl font-bold ${color}`}>{count}</span>
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-slate-600 truncate">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Summary + pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Summary cards */}
          <div className="space-y-3 sm:space-y-4">
            <div className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Stethoscope size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-xs sm:text-sm text-slate-500">Casos totales</p>
              </div>
            </div>
            <div className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{electivos}</p>
                <p className="text-xs sm:text-sm text-slate-500">Casos electivos</p>
              </div>
            </div>
            <div className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{emergencias}</p>
                <p className="text-xs sm:text-sm text-slate-500">Emergencias</p>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="card p-4 sm:p-5 lg:col-span-2">
            <h2 className="section-title mb-3 sm:mb-4 text-sm sm:text-base">Distribución por Estado</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan hoy + Emergencias activas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Plan hoy */}
          <div className="card">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
              <h2 className="section-title text-sm sm:text-base">Cirugías de Hoy</h2>
              <Link href="/planes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver plan <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {planesHoy.length === 0 && (
                <p className="text-xs sm:text-sm text-slate-400 p-4 sm:p-5 text-center">Sin cirugías programadas para hoy.</p>
              )}
              {planesHoy.map(plan => {
                const caso = casos.find(c => c._id === plan.caso);
                const resuelto = caso ? resolveCaso(caso) : null;
                const q = getQuirofanoById(plan.quirofano);
                return (
                  <div key={plan._id} className="px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
                    <div className="text-center w-14 flex-shrink-0">
                      <p className="text-xs font-bold text-blue-600">{plan.horaInicio}</p>
                      <p className="text-xs text-slate-400">{plan.horaFinEstimada}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {resuelto?.pacienteObj?.nombre || 'Paciente'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {resuelto?.procedimientoObj?.nombre} · {q?.numero}
                      </p>
                    </div>
                    <EstadoBadge estado={caso?.estado} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergencias activas */}
          <div className="card">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
              <h2 className="section-title text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
                Emergencias Activas
              </h2>
              <Link href="/casos?tipo=emergencia" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {casosUrgentes.length === 0 && (
                <p className="text-xs sm:text-sm text-slate-400 p-4 sm:p-5 text-center">Sin emergencias activas.</p>
              )}
              {casosUrgentes.map(c => {
                const r = resolveCaso(c);
                return (
                  <Link href={`/casos/${c._id}`} key={c._id} className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={16} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.pacienteObj?.nombre}</p>
                      <p className="text-xs text-slate-500 truncate">{c.motivoEmergencia}</p>
                    </div>
                    <EstadoBadge estado={c.estado} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent cases */}
        <div className="card">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
            <h2 className="section-title text-sm sm:text-base">Casos Recientes</h2>
            <Link href="/casos" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4">Paciente</th>
                  <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4 hidden md:table-cell">Tipo</th>
                  <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4 hidden lg:table-cell">Procedimiento</th>
                  <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4 hidden xl:table-cell">Especialista</th>
                  <th className="table-header text-[10px] sm:text-xs px-2 sm:px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {casos.slice(0, 6).map(c => {
                  const r = resolveCaso(c);
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">{r.pacienteObj?.nombre}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden md:table-cell"><TipoBadge tipo={c.tipo} /></td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-500 truncate max-w-[150px] hidden lg:table-cell">{r.procedimientoObj?.nombre}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-500 truncate max-w-[120px] hidden xl:table-cell">{r.especialistaObj?.nombre}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"><EstadoBadge estado={c.estado} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
