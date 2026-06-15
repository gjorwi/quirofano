'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import BocetoPisoTouch from './BocetoPisoTouch';
import { useDeviceType } from '@/hooks/useDeviceType';
import { X, Pencil, Maximize2 } from 'lucide-react';

export default function VisualizationModal({
  piso,
  espacios,
  onClose,
  onEdit
}) {
  const { deviceType, orientation } = useDeviceType();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPortrait, setIsPortrait] = useState(orientation === 'portrait');
  const handleRef = useRef(null);

  useEffect(() => {
    setIsPortrait(orientation === 'portrait');
  }, [orientation]);

  const handlePointerDown = useCallback((e) => {
    setIsDraggingHandle(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingHandle) return;
    const isVerticalAxis = isPortrait;
    const delta = isVerticalAxis
      ? e.clientY - dragStart.y
      : e.clientX - dragStart.x;
    if (Math.abs(delta) > 50) {
      setSideMenuOpen(delta > 0);
      setIsDraggingHandle(false);
    }
  }, [isDraggingHandle, dragStart, isPortrait]);

  const handlePointerUp = useCallback(() => {
    setIsDraggingHandle(false);
  }, []);

  useEffect(() => {
    if (isDraggingHandle) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDraggingHandle, handlePointerMove, handlePointerUp]);

  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
  const useLandscapeMode = isMobileOrTablet && isPortrait;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Maximize2 size={20} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Visualización</h2>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              <Pencil size={16} />
              Editar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {useLandscapeMode ? (
          <>
            <div
              className="fixed left-0 right-0 bottom-0 z-50"
              style={{ pointerEvents: 'none' }}
            >
              <div
                ref={handleRef}
                onPointerDown={handlePointerDown}
                className="bg-white rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.15)] flex justify-center pt-2 pb-2 cursor-grab active:cursor-grabbing mx-auto w-32"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
              </div>
            </div>

            <div
              className={`fixed left-0 right-0 bottom-8 z-40 transition-transform duration-300 flex flex-col ${
                sideMenuOpen ? 'translate-y-0' : 'translate-y-full'
              }`}
              style={{ maxHeight: '70vh' }}
            >

              <div className="bg-white shadow-xl flex-1 flex flex-col">
              <div className="px-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Información</h3>
                <p className="text-xs text-slate-500 mt-0.5">Vista solo lectura</p>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-slate-900">{piso?.nombre}</p>
                  {piso?.descripcion && (
                    <p className="text-xs text-slate-500 mt-1">{piso.descripcion}</p>
                  )}
                </div>

                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-emerald-700">
                    {espacios?.length || 0} espacios
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    Usa pinch-to-zoom para ver mejor los detalles
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <X size={18} />
                  Cerrar
                </button>
              </div>
              </div>
            </div>

            <div className="flex-1 p-2">
              <div className="h-full w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <BocetoPisoTouch
                  piso={piso}
                  espacios={espacios}
                  selectedId={null}
                  onSelect={() => {}}
                  readOnly={true}
                  landscapeMode={useLandscapeMode}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              ref={handleRef}
              onPointerDown={handlePointerDown}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 w-8 h-20 bg-white rounded-r-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-300 ${
                sideMenuOpen ? 'translate-x-[240px]' : 'translate-x-0'
              }`}
              style={{ left: sideMenuOpen ? 240 : 0 }}
            >
              <div className="w-1.5 h-10 bg-slate-300 rounded-full" />
            </div>

            <div
              className={`fixed left-0 top-0 h-full w-60 bg-white shadow-xl z-40 transition-transform duration-300 flex flex-col ${
                sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Información</h3>
                <p className="text-xs text-slate-500 mt-1">Vista solo lectura</p>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-slate-900">{piso?.nombre}</p>
                  {piso?.descripcion && (
                    <p className="text-xs text-slate-500 mt-1">{piso.descripcion}</p>
                  )}
                </div>

                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-emerald-700">
                    {espacios?.length || 0} espacios
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    Usa pinch-to-zoom para ver mejor los detalles
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <X size={18} />
                  Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <BocetoPisoTouch
                  piso={piso}
                  espacios={espacios}
                  selectedId={null}
                  onSelect={() => {}}
                  readOnly={true}
                  landscapeMode={false}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
