import Link from 'next/link';
import Header from '@/components/Header';
import { Users, Stethoscope, Building2, FlaskConical, FileSearch, Package, UserCog, ShieldAlert } from 'lucide-react';

const catalogs = [
  { href: '/configuracion/usuarios',      label: 'Usuarios',        desc: 'Gestión de usuarios del sistema',       icon: UserCog,      color: 'bg-indigo-500',  count: 9 },
  { href: '/configuracion/pacientes',     label: 'Pacientes',       desc: 'Gestión de pacientes registrados',      icon: Users,        color: 'bg-blue-500',    count: 8 },
  { href: '/configuracion/especialistas', label: 'Especialistas',   desc: 'Cirujanos y personal especializado',    icon: Stethoscope,  color: 'bg-purple-500',  count: 6 },
  { href: '/configuracion/quirofanos',    label: 'Quirófanos',      desc: 'Salas quirúrgicas y equipamiento',      icon: Building2,    color: 'bg-emerald-500', count: 4 },
  { href: '/configuracion/procedimientos',label: 'Procedimientos',  desc: 'Catálogo de procedimientos quirúrgicos',icon: FlaskConical, color: 'bg-orange-500',  count: 10 },
  { href: '/configuracion/diagnosticos',  label: 'Diagnósticos',    desc: 'Catálogo de diagnósticos CIE-10',       icon: FileSearch,   color: 'bg-red-500',     count: 10 },
  { href: '/configuracion/insumos',       label: 'Insumos',         desc: 'Materiales y suministros quirúrgicos',  icon: Package,      color: 'bg-teal-500',    count: 10 },
];

export default function ConfiguracionPage() {
  return (
    <div className="page-enter">
      <Header title="Configuración" subtitle="Administración de catálogos del sistema" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Catálogos */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Catálogos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {catalogs.map(({ href, label, desc, icon: Icon, color, count }) => (
              <Link key={href} href={href}>
                <div className="card p-6 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800">{label}</h3>
                        <span className="text-2xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors">{count}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Zona de peligro */}
        <section>
          <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-4">Zona de Peligro</h2>
          <Link href="/configuracion/reset">
            <div className="card p-6 border-2 border-red-100 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="bg-red-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldAlert size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800">Reset de Datos</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Irreversible</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Eliminar colecciones completas del sistema. Requiere confirmación por texto.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
