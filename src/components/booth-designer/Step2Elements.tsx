import type { BoothElements, BoothConfig, ElementPositions, SizedElement } from './types';
import BoothCanvas from './BoothCanvas';

interface Props {
  elements: BoothElements;
  config: BoothConfig;
  positions: ElementPositions;
  onChange: (elements: BoothElements) => void;
  onPositionsChange: (pos: ElementPositions) => void;
  onNext: () => void;
  onBack: () => void;
}

function Counter({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">−</button>
        <span className="w-6 text-center font-semibold text-gray-800">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold transition-colors">+</button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function SizeInput({ label, value, onChange, min = 0.5, max = 10, step = 0.5 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <span className="text-xs text-gray-400">m</span>
      </div>
    </div>
  );
}

function SizedElementSection({ label, color, element, onChange }: {
  label: string;
  color: string;
  element: SizedElement;
  onChange: (e: SizedElement) => void;
}) {
  const upd = (patch: Partial<SizedElement>) => onChange({ ...element, ...patch });
  return (
    <div className="border-b border-gray-100 last:border-0">
      <Toggle label={label} value={element.enabled} onChange={(v) => upd({ enabled: v })} />
      {element.enabled && (
        <div className={`mb-3 p-3 rounded-lg ${color} flex gap-3 flex-wrap`}>
          <SizeInput label="너비(W)" value={element.widthM}  onChange={(v) => upd({ widthM: v })} />
          <SizeInput label="깊이(D)" value={element.depthM}  onChange={(v) => upd({ depthM: v })} />
          <SizeInput label="높이(H)" value={element.heightM} onChange={(v) => upd({ heightM: v })} max={4} />
          <div className="flex items-end">
            <p className="text-xs text-gray-400 pb-1">
              {element.widthM}W × {element.depthM}D × {element.heightM}Hm
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step2Elements({ elements, config, positions, onChange, onPositionsChange, onNext, onBack }: Props) {
  const upd = (patch: Partial<BoothElements>) => onChange({ ...elements, ...patch });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-gray-800 mb-1">부스 구성 설정</h2>
        <p className="text-sm text-gray-500 mb-6">요소를 설정하고 평면도에서 드래그로 위치를 조정하세요.</p>

        {/* Brand */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">브랜드 / 로고</h3>
          <input type="text" placeholder="회사명 또는 브랜드명"
            value={elements.logoText}
            onChange={(e) => upd({ logoText: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* Furniture */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">가구 및 장비</h3>
          <Counter label="의자"          value={elements.chairCount} min={0} max={16} onChange={(v) => upd({ chairCount: v })} />
          <Counter label="테이블"        value={elements.tableCount} min={0} max={8}  onChange={(v) => upd({ tableCount: v })} />
          <Counter label="TV / 모니터"   value={elements.tvCount}    min={0} max={4}  onChange={(v) => upd({ tvCount: v })} />
        </div>

        {/* Space options */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">공간 구성</h3>
          <div className="border-b border-gray-100">
            <Toggle label="안내데스크 (리셉션)"
              value={elements.hasReception}
              onChange={(v) => upd({ hasReception: v })} />
          </div>
          <SizedElementSection label="창고 / 수납공간" color="bg-stone-50"
            element={elements.storage}
            onChange={(e) => upd({ storage: e })} />
          <SizedElementSection label="미팅룸" color="bg-blue-50"
            element={elements.meetingRoom}
            onChange={(e) => upd({ meetingRoom: e })} />
        </div>

        {/* Graphic */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">백월 그래픽</h3>
          <div className="flex gap-2">
            {(['none', 'partial', 'full'] as const).map((v) => (
              <button key={v} onClick={() => upd({ graphicCoverage: v })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                  ${elements.graphicCoverage === v
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {v === 'none' ? '없음' : v === 'partial' ? '부분 적용' : '전체 적용'}
              </button>
            ))}
          </div>
        </div>

        {/* Lighting */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">조명 타입</h3>
          <div className="flex gap-2">
            {(['basic', 'led', 'spotlight'] as const).map((v) => (
              <button key={v} onClick={() => upd({ lightingType: v })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                  ${elements.lightingType === v
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {v === 'basic' ? '기본 형광등' : v === 'led' ? 'LED 바조명' : '스팟라이트'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            ← 이전
          </button>
          <button onClick={onNext} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            미리보기 →
          </button>
        </div>
      </div>

      {/* Live canvas */}
      <div className="lg:w-80 xl:w-96">
        <div className="sticky top-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">실시간 미리보기</p>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <BoothCanvas config={config} positions={positions} onPositionsChange={onPositionsChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
