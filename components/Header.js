export default function Header({ title, subtitle, actions }) {
  return (
    <div className="sticky top-0 z-10 bg-slate-100/80 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pl-16 lg:pl-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
