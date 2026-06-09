'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, X, CalendarDays, FileText, Clock, BookOpen, Loader2 } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/components/AppProvider';

function BaremoDetailModal({ baremo, onClose }) {
  if (!baremo) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Detalle del Baremo</h2>
              <p className="text-blue-100 text-xs">CIE-10</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white/80">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><BookOpen size={12} /> Capítulo</p>
              <p className="text-sm font-semibold text-slate-700 leading-tight">{baremo.capitulo}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FileText size={12} /> Código</p>
              <span className="inline-block bg-slate-800 text-white text-sm font-bold px-3 py-1 rounded-lg">
                {baremo.codigo}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-blue-500 mb-1 font-medium">Diagnóstico General</p>
            <p className="text-base font-semibold text-blue-900">{baremo.diagnosticoGeneral}</p>
          </div>

          {baremo.diagnosticoEspecifica && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-orange-500 mb-1 font-medium">Diagnóstico Específico</p>
              <p className="text-base font-semibold text-orange-900">{baremo.diagnosticoEspecifica}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
              <p className="text-xs text-emerald-600 mb-1 flex items-center justify-center gap-1"><Clock size={12} /> Días Reposo General</p>
              <p className="text-3xl font-bold text-emerald-700">{baremo.diasReposoGeneral}</p>
              <p className="text-xs text-emerald-500">días máximos</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-center">
              <p className="text-xs text-amber-600 mb-1 flex items-center justify-center gap-1"><Clock size={12} /> Días Reposo Específico</p>
              <p className="text-3xl font-bold text-amber-700">{baremo.diasReposoEspecifica}</p>
              <p className="text-xs text-amber-500">días máximos</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1"><CalendarDays size={12} /> Descansos recomendados (máx. 21 días c/u)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-2">General — {baremo.diasReposoGeneral} días</p>
                {baremo.diasReposoGeneral > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const reposos = [];
                      let remaining = baremo.diasReposoGeneral;
                      while (remaining > 0) {
                        const days = Math.min(remaining, 21);
                        reposos.push(days);
                        remaining -= days;
                      }
                      return reposos.map((d, i) => (
                        <span key={i} className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                          {d}d
                        </span>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin reposo</p>
                )}
                <p className="text-xs text-slate-400 mt-1">{Math.ceil(baremo.diasReposoGeneral / 21)} descanso(s)</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Específico — {baremo.diasReposoEspecifica} días</p>
                {baremo.diasReposoEspecifica > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const reposos = [];
                      let remaining = baremo.diasReposoEspecifica;
                      while (remaining > 0) {
                        const days = Math.min(remaining, 21);
                        reposos.push(days);
                        remaining -= days;
                      }
                      return reposos.map((d, i) => (
                        <span key={i} className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">
                          {d}d
                        </span>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin reposo</p>
                )}
                <p className="text-xs text-slate-400 mt-1">{Math.ceil(baremo.diasReposoEspecifica / 21)} descanso(s)</p>
              </div>
            </div>
          </div>

          {baremo.observaciones && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1 font-medium">Observaciones</p>
              <p className="text-sm text-slate-600 italic">{baremo.observaciones}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function BaremoModal({ baremo, onClose, onSave }) {
  const [form, setForm] = useState({
    capitulo: '', codigo: '', diagnosticoGeneral: '',
    diagnosticoEspecifica: '', diasReposoGeneral: '',
    diasReposoEspecifica: '', observaciones: ''
  });
  const [saving, setSaving] = useState(false);

  const normalize = (s) => (s || '').replace(/\s+/g, ' ').replace(/,/g, '').replace(/\s*-\s*/g, ' - ').trim();

  useEffect(() => {
    if (baremo) {
      setForm({
        capitulo: normalize(baremo.capitulo),
        codigo: baremo.codigo || '',
        diagnosticoGeneral: baremo.diagnosticoGeneral || '',
        diagnosticoEspecifica: baremo.diagnosticoEspecifica || '',
        diasReposoGeneral: baremo.diasReposoGeneral ?? '',
        diasReposoEspecifica: baremo.diasReposoEspecifica ?? '',
        observaciones: baremo.observaciones || '',
      });
    } else {
      setForm({ capitulo: '', codigo: '', diagnosticoGeneral: '', diagnosticoEspecifica: '', diasReposoGeneral: '', diasReposoEspecifica: '', observaciones: '' });
    }
  }, [baremo]);

  const selectedCapitulo = normalize(baremo?.capitulo);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        diasReposoGeneral: Number(form.diasReposoGeneral) || 0,
        diasReposoEspecifica: Number(form.diasReposoEspecifica) || 0,
      };
      if (baremo?._id) {
        await api.actualizarBaremo(baremo._id, payload);
      } else {
        await api.crearBaremo(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-800">{baremo?._id ? 'Editar' : 'Nuevo'} Registro</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Capítulo *</label>
            <select
              value={selectedCapitulo}
              onChange={e => setForm(f => ({ ...f, capitulo: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar capítulo</option>
              <option value="I - CIERTAS ENFERMEDADES INFECCIOSAS Y PARASITARIAS">I - CIERTAS ENFERMEDADES INFECCIOSAS Y PARASITARIAS</option>
              <option value="II - NEOPLASIAS">II - NEOPLASIAS</option>
              <option value="III - ENFERMEDADES DE LA SANGRE">III - ENFERMEDADES DE LA SANGRE</option>
              <option value="IV - ENFERMEDADES ENDOCRINAS">IV - ENFERMEDADES ENDOCRINAS</option>
              <option value="V - TRASTORNOS MENTALES">V - TRASTORNOS MENTALES</option>
              <option value="VI - ENFERMEDADES DEL SISTEMA NERVIOSO">VI - ENFERMEDADES DEL SISTEMA NERVIOSO</option>
              <option value="VII - ENFERMEDADES DEL OJO Y SUS ANEXOS">VII - ENFERMEDADES DEL OJO Y SUS ANEXOS</option>
              <option value="VIII - ENFERMEDADES DEL OIDO">VIII - ENFERMEDADES DEL OIDO</option>
              <option value="IX - ENFERMEDADES DEL SISTEMA CIRCULATORIO">IX - ENFERMEDADES DEL SISTEMA CIRCULATORIO</option>
              <option value="X - ENFERMEDADES DEL SISTEMA RESPIRATORIO">X - ENFERMEDADES DEL SISTEMA RESPIRATORIO</option>
              <option value="XI - ENFERMEDADES DEL SISTEMA DIGESTIVO">XI - ENFERMEDADES DEL SISTEMA DIGESTIVO</option>
              <option value="XII - ENFERMEDADES DE LA PIEL">XII - ENFERMEDADES DE LA PIEL</option>
              <option value="XIII - ENFERMEDADES SISTEMA OSTEOMUSCULAR">XIII - ENFERMEDADES SISTEMA OSTEOMUSCULAR</option>
              <option value="XIV - ENFERMEDADES DEL SISTEMA GENITOURINARIO">XIV - ENFERMEDADES DEL SISTEMA GENITOURINARIO</option>
              <option value="XV - EMBARAZO PARTO Y PUERPERIO">XV - EMBARAZO PARTO Y PUERPERIO</option>
              <option value="XVII - MALFORMACIONES CONGENITAS">XVII - MALFORMACIONES CONGENITAS</option>
              <option value="XVIII - SINTOMAS Y ESTADOS MORBIDOS">XVIII - SINTOMAS Y ESTADOS MORBIDOS</option>
              <option value="XIX - LESIONES TRAUMA ENVENENAMIENTOS">XIX - LESIONES TRAUMA ENVENENAMIENTOS</option>
              <option value="XXI - FACTORES QUE INFLUYEN EN SALUD">XXI - FACTORES QUE INFLUYEN EN SALUD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Código (CIE-10) *</label>
            <input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Diagnóstico General</label>
            <input value={form.diagnosticoGeneral} onChange={e => setForm(f => ({ ...f, diagnosticoGeneral: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Diagnóstico Específica</label>
            <input value={form.diagnosticoEspecifica} onChange={e => setForm(f => ({ ...f, diagnosticoEspecifica: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Días Reposo General</label>
              <input type="number" value={form.diasReposoGeneral} onChange={e => setForm(f => ({ ...f, diasReposoGeneral: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Días Reposo Específica</label>
              <input type="number" value={form.diasReposoEspecifica} onChange={e => setForm(f => ({ ...f, diasReposoEspecifica: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <input value={form.observaciones || ''} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BaremoPage() {
  const { user } = useAuth();
  const [baremos, setBaremos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailBaremo, setDetailBaremo] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const isBaremoRole = ['especialista', 'administrador', 'directivo'].includes(user?.rol);

  const fetchBaremos = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 30 });
      if (query.trim()) params.set('buscar', query.trim());
      const data = await api.getBaremos(`?${params.toString()}`);
      if (append) {
        setBaremos(prev => [...prev, ...data.baremos]);
      } else {
        setBaremos(data.baremos);
      }
      setTotalPages(data.pages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query]);

  useEffect(() => {
    setPage(1);
    fetchBaremos(1, false);
  }, [query]);

  useEffect(() => {
    if (totalPages <= page) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          fetchBaremos(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [page, totalPages, loadingMore, loading, fetchBaremos]);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await api.eliminarBaremo(id);
      fetchBaremos(1, false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
            <CalendarDays className="text-blue-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Baremo de Días Máximos</h1>
          <p className="text-sm text-slate-500 mt-1">Incapacidad por diagnóstico CIE-10</p>
        </div>

        <div className="sticky top-0 z-10 bg-slate-50 pb-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por código, capítulo o diagnóstico..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            {isBaremoRole && (
              <button
                onClick={() => { setSelected(null); setShowModal(true); }}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                title="Nuevo Registro"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Cargando baremos...</p>
          </div>
        ) : baremos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {query ? `No se encontraron resultados para "${query}"` : 'Sin resultados'}
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            {baremos.map(b => (
              <div
                key={b._id ? `${b._id}_${baremos.indexOf(b)}` : `baremo_${baremos.indexOf(b)}`}
                onClick={() => setDetailBaremo(b)}
                className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="inline-block bg-slate-700 text-white text-xs font-semibold px-2 py-0.5 rounded">
                        {b.codigo}
                      </span>
                      {b.diasReposoGeneral > 0 && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                          G: {b.diasReposoGeneral}d
                        </span>
                      )}
                      {b.diasReposoEspecifica > 0 && (
                        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">
                          E: {b.diasReposoEspecifica}d
                        </span>
                      )}
                    </div>
                    {b.capitulo && (
                      <p className="text-xs text-slate-400 mb-0.5 truncate">{b.capitulo}</p>
                    )}
                    {b.diagnosticoGeneral && (
                      <p className="text-sm text-slate-600 leading-snug">{b.diagnosticoGeneral}</p>
                    )}
                    {b.diagnosticoEspecifica && (
                      <p className="text-sm text-slate-800 font-medium leading-snug">{b.diagnosticoEspecifica}</p>
                    )}
                    {b.observaciones && <p className="text-xs text-slate-400 mt-1 italic">{b.observaciones}</p>}
                  </div>
                  {isBaremoRole && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(b); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-xs"
                      >Editar</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(b._id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 text-xs"
                      >Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-4 text-slate-400 text-sm">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                Cargando más...
              </div>
            )}

            {page < totalPages && !loadingMore && (
              <div ref={loadMoreRef} className="h-4" />
            )}

            {!loadingMore && page >= totalPages && baremos.length > 0 && (
              <p className="text-center text-xs text-slate-400 py-4">
                Fin de resultados — {baremos.length} registros
              </p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <BaremoModal
          key={selected?._id || 'new'}
          baremo={selected}
          onClose={() => setShowModal(false)}
          onSave={() => fetchBaremos(1, false)}
        />
      )}

      {detailBaremo && (
        <BaremoDetailModal baremo={detailBaremo} onClose={() => setDetailBaremo(null)} />
      )}
    </div>
  );
}