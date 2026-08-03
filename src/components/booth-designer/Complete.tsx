import type { QuoteRequest } from './types';

interface Props {
  quote: QuoteRequest;
  onReset: () => void;
}

export default function Complete({ quote, onReset }: Props) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">견적 요청 완료!</h2>
      <p className="text-gray-500 text-sm mb-2">
        <strong>{quote.contactName}</strong>님, 견적 요청이 접수되었습니다.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        <strong>{quote.email}</strong>로 견적서를 보내드리겠습니다.<br />
        영업일 기준 1-2일 내에 연락드립니다.
      </p>

      <div className="bg-gray-50 rounded-xl p-5 text-left mb-8 text-sm">
        <p className="font-semibold text-gray-700 mb-3">요청 내용 요약</p>
        <div className="space-y-1.5 text-gray-600">
          <p>부스 크기: {quote.boothConfig.size?.label}</p>
          <p>회사명: {quote.companyName}</p>
          {quote.eventName && <p>행사명: {quote.eventName}</p>}
          {quote.eventDate && <p>행사일: {quote.eventDate}</p>}
        </div>
      </div>

      <button
        onClick={onReset}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
      >
        새 견적 요청하기
      </button>
    </div>
  );
}
