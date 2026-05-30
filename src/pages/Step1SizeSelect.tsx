import { BOOTH_SIZES, type BoothSize } from '../types/booth';

interface Props {
  selected: BoothSize | null;
  onSelect: (size: BoothSize) => void;
  onNext: () => void;
}

export default function Step1SizeSelect({ selected, onSelect, onNext }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">부스 크기 선택</h2>
      <p className="text-sm text-gray-500 mb-6">전시에 사용할 부스의 기본 크기를 선택해 주세요.</p>

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
              {/* mini booth diagram */}
              <BoothMini width={size.width} depth={size.depth} />
              <div className="mt-3">
                <p className="font-semibold text-gray-800 text-sm">{size.label}</p>
                <p className="text-xs text-gray-500 mt-1">{size.description}</p>
              </div>
            </button>
          );
        })}
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

function BoothMini({ width, depth }: { width: number; depth: number }) {
  const MAX = 80;
  const maxDim = Math.max(width, depth);
  const scale = MAX / maxDim;
  const w = width * scale;
  const d = depth * scale;
  const pad = 10;
  return (
    <svg width={MAX + pad * 2} height={MAX + pad * 2} className="mx-auto">
      <rect x={pad} y={pad} width={w} height={d} fill="#f0ede8" stroke="#c8bfa8" strokeWidth={1.5} />
      {/* back wall */}
      <rect x={pad} y={pad} width={w} height={4} fill="#c8bfa8" />
      {/* left wall */}
      <rect x={pad} y={pad} width={4} height={d} fill="#c8bfa8" />
      {/* right wall */}
      <rect x={pad + w - 4} y={pad} width={4} height={d} fill="#c8bfa8" />
      {/* open front dashed */}
      <line x1={pad} y1={pad + d} x2={pad + w} y2={pad + d} stroke="#4ade80" strokeWidth={1.5} strokeDasharray="4,3" />
    </svg>
  );
}
