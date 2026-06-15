'use client';
import { useState, useMemo } from 'react';

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

function countReqsPendientes(e) {
  return (e.requerimientos || []).filter(r => r.estado !== 'resuelto').length;
}

export default function BocetoPiso({ piso, espacios = [], selectedId, onSelect, onMove, editandoPosicion }) {
  const [hovered, setHovered] = useState(null);

  const espaciosDelPiso = useMemo(
    () => espacios.filter(e => (e.pisoId?._id || e.pisoId) === piso?._id),
    [espacios, piso]
  );

  const selectedEspacio = useMemo(
    () => espaciosDelPiso.find(e => e._id === selectedId),
    [espaciosDelPiso, selectedId]
  );

  if (!piso) return null;

  const selectedCoords = selectedEspacio?.coordenadas || { x: 40, y: 30, w: 20, h: 20 };
  const selX = (selectedCoords.x / 100) * VIEW_W;
  const selY = (selectedCoords.y / 100) * VIEW_H;
  const selW = (selectedCoords.w / 100) * VIEW_W;
  const selH = (selectedCoords.h / 100) * VIEW_H;

  const btnSize = 24;
  const halfBtn = btnSize / 2;

  const adjustCoord = (key, delta) => {
    if (!selectedEspacio || !onMove) return;
    const newVal = Math.max(0, Math.min(100, (selectedCoords[key] ?? 0) + delta));
    onMove(selectedEspacio._id, { ...selectedCoords, [key]: newVal });
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 overflow-hidden">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto block"
        style={{ aspectRatio: `${VIEW_W}/${VIEW_H}` }}
      >
        <defs>
          <pattern id="grid-cedula" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <filter id="shadow-cedula" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        <rect x="10" y="10" width={VIEW_W - 20} height={VIEW_H - 20}
              fill="white" stroke="#cbd5e1" strokeWidth="2" rx="8" filter="url(#shadow-cedula)" />
        <rect x="10" y="10" width={VIEW_W - 20} height={VIEW_H - 20}
              fill="url(#grid-cedula)" rx="8" />

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
          const reqsPend = countReqsPendientes(e);
          const w = (c.w / 100) * VIEW_W;
          const h = (c.h / 100) * VIEW_H;
          const x = (c.x / 100) * VIEW_W;
          const y = (c.y / 100) * VIEW_H;
          const fillOpacity = isSel ? 0.85 : isHov ? 0.75 : 0.55;
          const strokeW = isSel ? 3 : isHov ? 2.5 : 1.5;

          return (
            <g
              key={e._id}
              onMouseEnter={() => setHovered(e._id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect && onSelect(e)}
              className="cursor-pointer"
              style={{ transition: 'all 200ms ease-out' }}
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
                style={{ transition: 'fill-opacity 200ms ease-out, stroke-width 200ms ease-out' }}
              />

              {w > 60 && h > 24 && (
                <>
                  <text
                    x={x + 6}
                    y={y + 16}
                    fontSize="10"
                    fontWeight="700"
                    fill={tipo.text}
                    style={{ pointerEvents: 'none' }}
                  >
                    {e.codigo}
                  </text>
                  <text
                    x={x + 6}
                    y={y + 28}
                    fontSize="9"
                    fill={tipo.text}
                    style={{ pointerEvents: 'none' }}
                  >
                    {e.nombre.length > w / 5 ? e.nombre.slice(0, Math.max(6, Math.floor(w / 5))) + '…' : e.nombre}
                  </text>
                </>
              )}

              {reqsPend > 0 && (
                <g style={{ pointerEvents: 'none' }}>
                  <circle
                    cx={x + w - 8}
                    cy={y + 8}
                    r="4"
                    fill="#ef4444"
                    className="cedula-alert"
                  />
                  <text
                    x={x + w - 8}
                    y={y + 11}
                    fontSize="7"
                    fontWeight="700"
                    textAnchor="middle"
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {reqsPend}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {selectedEspacio && onMove && editandoPosicion && (
          <g>
            {/* X- (mover izquierda) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('x', -5); }}
              className="cursor-pointer"
            >
              <rect x={selX - btnSize - 4} y={selY + selH / 2 - halfBtn} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text x={selX - btnSize / 2 - 4} y={selY + selH / 2 + 5} fontSize="16" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>◀</text>
            </g>

            {/* X+ (mover derecha) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('x', 5); }}
              className="cursor-pointer"
            >
              <rect x={selX + selW + 4} y={selY + selH / 2 - halfBtn} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text x={selX + selW + btnSize / 2 + 4} y={selY + selH / 2 + 5} fontSize="16" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>▶</text>
            </g>

            {/* Y- (mover arriba) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('y', -5); }}
              className="cursor-pointer"
            >
              <rect x={selX + selW / 2 - halfBtn} y={selY - btnSize - 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text x={selX + selW / 2} y={selY - btnSize / 2 - 1} fontSize="16" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>▲</text>
            </g>

            {/* Y+ (mover abajo) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('y', 5); }}
              className="cursor-pointer"
            >
              <rect x={selX + selW / 2 - halfBtn} y={selY + selH + 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text x={selX + selW / 2} y={selY + selH + btnSize + 7} fontSize="16" textAnchor="middle" fill="#3b82f6" style={{ pointerEvents: 'none' }}>▼</text>
            </g>

            {/* W- (reducir ancho) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('w', -5); }}
              className="cursor-pointer"
            >
              <rect x={selX - btnSize - 4} y={selY - btnSize - 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
              <text x={selX - btnSize / 2 - 4} y={selY - btnSize / 2 - 1} fontSize="12" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>◀</text>
            </g>

            {/* W+ (aumentar ancho) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('w', 5); }}
              className="cursor-pointer"
            >
              <rect x={selX + selW + 4} y={selY - btnSize - 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
              <text x={selX + selW + btnSize / 2 + 4} y={selY - btnSize / 2 - 1} fontSize="12" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>▶</text>
            </g>

            {/* H- (reducir alto) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('h', -5); }}
              className="cursor-pointer"
            >
              <rect x={selX - btnSize - 4} y={selY + selH + 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
              <text x={selX - btnSize / 2 - 4} y={selY + selH + btnSize + 7} fontSize="12" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>▲</text>
            </g>

            {/* H+ (aumentar alto) */}
            <g
              onClick={(ev) => { ev.stopPropagation(); adjustCoord('h', 5); }}
              className="cursor-pointer"
            >
              <rect x={selX + selW + 4} y={selY + selH + 4} width={btnSize} height={btnSize} rx="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
              <text x={selX + selW + btnSize / 2 + 4} y={selY + selH + btnSize + 7} fontSize="12" textAnchor="middle" fill="#f59e0b" style={{ pointerEvents: 'none' }}>▼</text>
            </g>
          </g>
        )}

        {hovered && (() => {
          const e = espaciosDelPiso.find(x => x._id === hovered);
          if (!e) return null;
          const c = e.coordenadas || { x: 5, y: 5, w: 10, h: 10 };
          const tipo = TIPOS_ESPACIO[e.tipo] || TIPOS_ESPACIO.otro;
          const w = (c.w / 100) * VIEW_W;
          const h = (c.h / 100) * VIEW_H;
          const x = (c.x / 100) * VIEW_W;
          const y = (c.y / 100) * VIEW_H;
          const labelW = 180;
          const labelH = 56;
          let lx = x + w / 2 - labelW / 2;
          let ly = y - labelH - 8;
          if (ly < 20) ly = y + h + 8;
          if (lx < 10) lx = 10;
          if (lx + labelW > VIEW_W - 10) lx = VIEW_W - 10 - labelW;
          return (
            <g style={{ pointerEvents: 'none' }} className="cedula-tooltip">
              <rect x={lx} y={ly} width={labelW} height={labelH} rx="6" fill="#0f172a" fillOpacity="0.95" />
              <text x={lx + 10} y={ly + 18} fontSize="11" fontWeight="700" fill="white">
                {e.nombre}
              </text>
              <text x={lx + 10} y={ly + 33} fontSize="9" fill="#cbd5e1">
                {tipo.label} · {e.codigo}
              </text>
              <text x={lx + 10} y={ly + 48} fontSize="9" fill="#cbd5e1">
                {e.areaM2 ? `${e.areaM2} m² · ` : ''}{e.estado}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
