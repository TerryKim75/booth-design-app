import type { BoothConfig } from '../types/booth';

interface Props {
  config: BoothConfig;
}

const SCALE = 60; // pixels per meter
const PADDING = 40;

export default function BoothCanvas({ config }: Props) {
  if (!config.size) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl text-gray-400 text-sm">
        부스 크기를 선택하면 미리보기가 표시됩니다
      </div>
    );
  }

  const { size, elements } = config;
  const W = size.width * SCALE;
  const D = size.depth * SCALE;
  const svgW = W + PADDING * 2;
  const svgH = D + PADDING * 2 + 40;

  const wallThickness = 8;
  const floorColor = '#f5f0e8';
  const wallColor = '#c8bfa8';
  const wallStroke = '#8b7d6b';

  // furniture positions (simple layout)
  const chairs: { x: number; y: number }[] = [];
  const tables: { x: number; y: number; w: number; h: number }[] = [];

  if (elements.tableCount > 0) {
    const tableW = 50;
    const tableH = 30;
    const startX = PADDING + 20;
    const startY = PADDING + D - 70;
    for (let i = 0; i < elements.tableCount && i < 4; i++) {
      tables.push({ x: startX + i * (tableW + 10), y: startY, w: tableW, h: tableH });
    }
  }

  if (elements.chairCount > 0) {
    const chairSize = 18;
    const startX = PADDING + 20;
    const startY = PADDING + D - 25;
    for (let i = 0; i < elements.chairCount && i < 8; i++) {
      chairs.push({ x: startX + i * (chairSize + 6), y: startY });
    }
  }

  const tvPositions: { x: number; y: number }[] = [];
  if (elements.tvCount > 0) {
    const tvW = 40;
    const spacing = W / (elements.tvCount + 1);
    for (let i = 0; i < elements.tvCount && i < 3; i++) {
      tvPositions.push({ x: PADDING + spacing * (i + 1) - tvW / 2, y: PADDING + wallThickness + 4 });
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-500 uppercase tracking-widest">평면도 (Top View)</p>
      <svg width={svgW} height={svgH} className="rounded-xl shadow-md border border-gray-200 bg-white">
        {/* floor */}
        <rect x={PADDING} y={PADDING} width={W} height={D} fill={floorColor} />

        {/* back wall */}
        {size.walls.back && (
          <rect x={PADDING} y={PADDING} width={W} height={wallThickness} fill={wallColor} stroke={wallStroke} strokeWidth={1} />
        )}
        {/* left wall */}
        {size.walls.left && (
          <rect x={PADDING} y={PADDING} width={wallThickness} height={D} fill={wallColor} stroke={wallStroke} strokeWidth={1} />
        )}
        {/* right wall */}
        {size.walls.right && (
          <rect x={PADDING + W - wallThickness} y={PADDING} width={wallThickness} height={D} fill={wallColor} stroke={wallStroke} strokeWidth={1} />
        )}
        {/* front wall (open front) */}
        {size.walls.front && (
          <rect x={PADDING} y={PADDING + D - wallThickness} width={W} height={wallThickness} fill={wallColor} stroke={wallStroke} strokeWidth={1} />
        )}

        {/* graphic panel on back wall */}
        {elements.graphicCoverage !== 'none' && (
          <rect
            x={PADDING + (elements.graphicCoverage === 'partial' ? W * 0.2 : 0)}
            y={PADDING}
            width={elements.graphicCoverage === 'partial' ? W * 0.6 : W}
            height={wallThickness}
            fill="#4a90d9"
            opacity={0.6}
          />
        )}

        {/* logo text on back wall */}
        {elements.logoText && (
          <text
            x={PADDING + W / 2}
            y={PADDING - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight="bold"
            fill="#2563eb"
            letterSpacing={1}
          >
            {elements.logoText.toUpperCase()}
          </text>
        )}

        {/* tables */}
        {tables.map((t, i) => (
          <g key={`table-${i}`}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={3} fill="#d4b896" stroke="#a08060" strokeWidth={1} />
            <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 4} textAnchor="middle" fontSize={8} fill="#5c3d1e">T</text>
          </g>
        ))}

        {/* chairs */}
        {chairs.map((c, i) => (
          <g key={`chair-${i}`}>
            <rect x={c.x} y={c.y} width={18} height={18} rx={3} fill="#a8c4e0" stroke="#6a9abd" strokeWidth={1} />
            <text x={c.x + 9} y={c.y + 12} textAnchor="middle" fontSize={8} fill="#2c5f7a">C</text>
          </g>
        ))}

        {/* TVs */}
        {tvPositions.map((tv, i) => (
          <g key={`tv-${i}`}>
            <rect x={tv.x} y={tv.y} width={40} height={10} rx={2} fill="#333" stroke="#111" strokeWidth={1} />
            <rect x={tv.x + 2} y={tv.y + 1} width={36} height={7} fill="#4a9eff" opacity={0.7} />
            <text x={tv.x + 20} y={tv.y + 22} textAnchor="middle" fontSize={8} fill="#333">TV</text>
          </g>
        ))}

        {/* reception desk */}
        {elements.hasReception && (
          <g>
            <rect x={PADDING + W - 80} y={PADDING + 20} width={60} height={20} rx={3} fill="#e8c85a" stroke="#c4a820" strokeWidth={1} />
            <text x={PADDING + W - 50} y={PADDING + 33} textAnchor="middle" fontSize={8} fill="#5a3e00">안내데스크</text>
          </g>
        )}

        {/* storage room */}
        {elements.hasStorageRoom && (
          <g>
            <rect x={PADDING + W - 50} y={PADDING + D - 55} width={42} height={42} fill="#d0c8c0" stroke="#8b7d6b" strokeWidth={1} />
            <text x={PADDING + W - 29} y={PADDING + D - 30} textAnchor="middle" fontSize={8} fill="#5c5048">창고</text>
          </g>
        )}

        {/* dimension labels */}
        <text x={PADDING + W / 2} y={svgH - 6} textAnchor="middle" fontSize={10} fill="#666">
          {size.width}m
        </text>
        <text
          x={8}
          y={PADDING + D / 2}
          textAnchor="middle"
          fontSize={10}
          fill="#666"
          transform={`rotate(-90, 8, ${PADDING + D / 2})`}
        >
          {size.depth}m
        </text>

        {/* open front indicator */}
        {!size.walls.front && (
          <>
            <line x1={PADDING} y1={PADDING + D} x2={PADDING + W} y2={PADDING + D} stroke="#4ade80" strokeWidth={2} strokeDasharray="6,4" />
            <text x={PADDING + W / 2} y={PADDING + D + 14} textAnchor="middle" fontSize={9} fill="#16a34a">개방</text>
          </>
        )}
      </svg>

      {/* legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
        {elements.tableCount > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block" />테이블 {elements.tableCount}개</span>}
        {elements.chairCount > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-300 inline-block" />의자 {elements.chairCount}개</span>}
        {elements.tvCount > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-700 inline-block" />TV {elements.tvCount}대</span>}
        {elements.hasReception && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" />안내데스크</span>}
        {elements.hasStorageRoom && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-stone-300 inline-block" />창고</span>}
        {elements.graphicCoverage !== 'none' && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block" />그래픽 ({elements.graphicCoverage === 'full' ? '전체' : '부분'})</span>}
      </div>
    </div>
  );
}
