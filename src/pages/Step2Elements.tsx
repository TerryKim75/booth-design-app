import type { BoothElements } from '../types/booth';
import BoothCanvas from '../components/BoothCanvas';
import type { BoothConfig } from '../types/booth';

interface Props {
  elements: BoothElements;
  config: BoothConfig;
  onChange: (elements: BoothElements) => void;
  onNext: () => void;
  onBack: () => void;
}

function Counter({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
        >−</button>
        <span className="w-6 text-center font-semibold text-gray-800">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-700 font-bold transition-colors"
        >+</button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function Step2Elements({ elements, config, onChange, onNext, onBack }: Props) {
  const update = (patch: Partial<BoothElements>) => onChange({ ...elements, ...patch });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* left: controls */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-gray-800 mb-1">부스 구성 설정</h2>
        <p className="text-sm text-gray-500 mb-6">필요한 요소를 선택하고 수량을 조정해 주세요.</p>

        {/* logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">브랜드 / 로고</h3>
          <input
            type="text"
            placeholder="회사명 또는 브랜드명 입력"
            value={elements.logoText}
            onChange={(e) => update({ logoText: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* furniture */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">가구 및 장비</h3>
          <Counter label="의자" value={elements.chairCount} min={0} max={12} onChange={(v) => update({ chairCount: v })} />
          <Counter label="테이블" value={elements.tableCount} min={0} max={6} onChange={(v) => update({ tableCount: v })} />
          <Counter label="TV / 모니터" value={elements.tvCount} min={0} max={3} onChange={(v) => update({ tvCount: v })} />
        </div>

        {/* options */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">공간 옵션</h3>
          <Toggle label="안내데스크 (리셉션)" value={elements.hasReception} onChange={(v) => update({ hasReception: v })} />
          <Toggle label="창고 / 수납공간" value={elements.hasStorageRoom} onChange={(v) => update({ hasStorageRoom: v })} />
        </div>

        {/* graphic */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">백월 그래픽</h3>
          <div className="flex gap-2">
            {(['none', 'partial', 'full'] as const).map((v) => (
              <button
                key={v}
                onClick={() => update({ graphicCoverage: v })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                  ${elements.graphicCoverage === v ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
              >
                {v === 'none' ? '없음' : v === 'partial' ? '부분 적용' : '전체 적용'}
              </button>
            ))}
          </div>
        </div>

        {/* lighting */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">조명 타입</h3>
          <div className="flex gap-2">
            {(['basic', 'led', 'spotlight'] as const).map((v) => (
              <button
                key={v}
                onClick={() => update({ lightingType: v })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                  ${elements.lightingType === v ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
              >
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

      {/* right: live preview */}
      <div className="lg:w-72 xl:w-80">
        <div className="sticky top-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">실시간 미리보기</p>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <BoothCanvas config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
