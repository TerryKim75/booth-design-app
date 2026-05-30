import { useRef, useState } from 'react';
import type { BoothConfig, ElementPositions, Pos } from '../types/booth';
import { getWallConfig, ELEM_SIZE } from '../types/booth';

interface Props {
  config: BoothConfig;
  positions: ElementPositions;
  onPositionsChange?: (pos: ElementPositions) => void;
}

const SCALE = 60;
const PAD = 40;

export default function BoothCanvas({ config, positions, onPositionsChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    type: string; index: number; offX: number; offY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!config.size) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl text-gray-400 text-sm">
        부스 크기를 선택하면 미리보기가 표시됩니다
      </div>
    );
  }

  const { size, elements } = config;
  const walls = getWallConfig(config.openFaces);
  const W = size.width * SCALE;
  const D = size.depth * SCALE;
  const svgW = W + PAD * 2;
  const svgH = D + PAD * 2 + 36;
  const wt = 8; // wall thickness

  // Convert pointer client coords → SVG viewBox coords
  function ptrToSVG(e: React.PointerEvent | PointerEvent): { x: number; y: number } {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width)  * svgW,
      y: ((e.clientY - r.top)  / r.height) * svgH,
    };
  }

  // Clamp element top-left SVG position to booth bounds
  function clampToFloor(svgX: number, svgY: number, elW: number, elD: number): Pos {
    return {
      x: Math.max(0, Math.min(size.width  - elW, (svgX - PAD) / SCALE)),
      y: Math.max(0, Math.min(size.depth  - elD, (svgY - PAD) / SCALE)),
    };
  }

  function startDrag(
    e: React.PointerEvent,
    type: string, index: number,
    elemSVGX: number, elemSVGY: number,
  ) {
    if (!onPositionsChange) return;
    e.preventDefault();
    e.stopPropagation();
    const pt = ptrToSVG(e);
    dragRef.current = { type, index, offX: pt.x - elemSVGX, offY: pt.y - elemSVGY };
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !onPositionsChange) return;
    const { type, index, offX, offY } = dragRef.current;
    const pt = ptrToSVG(e);
    const rawX = pt.x - offX;
    const rawY = pt.y - offY;
    const upd: ElementPositions = { ...positions };

    if (type === 'table') {
      const p = clampToFloor(rawX, rawY, ELEM_SIZE.table.w, ELEM_SIZE.table.d);
      upd.tables = positions.tables.map((t, i) => i === index ? p : t);
    } else if (type === 'chair') {
      const p = clampToFloor(rawX, rawY, ELEM_SIZE.chair.w, ELEM_SIZE.chair.d);
      upd.chairs = positions.chairs.map((c, i) => i === index ? p : c);
    } else if (type === 'tv') {
      const p = clampToFloor(rawX, rawY, ELEM_SIZE.tv.w, ELEM_SIZE.tv.d);
      upd.tvs = positions.tvs.map((t, i) => i === index ? p : t);
    } else if (type === 'reception') {
      upd.reception = clampToFloor(rawX, rawY, ELEM_SIZE.reception.w, ELEM_SIZE.reception.d);
    } else if (type === 'storage') {
      upd.storage = clampToFloor(rawX, rawY, elements.storage.widthM, elements.storage.depthM);
    } else if (type === 'meetingRoom') {
      upd.meetingRoom = clampToFloor(rawX, rawY, elements.meetingRoom.widthM, elements.meetingRoom.depthM);
    }
    onPositionsChange(upd);
  }

  function handlePointerUp() {
    dragRef.current = null;
    setIsDragging(false);
  }

  const draggable = !!onPositionsChange;
  const grabStyle = (drag: boolean) => ({
    cursor: drag ? (isDragging ? 'grabbing' : 'grab') : 'default',
  });

  // Shorthand: meters → SVG coord
  const sx = (m: number) => PAD + m * SCALE;
  const sy = (m: number) => PAD + m * SCALE;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-xs text-gray-500 uppercase tracking-widest">평면도 (Top View)</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-h-72 rounded-xl shadow-md border border-gray-200 bg-white select-none"
        style={{ aspectRatio: `${svgW} / ${svgH}`, cursor: isDragging ? 'grabbing' : 'default' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Floor */}
        <rect x={PAD} y={PAD} width={W} height={D} fill="#f5f0e8" />

        {/* Walls & open indicators */}
        {(['back','left','right','front'] as const).map((side) => {
          const open = !walls[side];
          const lineProps = { stroke: '#4ade80', strokeWidth: 2, strokeDasharray: '7,5' };
          const wallFill = '#c8bfa8'; const wallStroke = '#8b7d6b';
          if (side === 'back')  return walls.back
            ? <rect key="wB" x={PAD}           y={PAD}           width={W}  height={wt} fill={wallFill} stroke={wallStroke} strokeWidth={1} />
            : <line key="wB" x1={PAD} y1={PAD}       x2={PAD+W} y2={PAD}       {...lineProps} />;
          if (side === 'left')  return walls.left
            ? <rect key="wL" x={PAD}           y={PAD}           width={wt} height={D}  fill={wallFill} stroke={wallStroke} strokeWidth={1} />
            : <line key="wL" x1={PAD} y1={PAD}       x2={PAD}   y2={PAD+D}     {...lineProps} />;
          if (side === 'right') return walls.right
            ? <rect key="wR" x={PAD+W-wt}      y={PAD}           width={wt} height={D}  fill={wallFill} stroke={wallStroke} strokeWidth={1} />
            : <line key="wR" x1={PAD+W} y1={PAD}     x2={PAD+W} y2={PAD+D}     {...lineProps} />;
          if (side === 'front') return walls.front
            ? <rect key="wF" x={PAD}           y={PAD+D-wt}      width={W}  height={wt} fill={wallFill} stroke={wallStroke} strokeWidth={1} />
            : <line key="wF" x1={PAD} y1={PAD+D}     x2={PAD+W} y2={PAD+D}     {...lineProps} />;
          return open ? null : null;
        })}

        {/* Open-face labels */}
        {!walls.front && <text x={PAD+W/2} y={PAD+D+14} textAnchor="middle" fontSize={9} fill="#16a34a">▼ 오픈</text>}
        {!walls.back  && <text x={PAD+W/2} y={PAD-4}    textAnchor="middle" fontSize={9} fill="#16a34a">▲ 오픈</text>}
        {!walls.left  && <text x={PAD-4}   y={PAD+D/2}  textAnchor="middle" fontSize={9} fill="#16a34a" transform={`rotate(-90,${PAD-4},${PAD+D/2})`}>◀ 오픈</text>}
        {!walls.right && <text x={PAD+W+4} y={PAD+D/2}  textAnchor="middle" fontSize={9} fill="#16a34a" transform={`rotate(90,${PAD+W+4},${PAD+D/2})`}>▶ 오픈</text>}

        {/* Graphic on back wall */}
        {elements.graphicCoverage !== 'none' && walls.back && (
          <rect
            x={PAD + (elements.graphicCoverage === 'partial' ? W * 0.2 : 0)}
            y={PAD}
            width={elements.graphicCoverage === 'partial' ? W * 0.6 : W}
            height={wt}
            fill="#4a90d9" opacity={0.7}
          />
        )}

        {/* Logo text */}
        {elements.logoText && (
          <text x={PAD+W/2} y={PAD-12} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#2563eb" letterSpacing={1}>
            {elements.logoText.toUpperCase()}
          </text>
        )}

        {/* Meeting room */}
        {elements.meetingRoom.enabled && (() => {
          const mx = sx(positions.meetingRoom.x);
          const my = sy(positions.meetingRoom.y);
          const mw = elements.meetingRoom.widthM * SCALE;
          const md = elements.meetingRoom.depthM * SCALE;
          return (
            <g key="meetingRoom" style={grabStyle(draggable)}
              onPointerDown={(e) => startDrag(e, 'meetingRoom', 0, mx, my)}>
              <rect x={mx} y={my} width={mw} height={md} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} rx={2} />
              <text x={mx+mw/2} y={my+md/2-6} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#1d4ed8">미팅룸</text>
              <text x={mx+mw/2} y={my+md/2+6} textAnchor="middle" fontSize={8} fill="#3b82f6">
                {elements.meetingRoom.widthM}W×{elements.meetingRoom.depthM}D×{elements.meetingRoom.heightM}Hm
              </text>
            </g>
          );
        })()}

        {/* Storage */}
        {elements.storage.enabled && (() => {
          const stx = sx(positions.storage.x);
          const sty = sy(positions.storage.y);
          const stw = elements.storage.widthM * SCALE;
          const std = elements.storage.depthM * SCALE;
          return (
            <g key="storage" style={grabStyle(draggable)}
              onPointerDown={(e) => startDrag(e, 'storage', 0, stx, sty)}>
              <rect x={stx} y={sty} width={stw} height={std} fill="#e5e0da" stroke="#9b8f83" strokeWidth={1.5} rx={2} />
              <text x={stx+stw/2} y={sty+std/2-6} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#5c5048">창고</text>
              <text x={stx+stw/2} y={sty+std/2+6} textAnchor="middle" fontSize={8} fill="#7c6c5c">
                {elements.storage.widthM}W×{elements.storage.depthM}D×{elements.storage.heightM}Hm
              </text>
            </g>
          );
        })()}

        {/* Reception */}
        {elements.hasReception && (() => {
          const rx2 = sx(positions.reception.x);
          const ry2 = sy(positions.reception.y);
          const rw = ELEM_SIZE.reception.w * SCALE;
          const rd = ELEM_SIZE.reception.d * SCALE;
          return (
            <g key="reception" style={grabStyle(draggable)}
              onPointerDown={(e) => startDrag(e, 'reception', 0, rx2, ry2)}>
              <rect x={rx2} y={ry2} width={rw} height={rd} fill="#fde68a" stroke="#ca8a04" strokeWidth={1.5} rx={2} />
              <text x={rx2+rw/2} y={ry2+rd/2+4} textAnchor="middle" fontSize={9} fill="#78350f">안내데스크</text>
            </g>
          );
        })()}

        {/* Tables */}
        {positions.tables.slice(0, elements.tableCount).map((t, i) => {
          const tx2 = sx(t.x); const ty2 = sy(t.y);
          const tw = ELEM_SIZE.table.w * SCALE; const td = ELEM_SIZE.table.d * SCALE;
          return (
            <g key={`table-${i}`} style={grabStyle(draggable)}
              onPointerDown={(e) => startDrag(e, 'table', i, tx2, ty2)}>
              <rect x={tx2} y={ty2} width={tw} height={td} rx={2} fill="#d4b896" stroke="#a08060" strokeWidth={1.5} />
              <text x={tx2+tw/2} y={ty2+td/2+4} textAnchor="middle" fontSize={8} fill="#5c3d1e">테이블</text>
            </g>
          );
        })}

        {/* Chairs */}
        {positions.chairs.slice(0, elements.chairCount).map((c, i) => {
          const cx2 = sx(c.x); const cy2 = sy(c.y);
          const cw = ELEM_SIZE.chair.w * SCALE; const cd = ELEM_SIZE.chair.d * SCALE;
          return (
            <g key={`chair-${i}`} style={grabStyle(draggable)}
              onPointerDown={(e) => startDrag(e, 'chair', i, cx2, cy2)}>
              <rect x={cx2} y={cy2} width={cw} height={cd} rx={3} fill="#a8c4e0" stroke="#6a9abd" strokeWidth={1} />
              <text x={cx2+cw/2} y={cy2+cd/2+4} textAnchor="middle" fontSize={7} fill="#2c5f7a">의자</text>
            </g>
          );
        })}

        {/* TVs */}
        {positions.tvs.slice(0, elements.tvCount).map((tv, i) => {
          const tvx2 = sx(tv.x); const tvy2 = sy(tv.y);
          const tvw = ELEM_SIZE.tv.w * SCALE; const tvd = Math.max(ELEM_SIZE.tv.d * SCALE, 12);
          return (
            <g key={`tv-${i}`} style={grabStyle(draggable)}
              onPointerDown={(e) => startDrag(e, 'tv', i, tvx2, tvy2)}>
              <rect x={tvx2} y={tvy2} width={tvw} height={tvd} rx={2} fill="#1f2937" stroke="#111827" strokeWidth={1} />
              <rect x={tvx2+2} y={tvy2+2} width={tvw-4} height={tvd-4} fill="#60a5fa" opacity={0.7} />
              <text x={tvx2+tvw/2} y={tvy2+tvd+10} textAnchor="middle" fontSize={8} fill="#374151">TV</text>
            </g>
          );
        })}

        {/* Dimension labels */}
        <text x={PAD+W/2} y={svgH-6} textAnchor="middle" fontSize={10} fill="#9ca3af">{size.width}m</text>
        <text x={10} y={PAD+D/2} textAnchor="middle" fontSize={10} fill="#9ca3af"
          transform={`rotate(-90, 10, ${PAD+D/2})`}>{size.depth}m</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
        {elements.tableCount > 0 && <LegendItem color="bg-amber-300" label={`테이블 ${elements.tableCount}개`} />}
        {elements.chairCount > 0 && <LegendItem color="bg-sky-300"   label={`의자 ${elements.chairCount}개`} />}
        {elements.tvCount > 0     && <LegendItem color="bg-blue-400"  label={`TV ${elements.tvCount}대`} />}
        {elements.hasReception    && <LegendItem color="bg-yellow-300" label="안내데스크" />}
        {elements.storage.enabled && <LegendItem color="bg-stone-300" label="창고" />}
        {elements.meetingRoom.enabled && <LegendItem color="bg-blue-200" label="미팅룸" />}
        {draggable && <span className="text-gray-400 ml-1">✦ 드래그로 위치 조정</span>}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded inline-block ${color}`} />
      {label}
    </span>
  );
}
