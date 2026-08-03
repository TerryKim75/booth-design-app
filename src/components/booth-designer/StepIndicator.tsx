interface Props {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${isCompleted ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}
              >
                {isCompleted ? '✓' : step}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mb-4 mx-1 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
