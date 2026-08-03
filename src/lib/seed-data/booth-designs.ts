import type { BoothDesign, BoothFeature, BoothFeatureEntry, BoothStyleTag, BoothType, FrameType } from "@/types/domain";
import { boothStyleLabel, boothFeatureLabel } from "@/lib/labels";

const IMG = "/assets/placeholder/booth-design";

type Seed = Omit<BoothDesign, "id" | "createdBy" | "createdAt" | "updatedAt">;

function f(feature: BoothFeature, note = ""): BoothFeatureEntry {
  return { feature, note };
}

/**
 * 16개는 실제 운영을 상정한 큐레이션 디자인이며, 그 뒤로 이어지는 절차적 생성 디자인은
 * "200개 이상 시스템 부스 디자인 검색"이라는 완료 조건을 만족하기 위한 확장 샘플이다.
 * 관리자는 CSV 일괄 업로드로 실제 디자인 데이터를 이 구조에 맞춰 교체/추가할 수 있다.
 */
const curated: Seed[] = [
  {
    designCode: "ASO-B-0001", slug: "aso-b-0001-basic-3x3-inline",
    title: "3×3 기본형 인라인 부스", width: 3, depth: 3, area: 9, height: 2.5,
    boothType: "inline", openSides: 1, frameType: "55mm",
    features: [f("shelf", "1단"), f("lighting_graphic")],
    styleTags: ["closed", "straight_structure"],
    description: "가장 기본이 되는 3×3m 1면 오픈 부스입니다. 55mm 프레임만으로 구성해 설치 시간이 짧고 초기 참가 기업에 적합합니다.",
    thumbnail: `${IMG}/b0001-01.jpg`, gallery: [`${IMG}/b0001-01.jpg`, `${IMG}/b0001-02.jpg`],
    floorPlan: `${IMG}/b0001-plan.jpg`,
    materialSummary: "55mm 프레임 24유닛 · 포맥스 그래픽 벽체 · 선반 1단",
    featured: true, status: "published", sortOrder: 1,
  },
  {
    designCode: "ASO-B-0002", slug: "aso-b-0002-corner-4x4",
    title: "4×4 코너형 부스", width: 4, depth: 4, area: 16, height: 2.7,
    boothType: "corner", openSides: 2, frameType: "55mm",
    features: [f("standalone_display", "2개"), f("lighting_graphic")],
    styleTags: ["semi_closed", "straight_structure"],
    description: "2면이 통로에 면한 코너 부스로, 독립전시대를 코너 안쪽에 배치해 시선을 자연스럽게 유도합니다.",
    thumbnail: `${IMG}/b0002-01.jpg`, gallery: [`${IMG}/b0002-01.jpg`, `${IMG}/b0002-02.jpg`],
    floorPlan: `${IMG}/b0002-plan.jpg`,
    materialSummary: "55mm 프레임 32유닛 · 독립전시대 2개 · 조명그래픽 1식",
    featured: true, status: "published", sortOrder: 2,
  },
  {
    designCode: "ASO-B-0003", slug: "aso-b-0003-island-tower-9x9",
    title: "9×9 중앙 타워형 아일랜드 부스", width: 9, depth: 9, area: 81, height: 5.5,
    boothType: "island", openSides: 4, frameType: "124mm",
    features: [f("storage", "1개소"), f("meeting_room", "1실"), f("video_wall", "1식")],
    styleTags: ["open", "straight_structure"],
    description: "124mm 프레임으로 세운 5.5m 높이의 중앙 구조가 원거리에서도 시인성을 확보합니다. 후면에 미팅룸과 창고를 배치해 운영 동선을 분리했습니다.",
    thumbnail: `${IMG}/b0003-01.jpg`, gallery: [`${IMG}/b0003-01.jpg`, `${IMG}/b0003-02.jpg`, `${IMG}/b0003-03.jpg`],
    floorPlan: `${IMG}/b0003-plan.jpg`,
    materialSummary: "124mm 프레임 96유닛 · 비디오월 1식 · 미팅룸 1실",
    featured: true, status: "published", sortOrder: 3,
  },
  {
    designCode: "ASO-B-0004", slug: "aso-b-0004-peninsula-bridge-12x8",
    title: "12×8 브리지 연결형 페닌슐라 부스", width: 12, depth: 8, area: 96, height: 4.8,
    boothType: "peninsula", openSides: 3, frameType: "124mm",
    features: [f("video_wall", "2대"), f("front_display", "1식")],
    styleTags: ["open", "straight_structure"],
    description: "3면 오픈 페닌슐라 구조에 브리지와 캐노피를 결합해 상부 공간까지 활용한 디자인입니다.",
    thumbnail: `${IMG}/b0004-01.jpg`, gallery: [`${IMG}/b0004-01.jpg`, `${IMG}/b0004-02.jpg`],
    floorPlan: `${IMG}/b0004-plan.jpg`,
    materialSummary: "124mm 프레임 88유닛 · 비디오월 2대 · 전면전시대 1식",
    featured: false, status: "published", sortOrder: 4,
  },
  {
    designCode: "ASO-B-0005", slug: "aso-b-0005-meeting-6x6",
    title: "6×6 미팅룸 포함형 부스", width: 6, depth: 6, area: 36, height: 3.2,
    boothType: "corner", openSides: 2, frameType: "mixed",
    features: [f("meeting_room", "1실"), f("storage", "1개소")],
    styleTags: ["semi_closed", "straight_structure"],
    description: "독립된 도어형 미팅룸 1실과 창고를 갖춘 상담 중심형 부스입니다.",
    thumbnail: `${IMG}/b0005-01.jpg`, gallery: [`${IMG}/b0005-01.jpg`],
    floorPlan: `${IMG}/b0005-plan.jpg`,
    materialSummary: "55mm/124mm 혼합 프레임 · 미팅룸 1실 · 창고 1개소",
    featured: false, status: "published", sortOrder: 5,
  },
  {
    designCode: "ASO-B-0006", slug: "aso-b-0006-product-focus-5x4",
    title: "5×4 제품 전시형 부스", width: 5, depth: 4, area: 20, height: 2.8,
    boothType: "inline", openSides: 1, frameType: "55mm",
    features: [f("standalone_display", "4개"), f("lighting_graphic")],
    styleTags: ["closed", "straight_structure"],
    description: "제품 자체가 주인공이 되도록 그래픽을 최소화하고 조명과 독립전시대에 집중한 구성입니다.",
    thumbnail: `${IMG}/b0006-01.jpg`, gallery: [`${IMG}/b0006-01.jpg`],
    floorPlan: `${IMG}/b0006-plan.jpg`,
    materialSummary: "55mm 프레임 20유닛 · 독립전시대 4개 · 조명그래픽 1식",
    featured: false, status: "published", sortOrder: 6,
  },
  {
    designCode: "ASO-B-0007", slug: "aso-b-0007-large-island-20x15",
    title: "20×15 대형 아일랜드 플래그십 부스", width: 20, depth: 15, area: 300, height: 6,
    boothType: "island", openSides: 4, frameType: "124mm",
    features: [f("meeting_room", "2실"), f("storage", "1개소"), f("video_wall", "1식"), f("showcase", "1개")],
    styleTags: ["open", "round_structure"],
    description: "브랜드 플래그십을 위한 최대 규모 구성으로, 미팅룸·비디오월·쇼케이스를 모두 결합했습니다.",
    thumbnail: `${IMG}/b0007-01.jpg`, gallery: [`${IMG}/b0007-01.jpg`, `${IMG}/b0007-02.jpg`, `${IMG}/b0007-03.jpg`],
    floorPlan: `${IMG}/b0007-plan.jpg`,
    materialSummary: "124mm 프레임 210유닛 · 비디오월 1식 · 미팅룸 2실",
    featured: true, status: "published", sortOrder: 7,
  },
  {
    designCode: "ASO-B-0008", slug: "aso-b-0008-tech-8x6",
    title: "8×6 테크놀로지형 부스", width: 8, depth: 6, area: 48, height: 3.6,
    boothType: "corner", openSides: 2, frameType: "124mm",
    features: [f("video_wall", "2대")],
    styleTags: ["semi_closed", "straight_structure"],
    description: "비디오월과 대형 모니터를 중심으로 한 IT·전자 기업 특화 구성입니다.",
    thumbnail: `${IMG}/b0008-01.jpg`, gallery: [`${IMG}/b0008-01.jpg`],
    floorPlan: `${IMG}/b0008-plan.jpg`,
    materialSummary: "124mm 프레임 48유닛 · 비디오월 2대",
    featured: false, status: "published", sortOrder: 8,
  },
  {
    designCode: "ASO-B-0009", slug: "aso-b-0009-open-4x3",
    title: "4×3 오픈형 소형 부스", width: 4, depth: 3, area: 12, height: 2.5,
    boothType: "inline", openSides: 1, frameType: "55mm",
    features: [f("shelf", "1단")],
    styleTags: ["open", "straight_structure"],
    description: "예산이 제한된 스타트업이나 신규 참가 기업에 적합한 초소형 오픈 구성입니다.",
    thumbnail: `${IMG}/b0009-01.jpg`, gallery: [`${IMG}/b0009-01.jpg`],
    floorPlan: `${IMG}/b0009-plan.jpg`,
    materialSummary: "55mm 프레임 16유닛 · 선반 1단",
    featured: false, status: "published", sortOrder: 9,
  },
  {
    designCode: "ASO-B-0010", slug: "aso-b-0010-premium-10x10",
    title: "10×10 프리미엄 아일랜드 부스", width: 10, depth: 10, area: 100, height: 4.5,
    boothType: "island", openSides: 4, frameType: "mixed",
    features: [f("meeting_room", "1실"), f("showcase", "2개")],
    styleTags: ["open", "round_structure"],
    description: "고급 마감재와 간접 조명을 적용한 프리미엄 브랜드 전용 아일랜드 부스입니다.",
    thumbnail: `${IMG}/b0010-01.jpg`, gallery: [`${IMG}/b0010-01.jpg`, `${IMG}/b0010-02.jpg`],
    floorPlan: `${IMG}/b0010-plan.jpg`,
    materialSummary: "55mm/124mm 혼합 · 미팅룸 1실 · 쇼케이스 2개 · 우드톤 마감",
    featured: true, status: "published", sortOrder: 10,
  },
  {
    designCode: "ASO-B-0011", slug: "aso-b-0011-corner-storage-6x4",
    title: "6×4 창고 포함형 코너 부스", width: 6, depth: 4, area: 24, height: 3, boothType: "corner", openSides: 2, frameType: "55mm",
    features: [f("storage", "1개소")],
    styleTags: ["semi_closed", "straight_structure"],
    description: "운영 물품 보관을 위한 창고 공간을 확보한 실용적인 코너 부스입니다.",
    thumbnail: `${IMG}/b0011-01.jpg`, gallery: [`${IMG}/b0011-01.jpg`],
    floorPlan: `${IMG}/b0011-plan.jpg`,
    materialSummary: "55mm 프레임 28유닛 · 창고 1개소 · 슬라이딩 도어",
    featured: false, status: "published", sortOrder: 11,
  },
  {
    designCode: "ASO-B-0012", slug: "aso-b-0012-peninsula-8x6",
    title: "8×6 페닌슐라 그래픽 부스", width: 8, depth: 6, area: 48, height: 4, boothType: "peninsula", openSides: 3, frameType: "124mm",
    features: [f("lighting_graphic"), f("front_display", "1식")],
    styleTags: ["open", "straight_structure"],
    description: "대형 조명그래픽월을 배경으로 3면에서 브랜드 메시지를 노출하는 구성입니다.",
    thumbnail: `${IMG}/b0012-01.jpg`, gallery: [`${IMG}/b0012-01.jpg`],
    floorPlan: `${IMG}/b0012-plan.jpg`,
    materialSummary: "124mm 프레임 60유닛 · 조명그래픽월 · 전면전시대 1식",
    featured: false, status: "published", sortOrder: 12,
  },
  {
    designCode: "ASO-B-0013", slug: "aso-b-0013-canopy-island-14x10",
    title: "14×10 캐노피 아일랜드 부스", width: 14, depth: 10, area: 140, height: 5, boothType: "island", openSides: 4, frameType: "124mm",
    features: [f("standalone_display", "2개"), f("video_wall", "1식")],
    styleTags: ["open", "round_structure"],
    description: "대형 캐노피 하부에 상담·전시 공간을 배치해 그늘막과 랜드마크 기능을 동시에 수행합니다.",
    thumbnail: `${IMG}/b0013-01.jpg`, gallery: [`${IMG}/b0013-01.jpg`, `${IMG}/b0013-02.jpg`],
    floorPlan: `${IMG}/b0013-plan.jpg`,
    materialSummary: "124mm 프레임 150유닛 · 독립전시대 2개 · 비디오월 1식",
    featured: true, status: "published", sortOrder: 13,
  },
  {
    designCode: "ASO-B-0014", slug: "aso-b-0014-inline-formex-3x6",
    title: "3×6 포맥스 그래픽 인라인 부스", width: 3, depth: 6, area: 18, height: 2.7, boothType: "inline", openSides: 1, frameType: "55mm",
    features: [f("shelf", "2단"), f("lighting_graphic")],
    styleTags: ["closed", "straight_structure"],
    description: "세로로 긴 3×6m 구조를 살려 포맥스 그래픽 파사드를 강조한 인라인 부스입니다.",
    thumbnail: `${IMG}/b0014-01.jpg`, gallery: [`${IMG}/b0014-01.jpg`],
    floorPlan: `${IMG}/b0014-plan.jpg`,
    materialSummary: "55mm 프레임 22유닛 · 선반 2단 · 조명그래픽 1식",
    featured: false, status: "published", sortOrder: 14,
  },
  {
    designCode: "ASO-B-0015", slug: "aso-b-0015-double-door-corner-7x5",
    title: "7×5 이중 도어 코너 부스", width: 7, depth: 5, area: 35, height: 3.1, boothType: "corner", openSides: 2, frameType: "mixed",
    features: [f("semi_open_meeting_room", "1실"), f("storage", "1개소")],
    styleTags: ["semi_closed", "straight_structure"],
    description: "출입 동선을 분리한 이중 도어 구조로 반오픈형 상담 공간의 프라이버시를 강화했습니다.",
    thumbnail: `${IMG}/b0015-01.jpg`, gallery: [`${IMG}/b0015-01.jpg`],
    floorPlan: `${IMG}/b0015-plan.jpg`,
    materialSummary: "55mm/124mm 혼합 · 반오픈미팅룸 1실 · 창고 1개소",
    featured: false, status: "published", sortOrder: 15,
  },
  {
    designCode: "ASO-B-0016", slug: "aso-b-0016-island-flagship-16x12",
    title: "16×12 브랜드 플래그십 아일랜드 부스", width: 16, depth: 12, area: 192, height: 5.5, boothType: "island", openSides: 4, frameType: "124mm",
    features: [f("meeting_room", "1실"), f("video_wall", "1식"), f("showcase", "3개")],
    styleTags: ["open", "round_structure"],
    description: "비디오월과 쇼케이스를 결합한 대형 브랜드 전시 전용 아일랜드 부스입니다.",
    thumbnail: `${IMG}/b0016-01.jpg`, gallery: [`${IMG}/b0016-01.jpg`, `${IMG}/b0016-02.jpg`],
    floorPlan: `${IMG}/b0016-plan.jpg`,
    materialSummary: "124mm 프레임 180유닛 · 비디오월 1식 · 미팅룸 1실",
    featured: true, status: "published", sortOrder: 16,
  },
];

// ─────────────────────────────────────────
// 절차적 확장 — 200개 이상 규모의 검색/필터 테스트를 위한 생성 데이터
// ─────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20250101);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const typeByOpenSides: Record<BoothType, 1 | 2 | 3 | 4> = {
  inline: 1,
  corner: 2,
  peninsula: 3,
  island: 4,
};

const sizePool: [number, number][] = [
  [3, 3], [3, 4], [4, 3], [4, 4], [4, 5], [5, 4], [5, 5], [5, 6], [6, 5], [6, 6],
  [6, 8], [8, 6], [7, 6], [6, 7], [8, 8], [9, 6], [6, 9], [9, 9], [10, 8], [8, 10],
  [10, 10], [12, 9], [9, 12], [12, 10], [14, 10], [10, 14], [15, 10], [15, 12], [18, 12], [20, 15],
];

const framePool: FrameType[] = ["55mm", "124mm", "mixed"];
const typePool: BoothType[] = ["inline", "corner", "peninsula", "island"];
const featurePool: BoothFeature[] = [
  "storage", "meeting_room", "semi_open_meeting_room", "standalone_display",
  "front_display", "showcase", "shelf", "video_wall", "lighting_graphic",
];
const structurePool: BoothStyleTag[] = ["round_structure", "straight_structure"];

const primaryStyleByType: Record<BoothType, BoothStyleTag> = {
  inline: "closed",
  corner: "semi_closed",
  peninsula: "semi_closed",
  island: "open",
};

const typeKo: Record<BoothType, string> = {
  inline: "인라인",
  corner: "코너",
  peninsula: "페닌슐라",
  island: "아일랜드",
};

function noteForFeature(feature: BoothFeature): string {
  switch (feature) {
    case "storage":
    case "semi_open_meeting_room":
    case "meeting_room":
      return "1실";
    case "standalone_display":
    case "showcase":
      return `${1 + Math.floor(rand() * 3)}개`;
    case "shelf":
      return `${1 + Math.floor(rand() * 2)}단`;
    case "video_wall":
      return `${1 + Math.floor(rand() * 2)}대`;
    case "front_display":
      return "1식";
    case "lighting_graphic":
      return "";
    default:
      return "";
  }
}

function generateProcedural(count: number): Seed[] {
  const results: Seed[] = [];
  for (let i = 0; i < count; i++) {
    const num = 17 + i;
    const code = `ASO-B-${String(num).padStart(4, "0")}`;
    const boothType = pick(typePool);
    const [width, depth] = pick(sizePool);
    const area = width * depth;
    const height = Math.round((2.5 + rand() * 3.5) * 10) / 10;
    const frameType = area > 60 ? pick<FrameType>(["124mm", "mixed"]) : pick(framePool);
    const openSidesBase = typeByOpenSides[boothType];

    const featureCount = 2 + Math.floor(rand() * 3);
    const featureKeys = Array.from(
      new Set(Array.from({ length: featureCount }, () => pick(featurePool)))
    );
    const features: BoothFeatureEntry[] = featureKeys.map((feature) => f(feature, noteForFeature(feature)));

    const style = primaryStyleByType[boothType];
    const styleTags = [style, pick(structurePool)].filter((v, idx, arr) => arr.indexOf(v) === idx) as BoothStyleTag[];

    results.push({
      designCode: code,
      slug: `${code.toLowerCase()}-${boothType}-${width}x${depth}`,
      title: `${boothStyleLabel[style]} ${width}×${depth}m ${typeKo[boothType]} 시스템 부스`,
      width,
      depth,
      area,
      height,
      boothType,
      openSides: openSidesBase,
      frameType,
      features,
      styleTags,
      description: `${width}×${depth}m 규모의 ${typeKo[boothType]} 타입 시스템 부스 디자인입니다. ${frameType} 프레임을 기반으로 ${
        featureKeys.map((k) => boothFeatureLabel[k]).join(", ")
      } 등의 구성요소를 포함합니다.`,
      thumbnail: `${IMG}/generic-${(num % 12) + 1}.jpg`,
      gallery: [`${IMG}/generic-${(num % 12) + 1}.jpg`],
      floorPlan: `${IMG}/generic-plan-${(num % 6) + 1}.jpg`,
      materialSummary: `${frameType} 프레임 · ${features.length}개 구성요소 포함`,
      featured: false,
      status: "published",
      sortOrder: num,
    });
  }
  return results;
}

export const boothDesignSeed: Seed[] = [...curated, ...generateProcedural(200)];
