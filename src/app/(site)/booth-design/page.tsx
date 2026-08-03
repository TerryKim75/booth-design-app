import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeroBand } from "@/components/ui/page-hero-band";
import { BoothCard } from "@/components/booth-design/booth-card";
import { BoothFilterBar } from "@/components/booth-design/booth-filter-bar";
import { ActiveFilters } from "@/components/booth-design/active-filters";
import { listBoothDesigns, type BoothDesignFilters } from "@/lib/data/booth-designs";
import type { BoothFeature, BoothStyleTag, BoothType, FrameType } from "@/types/domain";

export const metadata: Metadata = {
  title: "시스템 부스 디자인",
  description: "200개 이상의 ASO System 부스 디자인을 규격, 프레임 타입, 필요 요소별로 검색하세요.",
  alternates: { canonical: "/booth-design" },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

function toNum(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function BoothDesignPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;

  const filters: BoothDesignFilters = {
    widthMin: toNum(sp.widthMin),
    widthMax: toNum(sp.widthMax),
    depthMin: toNum(sp.depthMin),
    depthMax: toNum(sp.depthMax),
    areaMin: toNum(sp.areaMin),
    areaMax: toNum(sp.areaMax),
    heightMin: toNum(sp.heightMin),
    heightMax: toNum(sp.heightMax),
    boothType: toArray(sp.boothType) as BoothType[],
    openSides: toArray(sp.openSides).map(Number),
    frameType: toArray(sp.frameType) as FrameType[],
    features: toArray(sp.features) as BoothFeature[],
    styleTags: toArray(sp.styleTags) as BoothStyleTag[],
    sort: (sp.sort as BoothDesignFilters["sort"]) ?? "latest",
    page,
    pageSize: 16,
  };

  const { items, total, pageSize } = await listBoothDesigns(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const basePageParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") basePageParams[k] = v;
  }

  return (
    <div className="pb-24">
      <PageHeroBand
        eyebrow="Booth Design Search"
        title="시스템 부스 디자인"
        description="규격, 프레임 타입, 필요 요소를 조합해 원하는 시스템 부스 디자인을 찾아보세요."
      />

      <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-aso-line">
        <Container className="py-4">
          <BoothFilterBar />
        </Container>
      </div>

      <Container className="pt-10">
        <ActiveFilters total={total} />

        {items.length === 0 ? (
          <p className="text-aso-charcoal-2/60 py-24 text-center">조건에 맞는 디자인이 없습니다. 필터를 조정해보세요.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 min-w-0">
            {items.map((d) => (
              <BoothCard key={d.id} design={d} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex flex-wrap justify-center gap-2 mt-16" aria-label="페이지네이션">
            {Array.from({ length: totalPages }).map((_, i) => (
              <a
                key={i}
                href={`?${new URLSearchParams({ ...basePageParams, page: String(i + 1) }).toString()}`}
                className={`min-h-10 min-w-10 flex items-center justify-center text-sm font-num border ${
                  page === i + 1 ? "bg-aso-black text-white border-aso-black" : "border-aso-line text-aso-charcoal-2"
                }`}
              >
                {i + 1}
              </a>
            ))}
          </nav>
        )}
      </Container>
    </div>
  );
}
