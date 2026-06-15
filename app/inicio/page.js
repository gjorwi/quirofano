'use client';
import Link from 'next/link';
import { useAuth } from '@/components/AppProvider';
import { Building2, Stethoscope, ArrowRight, Layers, BarChart3, ShieldCheck } from 'lucide-react';

export default function InicioPage() {
  const { user } = useAuth();

  const gestionQxHref = user?.rol === 'directivo' ? '/planes' : '/dashboard';

  const modulos = [
    {
      href: '/cedula-hospitalaria',
      title: 'Cédula Hospitalaria',
      desc: 'Inventario físico de la institución, logros y requerimientos por cada espacio, con planos interactivos por piso.',
      icon: Building2,
      grad: 'from-rose-500 to-rose-700',
      ring: 'ring-rose-200',
      shadow: 'shadow-rose-200/60',
      pills: ['Planos por piso', 'Logros', 'Requerimientos', 'Imprimir · Excel'],
    },
    {
      href: gestionQxHref,
      title: 'Gestión de Quirófano',
      desc: 'Sistema integral de control quirúrgico: casos, programación, admisión, horarios, estadísticas y baremos.',
      icon: Stethoscope,
      grad: 'from-blue-500 to-blue-700',
      ring: 'ring-blue-200',
      shadow: 'shadow-blue-200/60',
      pills: ['Casos', 'Plan Quirúrgico', 'Horarios', 'Estadísticas'],
    },
  ];

  const stats = [
    { label: 'Módulos disponibles', val: modulos.length, icon: Layers,         color: 'bg-slate-100 text-slate-700' },
    { label: 'Tu rol',              val: user?.rol,        icon: ShieldCheck,   color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="page-enter">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Hola, {user?.nombre?.split(' ')[0] || 'bienvenido'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Selecciona el módulo al que deseas ingresar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-5 md:col-span-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">SICAQ</p>
              <p className="text-sm text-slate-500">Sistema de Control y Administración Quirúrgica · Cédula Hospitalaria</p>
            </div>
          </div>
          {stats.map(s => (
            <div key={s.label} className="card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-900 capitalize">{s.val}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modulos.map(m => (
            <Link key={m.href} href={m.href}>
              <div className={`group card p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${m.shadow} border-0`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.grad} flex items-center justify-center flex-shrink-0 ring-4 ${m.ring} group-hover:scale-110 transition-transform`}>
                    <m.icon size={26} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{m.title}</h3>
                      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all text-slate-400">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{m.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {m.pills.map(p => (
                        <span key={p} className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Entrar
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
