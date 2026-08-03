"use client";

import { useState } from 'react';
import type { BoothConfig, QuoteRequest } from './types';
import BoothCanvas from './BoothCanvas';
import { submitBoothQuote } from '@/app/(site)/booth-designer/actions';

interface Props {
  config: BoothConfig;
  onBack: () => void;
  onSubmit: (quote: QuoteRequest) => void;
}

export default function Step3Preview({ config, onBack, onSubmit }: Props) {
  const [form, setForm] = useState<Omit<QuoteRequest, 'boothConfig'>>({
    companyName: '', contactName: '', email: '', phone: '',
    eventName: '', eventDate: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const isValid = form.companyName && form.contactName && form.email && form.phone;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    const quote: QuoteRequest = { ...form, boothConfig: config };
    const res = await submitBoothQuote(quote);
    if (!res.success) {
      setError(res.error ?? '견적 요청 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setSubmitting(false);
      return;
    }
    onSubmit(quote);
  };

  const { size, elements, openFaces } = config;
  const openLabel = ['', '1면 오픈 (인라인)', '2면 오픈 (코너)', '3면 오픈 (페닌슐라)', '4면 오픈 (아일랜드)'][openFaces];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">최종 확인 및 견적 요청</h2>
      <p className="text-sm text-gray-500 mb-6">부스 구성을 확인하고 연락처를 입력하면 견적서를 보내드립니다.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">부스 구성 미리보기</h3>
          <BoothCanvas config={config} positions={config.positions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">구성 요약</h3>
          <div className="space-y-2 text-sm">
            <Row label="부스 크기"    value={size?.label ?? '-'} />
            <Row label="개방면"       value={openLabel} />
            <Row label="브랜드명"     value={elements.logoText || '미입력'} />
            <Row label="의자"         value={`${elements.chairCount}개`} />
            <Row label="테이블"       value={`${elements.tableCount}개`} />
            <Row label="TV / 모니터"  value={`${elements.tvCount}대`} />
            <Row label="안내데스크"   value={elements.hasReception ? '있음' : '없음'} />
            <Row label="창고"         value={elements.storage.enabled
              ? `${elements.storage.widthM}W×${elements.storage.depthM}D×${elements.storage.heightM}Hm`
              : '없음'} />
            <Row label="미팅룸"       value={elements.meetingRoom.enabled
              ? `${elements.meetingRoom.widthM}W×${elements.meetingRoom.depthM}D×${elements.meetingRoom.heightM}Hm`
              : '없음'} />
            <Row label="백월 그래픽"  value={elements.graphicCoverage === 'none' ? '없음' : elements.graphicCoverage === 'partial' ? '부분 적용' : '전체 적용'} />
            <Row label="조명"         value={elements.lightingType === 'basic' ? '기본 형광등' : elements.lightingType === 'led' ? 'LED 바조명' : '스팟라이트'} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            * 실제 견적은 행사일정, 장소, 추가 옵션에 따라 달라질 수 있습니다.
          </div>
        </div>
      </div>

      <form className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">견적 요청 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="회사명 *"       placeholder="주식회사 예시"           value={form.companyName}  onChange={(v) => update({ companyName: v })} />
          <Field label="담당자 이름 *"  placeholder="홍길동"                  value={form.contactName}  onChange={(v) => update({ contactName: v })} />
          <Field label="이메일 *"       type="email" placeholder="example@company.com" value={form.email} onChange={(v) => update({ email: v })} />
          <Field label="연락처 *"       type="tel"   placeholder="010-0000-0000"        value={form.phone} onChange={(v) => update({ phone: v })} />
          <Field label="행사명"         placeholder="2026 서울 국제 박람회"   value={form.eventName}    onChange={(v) => update({ eventName: v })} />
          <Field label="행사 일정"      type="date"                           value={form.eventDate}    onChange={(v) => update({ eventDate: v })} />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">추가 요청사항</label>
          <textarea rows={3} placeholder="특별 요청사항이 있으면 입력해 주세요"
            value={form.notes} onChange={(e) => update({ notes: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </form>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
          ← 이전
        </button>
        <button onClick={handleSubmit} disabled={!isValid || submitting}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? '전송 중...' : '견적 요청하기'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  );
}
