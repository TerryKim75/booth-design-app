import { useState } from 'react';
import type { BoothConfig, BoothSize, QuoteRequest, OpenFaces, ElementPositions, BoothElements } from '../types/booth';
import { DEFAULT_ELEMENTS, EMPTY_POSITIONS, getDefaultPositions } from '../types/booth';
import StepIndicator from '../components/StepIndicator';
import Step1SizeSelect from './Step1SizeSelect';
import Step2Elements from './Step2Elements';
import Step3Preview from './Step3Preview';
import Complete from './Complete';

const STEPS = ['부스 크기', '구성 설정', '견적 요청'];

export default function Builder() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BoothConfig>({
    size: null,
    openFaces: 1,
    elements: DEFAULT_ELEMENTS,
    positions: EMPTY_POSITIONS,
  });
  const [submitted, setSubmitted] = useState<QuoteRequest | null>(null);

  const selectSize = (size: BoothSize) => {
    setConfig((c) => ({
      ...c,
      size,
      positions: getDefaultPositions(size, c.elements, c.size ? c.positions : undefined),
    }));
  };

  const changeOpenFaces = (openFaces: OpenFaces) => {
    setConfig((c) => ({ ...c, openFaces }));
  };

  const updateElements = (elements: BoothElements) => {
    const size = config.size;
    if (!size) {
      setConfig((c) => ({ ...c, elements }));
      return;
    }
    const prev = config.elements;
    const countsChanged =
      elements.tableCount !== prev.tableCount ||
      elements.chairCount !== prev.chairCount ||
      elements.tvCount    !== prev.tvCount;

    if (countsChanged) {
      const positions = getDefaultPositions(size, elements, config.positions);
      setConfig((c) => ({ ...c, elements, positions }));
    } else {
      setConfig((c) => ({ ...c, elements }));
    }
  };

  const updatePositions = (positions: ElementPositions) => {
    setConfig((c) => ({ ...c, positions }));
  };

  if (submitted) {
    return <Complete quote={submitted} onReset={() => {
      setSubmitted(null);
      setStep(1);
      setConfig({ size: null, openFaces: 1, elements: DEFAULT_ELEMENTS, positions: EMPTY_POSITIONS });
    }} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">AlVision Booth Designer</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">전시부스 디자인 견적 시스템</h1>
        <p className="text-gray-500 text-sm mt-2">부스 크기와 구성을 선택하면 즉시 견적을 받아보실 수 있습니다</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <StepIndicator currentStep={step} steps={STEPS} />

        {step === 1 && (
          <Step1SizeSelect
            selected={config.size}
            openFaces={config.openFaces}
            onSelect={selectSize}
            onOpenFacesChange={changeOpenFaces}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Elements
            elements={config.elements}
            config={config}
            positions={config.positions}
            onChange={updateElements}
            onPositionsChange={updatePositions}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Preview
            config={config}
            onBack={() => setStep(2)}
            onSubmit={(quote) => setSubmitted(quote)}
          />
        )}
      </div>
    </div>
  );
}
