'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import BocetoPisoTouch from './BocetoPisoTouch';
import { useDeviceType } from '@/hooks/useDeviceType';
import { X, Check, RotateCcw, Move } from 'lucide-react';

export default function PositionEditorModal({
  piso,
  espacio,
  espacios,
  onClose,
  onSave,
  onMove
}) {
  const { deviceType, orientation } = useDeviceType();
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(espacio?._id || null);
  const [currentCoords, setCurrentCoords] = useState(espacio?.coordenadas || null);
  const [isPortrait, setIsPortrait] = useState(orientation === 'portrait');
  const handleRef = useRef(null);

  useEffect(() => {
    if (espacio?.coordenadas) {
      setSelectedId(espacio._id);
      setCurrentCoords(espacio.coordenadas);
    }
  }, [espacio]);

  useEffect(() => {
    setIsPortrait(orientation === 'portrait');
  }, [orientation]);

  const selectedEspacio = espacios?.find(e => e._id === selectedId);

  const handleMove = useCallback((id, coords) => {
    setCurrentCoords(coords);
    setSelectedId(id);
    if (onMove) onMove(id, coords);
  }, [onMove]);

  const handleSelect = useCallback((e) => {
    setSelectedId(e._id);
    setCurrentCoords(e.coordenadas);
  }, []);

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

  const handleSave = () => {
    if (selectedId && currentCoords && onSave) {
      onSave(selectedId, currentCoords);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
  const useLandscapeMode = isMobileOrTablet && isPortrait;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Move size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Mover posición</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <X size={20} />
        </button>
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
                <h3 className="font-bold text-slate-900">Coordenadas</h3>
                <p className="text-xs text-slate-500 mt-0.5">Toca un espacio para editarlo</p>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {selectedEspacio && currentCoords ? (
                  <>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-slate-900">{selectedEspacio.nombre}</p>
                      <p className="text-xs text-slate-500">{selectedEspacio.codigo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">X</p>
                        <p className="text-lg font-bold text-slate-900">{currentCoords.x}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Y</p>
                        <p className="text-lg font-bold text-slate-900">{currentCoords.y}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-600 uppercase">Ancho</p>
                        <p className="text-lg font-bold text-amber-700">{currentCoords.w}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-600 uppercase">Alto</p>
                        <p className="text-lg font-bold text-amber-700">{currentCoords.h}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-700 font-semibold mb-2">Mover (azul)</p>
                      <div className="grid grid-cols-3 gap-1">
                        <div></div>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, y: Math.max(0, currentCoords.y - 2)}); }}
                          className="bg-blue-500 text-white rounded-lg py-3 text-xl font-bold active:bg-blue-600"
                        >
                          ▲
                        </button>
                        <div></div>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, x: Math.max(0, currentCoords.x - 2)}); }}
                          className="bg-blue-500 text-white rounded-lg py-3 text-xl font-bold active:bg-blue-600"
                        >
                          ◀
                        </button>
                        <div className="bg-blue-100 rounded-lg flex items-center justify-center text-xs text-blue-700 py-2">
                          Mover
                        </div>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, x: Math.min(100 - currentCoords.w, currentCoords.x + 2)}); }}
                          className="bg-blue-500 text-white rounded-lg py-3 text-xl font-bold active:bg-blue-600"
                        >
                          ▶
                        </button>
                        <div></div>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, y: Math.min(100 - currentCoords.h, currentCoords.y + 2)}); }}
                          className="bg-blue-500 text-white rounded-lg py-3 text-xl font-bold active:bg-blue-600"
                        >
                          ▼
                        </button>
                        <div></div>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-2">
                      <p className="text-xs text-amber-700 font-semibold mb-2">Tamaño (naranja)</p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, w: Math.max(2, currentCoords.w - 2)}); }}
                          className="bg-amber-500 text-white rounded-lg py-3 text-xl font-bold active:bg-amber-600"
                        >
                          -
                        </button>
                        <div className="bg-amber-100 rounded-lg flex items-center justify-center text-xs text-amber-700 py-2">
                          Ancho
                        </div>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, w: Math.min(100 - currentCoords.x, currentCoords.w + 2)}); }}
                          className="bg-amber-500 text-white rounded-lg py-3 text-xl font-bold active:bg-amber-600"
                        >
                          +
                        </button>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, h: Math.max(2, currentCoords.h - 2)}); }}
                          className="bg-amber-500 text-white rounded-lg py-3 text-xl font-bold active:bg-amber-600"
                        >
                          -
                        </button>
                        <div className="bg-amber-100 rounded-lg flex items-center justify-center text-xs text-amber-700 py-2">
                          Alto
                        </div>
                        <button
                          onPointerDown={(e) => { e.preventDefault(); handleMove(selectedId, {...currentCoords, h: Math.min(100 - currentCoords.y, currentCoords.h + 2)}); }}
                          className="bg-amber-500 text-white rounded-lg py-3 text-xl font-bold active:bg-amber-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      Toca un espacio en la cuadrícula para seleccionarlo y editarlo
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <Check size={18} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={18} />
                  Cancelar
                </button>
              </div>
              </div>
            </div>

            <div className="flex-1 p-2 pb-2">
              <div className="h-full w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <BocetoPisoTouch
                  piso={piso}
                  espacios={espacios}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onMove={handleMove}
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
                <h3 className="font-bold text-slate-900">Coordenadas</h3>
                <p className="text-xs text-slate-500 mt-1">Toca un espacio para editarlo</p>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {selectedEspacio && currentCoords ? (
                  <>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-slate-900">{selectedEspacio.nombre}</p>
                      <p className="text-xs text-slate-500">{selectedEspacio.codigo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">X</p>
                        <p className="text-xl font-bold text-slate-900">{currentCoords.x}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Y</p>
                        <p className="text-xl font-bold text-slate-900">{currentCoords.y}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-amber-600 uppercase">Ancho</p>
                        <p className="text-xl font-bold text-amber-700">{currentCoords.w}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-amber-600 uppercase">Alto</p>
                        <p className="text-xl font-bold text-amber-700">{currentCoords.h}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        <span className="font-semibold">Flechas azules:</span> Mover posición
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        <span className="font-semibold">Flechas naranjas:</span> Cambiar tamaño
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      Toca un espacio en la cuadrícula para seleccionarlo
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <Check size={18} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={18} />
                  Cancelar
                </button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <BocetoPisoTouch
                  piso={piso}
                  espacios={espacios}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onMove={handleMove}
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
