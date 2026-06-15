'use client';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

export const TIPOS_ESPACIO = {
  quirofano:    { label: 'Quirófano',     fill: '#3b82f6', fillSoft: '#dbeafe', stroke: '#1d4ed8', text: '#1e3a8a' },
  recuperacion: { label: 'Recuperación',  fill: '#10b981', fillSoft: '#d1fae5', stroke: '#047857', text: '#064e3b' },
  consultorio:  { label: 'Consultorio',   fill: '#06b6d4', fillSoft: '#cffafe', stroke: '#0e7490', text: '#164e63' },
  esterilizacion: { label: 'Esterilización', fill: '#a855f7', fillSoft: '#f3e8ff', stroke: '#7e22ce', text: '#581c87' },
  bodega:       { label: 'Bodega',        fill: '#94a3b8', fillSoft: '#e2e8f0', stroke: '#475569', text: '#1e293b' },
  oficina:      { label: 'Oficina',       fill: '#f59e0b', fillSoft: '#fef3c7', stroke: '#b45309', text: '#78350f' },
  sala_espera:  { label: 'Sala de Espera', fill: '#ec4899', fillSoft: '#fce7f3', stroke: '#be185d', text: '#831843' },
  jefatura:     { label: 'Jefatura',      fill: '#f97316', fillSoft: '#ffedd5', stroke: '#c2410c', text: '#7c2d12' },
  pasillo:      { label: 'Pasillo',       fill: '#cbd5e1', fillSoft: '#f1f5f9', stroke: '#64748b', text: '#334155' },
  bano:         { label: 'Baño',          fill: '#a3a3a3', fillSoft: '#e5e5e5', stroke: '#525252', text: '#262626' },
  otro:         { label: 'Otro',          fill: '#64748b', fillSoft: '#e2e8f0', stroke: '#334155', text: '#1e293b' },
};

const VIEW_W = 1000;
const VIEW_H = 600;
const SNAP_SIZE = 2;

function countReqsPendientes(e) {
  return (e.requerimientos || []).filter(r => r.estado !== 'resuelto').length;
}

function snapToGrid(val) {
  return Math.round(val / SNAP_SIZE) * SNAP_SIZE;
}

export default function BocetoPisoTouch({
  piso,
  espacios = [],
  selectedId,
  onSelect,
  onMove,
  readOnly = false,
  landscapeMode = false
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const [lastTouchDist, setLastTouchDist] = useState(null);
  const [lastTouchCenter, setLastTouchCenter] = useState(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const espaciosDelPiso = useMemo(
    () => espacios.filter(e => (e.pisoId?._id || e.pisoId) === piso?._id),
    [espacios, piso]
  );

  const selectedEspacio = useMemo(
    () => espaciosDelPiso.find(e => e._id === selectedId),
    [espaciosDelPiso, selectedId]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!piso) return null;

  let svgStyle = {};
  if (landscapeMode) {
    const availW = containerSize.w > 0 ? containerSize.w : 360;
    const availH = containerSize.h > 0 ? containerSize.h : 400;
    const scale = Math.min(availW / VIEW_W, availH / VIEW_H) * 0.95;
    const svgW = VIEW_W * scale;
    const svgH = VIEW_H * scale;
    svgStyle = {
      width: `${svgW}px`,
      height: `${svgH}px`,
      maxWidth: '100%',
      maxHeight: '100%',
      transform: `scale(${transform.scale}) translate(${transform.tx * VIEW_W}px, ${transform.ty * VIEW_H}px)`,
      transformOrigin: 'center center'
    };
  } else {
    const availW = containerSize.w > 0 ? containerSize.w : 360;
    const availH = containerSize.h > 0 ? containerSize.h : 640;
    const svgAspect = VIEW_W / VIEW_H;
    const minByWidth = availW * svgAspect <= availH;
    let renderW, renderH;
    if (minByWidth) {
      renderH = availW;
      renderW = availW * svgAspect;
    } else {
      renderH = availH / svgAspect;
      renderW = availH;
    }
    svgStyle = {
      width: `${renderW}px`,
      height: `${renderH}px`,
      maxWidth: '100%',
      maxHeight: '100%',
      transform: `rotate(90deg) scale(${transform.scale}) translate(${transform.ty * VIEW_H}px, ${transform.tx * VIEW_W}px)`,
      transformOrigin: 'center center'
    };
  }

  const effectiveVW = VIEW_W;
  const effectiveVH = VIEW_H;

  const selectedCoords = selectedEspacio?.coordenadas || { x: 40, y: 30, w: 20, h: 20 };
  const selX = (selectedCoords.x / 100) * effectiveVW;
  const selY = (selectedCoords.y / 100) * effectiveVH;
  const selW = (selectedCoords.w / 100) * effectiveVW;
  const selH = (selectedCoords.h / 100) * effectiveVH;

  const btnSize = 32;
  const halfBtn = btnSize / 2;

  const adjustCoord = useCallback((key, delta) => {
    if (!selectedEspacio || !onMove) return;
    const newVal = Math.max(0, Math.min(100, (selectedCoords[key] ?? 0) + delta));
    onMove(selectedEspacio._id, { ...selectedCoords, [key]: newVal });
  }, [selectedEspacio, onMove, selectedCoords]);

  const getSvgPoint = useCallback((clientX, clientY) => {
    if (!svgRef.current) return { x: clientX, y: clientY };
    try {
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return { x: clientX, y: clientY };
      const point = svgRef.current.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      const svgPoint = point.matrixTransform(ctm.inverse());
      return { x: svgPoint.x, y: svgPoint.y };
    } catch (err) {
      return { x: clientX, y: clientY };
    }
  }, []);

  const handlePointerDown = useCallback((e, isResize = false, resizeKey = null) => {
    if (readOnly) return;
    e.stopPropagation();
    if (isResize) {
      setResizing({ key: resizeKey });
    } else {
      const startSvg = getSvgPoint(e.clientX, e.clientY);
      setDragging({ startX: e.clientX, startY: e.clientY, startSvgX: startSvg.x, startSvgY: startSvg.y, origX: selectedCoords.x, origY: selectedCoords.y });
    }
  }, [readOnly, selectedCoords, getSvgPoint]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging && !resizing) return;
    e.preventDefault();

    if (dragging) {
      if (!selectedEspacio) return;
      const currentSvg = getSvgPoint(e.clientX, e.clientY);
      if (!svgRef.current) return;

      const dx = currentSvg.x - dragging.startSvgX;
      const dy = currentSvg.y - dragging.startSvgY;

      let newX = dragging.origX + (dx / effectiveVW) * 100;
      let newY = dragging.origY + (dy / effectiveVH) * 100;

      newX = snapToGrid(Math.max(0, Math.min(100 - selectedCoords.w, newX)));
      newY = snapToGrid(Math.max(0, Math.min(100 - selectedCoords.h, newY)));

      onMove(selectedEspacio._id, { ...selectedCoords, x: newX, y: newY });
    }

    if (resizing) {
      if (!selectedEspacio) return;
      const { x, y } = getSvgPoint(e.clientX, e.clientY);
      if (!svgRef.current) return;

      let newValX = (x / effectiveVW) * 100;
      let newValY = (y / effectiveVH) * 100;

      if (resizing.key === 'w') {
        const newW = Math.max(5, Math.min(100 - selectedCoords.x, snapToGrid(newValX)));
        onMove(selectedEspacio._id, { ...selectedCoords, w: newW });
      } else if (resizing.key === 'h') {
        const newH = Math.max(5, Math.min(100 - selectedCoords.y, snapToGrid(newValY)));
        onMove(selectedEspacio._id, { ...selectedCoords, h: newH });
      } else if (resizing.key === 'x') {
        const newX = Math.max(0, Math.min(100 - selectedCoords.w, snapToGrid(newValX)));
        onMove(selectedEspacio._id, { ...selectedCoords, x: newX });
      } else if (resizing.key === 'y') {
        const newY = Math.max(0, Math.min(100 - selectedCoords.h, snapToGrid(newValY)));
        onMove(selectedEspacio._id, { ...selectedCoords, y: newY });
      }
    }
  }, [dragging, resizing, selectedCoords, selectedEspacio, onMove, getSvgPoint]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setLastTouchDist(dist);
      setLastTouchCenter({ x: centerX, y: centerY });
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDist !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      const scaleChange = dist / lastTouchDist;
      const newScale = Math.max(0.5, Math.min(3, transform.scale * scaleChange));

      const dx = centerX - lastTouchCenter.x;
      const dy = centerY - lastTouchCenter.y;

      setTransform(prev => ({
        scale: newScale,
        tx: prev.tx + dx / window.innerWidth,
        ty: prev.ty + dy / window.innerHeight
      }));

      setLastTouchDist(dist);
      setLastTouchCenter({ x: centerX, y: centerY });
    }
  }, [lastTouchDist, lastTouchCenter, transform.scale]);

  const handleTouchEnd = useCallback(() => {
    setLastTouchDist(null);
    setLastTouchCenter(null);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white overflow-hidden touch-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${effectiveVW} ${effectiveVH}`}
        className="block"
        style={svgStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <defs>
          <pattern id="grid-touch" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <filter id="shadow-touch" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        <rect x="0" y="0" width={effectiveVW} height={effectiveVH}
              fill="white" stroke="#cbd5e1" strokeWidth="2" filter="url(#shadow-touch)" />
        <rect x="0" y="0" width={effectiveVW} height={effectiveVH}
              fill="url(#grid-touch)" />

        <text x="30" y="40" fontSize="16" fontWeight="700" fill="#0f172a">
          {piso.nombre}
        </text>
        {piso.descripcion && (
          <text x="30" y="58" fontSize="11" fill="#64748b">
            {piso.descripcion.slice(0, 80)}
          </text>
        )}

        {espaciosDelPiso.map(e => {
          const c = e.coordenadas || { x: 5, y: 5, w: 10, h: 10 };
          const tipo = TIPOS_ESPACIO[e.tipo] || TIPOS_ESPACIO.otro;
          const isSel = e._id === selectedId;
          const isHov = e._id === hovered;
          const isDragging = isSel && dragging;
          const reqsPend = countReqsPendientes(e);
          const w = (c.w / 100) * effectiveVW;
          const h = (c.h / 100) * effectiveVH;
          const x = (c.x / 100) * effectiveVW;
          const y = (c.y / 100) * effectiveVH;
          const fillOpacity = isSel ? (isDragging ? 0.9 : 0.85) : isHov ? 0.75 : 0.55;
          const strokeW = isSel ? 3 : isHov ? 2.5 : 1.5;

          return (
            <g
              key={e._id}
              onMouseEnter={() => setHovered(e._id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect && onSelect(e)}
              onPointerDown={(ev) => !readOnly && handlePointerDown(ev)}
              className={readOnly ? 'cursor-pointer' : 'cursor-grab'}
              style={{
                transition: isDragging ? 'none' : 'all 200ms ease-out',
                filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
              }}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx="4"
                fill={tipo.fill}
                fillOpacity={fillOpacity}
                stroke={isSel ? '#0f172a' : tipo.stroke}
                strokeWidth={strokeW}
              />

              {w > 60 && h > 24 && (
                <>
                  <text x={x + 6} y={y + 16} fontSize="10" fontWeight="700" fill={tipo.text} style={{ pointerEvents: 'none' }}>
                    {e.codigo}
                  </text>
                  <text x={x + 6} y={y + 28} fontSize="9" fill={tipo.text} style={{ pointerEvents: 'none' }}>
                    {e.nombre.length > w / 5 ? e.nombre.slice(0, Math.max(6, Math.floor(w / 5))) + '…' : e.nombre}
                  </text>
                </>
              )}

              {reqsPend > 0 && (
                <g style={{ pointerEvents: 'none' }}>
                  <circle cx={x + w - 8} cy={y + 8} r="4" fill="#ef4444" />
                  <text x={x + w - 8} y={y + 11} fontSize="7" fontWeight="700" textAnchor="middle" fill="white">
                    {reqsPend}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {selectedEspacio && onMove && !readOnly && !landscapeMode && (
          <g>
            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'x')} className="cursor-pointer">
              <rect x={selX - btnSize - 4} y={selY + selH / 2 - halfBtn} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <text x={selX - btnSize / 2 - 4} y={selY + selH / 2 + 6} fontSize="20" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>◀</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'x')} className="cursor-pointer">
              <rect x={selX + selW + 4} y={selY + selH / 2 - halfBtn} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <text x={selX + selW + btnSize / 2 + 4} y={selY + selH / 2 + 6} fontSize="20" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>▶</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'y')} className="cursor-pointer">
              <rect x={selX + selW / 2 - halfBtn} y={selY - btnSize - 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <text x={selX + selW / 2} y={selY - btnSize / 2 + 6} fontSize="20" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>▲</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'y')} className="cursor-pointer">
              <rect x={selX + selW / 2 - halfBtn} y={selY + selH + 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <text x={selX + selW / 2} y={selY + selH + btnSize + 8} fontSize="20" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>▼</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'w')} className="cursor-pointer">
              <rect x={selX - btnSize - 4} y={selY - btnSize - 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="3" />
              <text x={selX - btnSize / 2 - 4} y={selY - btnSize / 2 + 6} fontSize="16" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>◀</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'w')} className="cursor-pointer">
              <rect x={selX + selW + 4} y={selY - btnSize - 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="3" />
              <text x={selX + selW + btnSize / 2 + 4} y={selY - btnSize / 2 + 6} fontSize="16" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>▶</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'h')} className="cursor-pointer">
              <rect x={selX - btnSize - 4} y={selY + selH + 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="3" />
              <text x={selX - btnSize / 2 - 4} y={selY + selH + btnSize + 8} fontSize="16" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>▲</text>
            </g>

            <g onPointerDown={(ev) => handlePointerDown(ev, true, 'h')} className="cursor-pointer">
              <rect x={selX + selW + 4} y={selY + selH + 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="3" />
              <text x={selX + selW + btnSize / 2 + 4} y={selY + selH + btnSize + 8} fontSize="16" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>▼</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
