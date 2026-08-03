import type { FrameSpec } from "@/types/domain";

type Seed = Omit<FrameSpec, "id" | "createdAt" | "updatedAt">;

export const frameSpecSeed: Seed[] = [
  {
    name: "55mm Frame System",
    description:
      "경량 부스, 소형 쇼룸에 최적화된 표준 프레임입니다. 단면 55mm, 알루미늄 압출 프로파일로 제작되어 운반과 조립이 간편합니다.",
    specs: ["단면 55×55mm", "허용 스팬 최대 3m", "표준 조인트 커넥터 방식"],
    image: "/assets/placeholder/system/frame-55-detail.jpg",
    applicationImage: "/assets/placeholder/system/frame-55-application.jpg",
    status: "published",
    sortOrder: 1,
  },
  {
    name: "124mm Frame System",
    description: "타워, 브리지, 대형 아일랜드 부스처럼 하중이 큰 구조에 사용하는 고강성 프레임입니다.",
    specs: ["단면 124×124mm", "허용 스팬 최대 8m", "브리지·캐노피 하중 지지"],
    image: "/assets/placeholder/system/frame-124-detail.jpg",
    applicationImage: "/assets/placeholder/system/frame-124-application.jpg",
    status: "published",
    sortOrder: 2,
  },
];
