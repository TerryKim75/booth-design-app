/**
 * 목록형 페이지(포트폴리오/부스 디자인/비품 임대/다운로드) 상단 공통 히어로 밴드.
 * 헤더 바로 아래 다크 배경 + 중앙 정렬 타이틀 레이아웃을 모든 목록 페이지에서 동일하게 사용한다.
 */
export function PageHeroBand({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-aso-black flex flex-col items-center justify-center text-center px-5 pt-[114px] lg:pt-[130px] pb-[30px]">
      <p className="text-aso-primary-light text-[11px] font-semibold tracking-[0.3em] uppercase mb-2">{eyebrow}</p>
      <h1 className="text-white font-bold tracking-[0.15em] uppercase" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
        {title}
      </h1>
      {description && <p className="text-white/50 text-sm mt-2 max-w-xl">{description}</p>}
    </div>
  );
}
