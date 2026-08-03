import { BOOTH_SIZES, type BoothSize, type OpenFaces, getWallConfig } from './types';

interface Props {
  selected: BoothSize | null;
  openFaces: OpenFaces;
  onSelect: (size: BoothSize) => void;
  onOpenFacesChange: (faces: OpenFaces) => void;
  onNext: () => void;
}

const OPEN_OPTIONS: { value: OpenFaces; label: string; desc: string }[] = [
  { value: 1, label: '1면 오픈', desc: '정면만 개방 (인라인)' },
  { value: 2, label: '2면 오픈', desc: '정면+측면 (코너)' },
  { value: 3, label: '3면 오픈', desc: '3면 개방 (페닌슐라)' },
  { value: 4, label: '4면 오픈', desc: '전면 개방 (아일랜드)' },
];

export default function Step1SizeSelect({ selected, openFaces, onSelect, onOpenFacesChange, onNext }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">부스 크기 선택</h2>
      <p className="text-sm text-gray-500 mb-6">부스 크기와 개방면을 선택해 주세요.</p>

      {/* Size cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {BOOTH_SIZES.map((size) => {
          const isSelected = selected?.id === size.id;
          return (
            <button
              key={size.id}
              onClick={() => onSelect(size)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all hover:shadow-md
                ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
              )}
              <BoothMini width={size.width} depth={size.depth} openFaces={openFaces} />
              <div className="mt-3">
                <p className="font-semibold text-gray-800 text-sm">{size.label}</p>
                <p className="text-xs text-gray-500 mt-1">{size.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Open-face selector */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">개방면 선택</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OPEN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onOpenFacesChange(opt.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all
                ${openFaces === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
              <OpenFaceMini openFaces={opt.value} />
              <p className="text-xs font-semibold text-gray-800 mt-2">{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          다음 단계 →
        </button>
      </div>
    </div>
  );
}

function BoothMini({ width, depth, openFaces }: { width: number; depth: number; openFaces: OpenFaces }) {
  const MAX = 80;
  const maxDim = Math.max(width, depth);
  const scale = MAX / maxDim;
  const w = width * scale;
  const d = depth * scale;
  const pad = 10;
  const walls = getWallConfig(openFaces);
  return (
    <svg width={MAX + pad * 2} height={MAX + pad * 2} className="mx-auto">
      <rect x={pad} y={pad} width={w} height={d} fill="#f0ede8" />
      <WallLines walls={walls} w={w} d={d} pad={pad} wt={4} />
    </svg>
  );
}

function OpenFaceMini({ openFaces }: { openFaces: OpenFaces }) {
  const walls = getWallConfig(openFaces);
  const sz = 54; const pad = 10; const w = sz - pad * 2; const d = sz - pad * 2;
  return (
    <svg width={sz} height={sz} className="mx-auto">
      <rect x={pad} y={pad} width={w} height={d} fill="#f0ede8" />
      <WallLines walls={walls} w={w} d={d} pad={pad} wt={4} />
    </svg>
  );
}

function WallLines({ walls, w, d, pad, wt }: {
  walls: ReturnType<typeof getWallConfig>;
  w: number; d: number; pad: number; wt: number;
}) {
  const wallFill = '#c8bfa8';
  const openStroke = '#4ade80';
  const dash = '4,3';
  return (
    <>
      {walls.back  ? <rect x={pad}     y={pad}     width={w}  height={wt} fill={wallFill} /> : <line x1={pad}   y1={pad}   x2={pad+w} y2={pad}   stroke={openStroke} strokeWidth={2} strokeDasharray={dash} />}
      {walls.left  ? <rect x={pad}     y={pad}     width={wt} height={d}  fill={wallFill} /> : <line x1={pad}   y1={pad}   x2={pad}   y2={pad+d} stroke={openStroke} strokeWidth={2} strokeDasharray={dash} />}
      {walls.right ? <rect x={pad+w-wt} y={pad}    width={wt} height={d}  fill={wallFill} /> : <line x1={pad+w} y1={pad}   x2={pad+w} y2={pad+d} stroke={openStroke} strokeWidth={2} strokeDasharray={dash} />}
      {walls.front ? <rect x={pad}     y={pad+d-wt} width={w} height={wt} fill={wallFill} /> : <line x1={pad}   y1={pad+d} x2={pad+w} y2={pad+d} stroke={openStroke} strokeWidth={2} strokeDasharray={dash} />}
    </>
  );
}
