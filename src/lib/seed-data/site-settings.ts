/**
 * 메인/공통 카피 — 관리자 페이지(/admin/settings)에서 key 기준으로 수정 가능.
 * 코드에서는 getSetting(key, fallback) 형태로 조회하며, DB 값이 없으면 여기 정의된 기본값을 사용한다.
 */
export const siteSettingSeed: { key: string; value: string }[] = [
  { key: "brand.name", value: "ASO SYSTEM" },
  { key: "brand.fullname", value: "Aluminum Solution Organizer" },
  { key: "hero.headline", value: "ASO SYSTEM" },
  { key: "hero.subheadline", value: "Aluminum Solution Organizer" },
  { key: "hero.tagline.en", value: "Aluminum Modules, Infinite Possibilities." },
  { key: "hero.tagline.ko", value: "알루미늄 모듈로 공간의 새로운 해답을 구성합니다." },
  {
    key: "intro.body",
    value:
      "ASO System은 정밀한 알루미늄 모듈을 조합하여 전시부스, 쇼룸, 브랜드 공간을 구성하는 공간 솔루션입니다.",
  },
  {
    key: "cta.final.headline",
    value: "당신의 공간을 ASO System으로 구성해보세요.",
  },
  { key: "company.name", value: "주식회사 아소시스템" },
  { key: "company.address", value: "서울시 금천구 가산디지털2로 70, 대륭테크노타운 19차 1203호 (08589)" },
  { key: "company.address.factory", value: "경기도 고양시 일산서구 덕산로 195번길 174, 자동 (가좌동) (10205)" },
  { key: "company.phone", value: "070-7865-2202" },
  { key: "company.email", value: "aso_sales@naver.com" },
];
