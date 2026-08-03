import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeroBand } from "@/components/ui/page-hero-band";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { PortfolioFilterBar } from "@/components/portfolio/portfolio-filter-bar";
import { listPortfolios } from "@/lib/data/portfolio";
import type { ProjectType } from "@/types/domain";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "ASO System이 시공한 전시부스, 쇼룸, 브랜드 공간 포트폴리오를 확인하세요.",
  alternates: { canonical: "/portfolio" },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;

  const filters = {
    year: toArray(sp.year).map(Number),
    country: toArray(sp.country),
    industry: toArray(sp.industry),
    projectType: toArray(sp.projectType) as ProjectType[],
    sort: (sp.sort as "latest" | "featured" | "size") ?? "latest",
    page,
    pageSize: 9,
  };

  const [{ items, total, pageSize }, allPublished] = await Promise.all([
    listPortfolios(filters),
    listPortfolios({ pageSize: 500 }),
  ]);

  const facets = {
    years: Array.from(new Set(allPublished.items.map((p) => p.year))).sort((a, b) => b - a),
    countries: Array.from(new Set(allPublished.items.map((p) => p.country))).sort(),
    industries: Array.from(new Set(allPublished.items.map((p) => p.industry))).sort(),
    projectTypes: Array.from(new Set(allPublished.items.map((p) => p.projectType))),
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const basePageParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") basePageParams[k] = v;
  }

  return (
    <div className="pb-24">
      <PageHeroBand eyebrow="Portfolio" title="포트폴리오" description="ASO System이 시공한 전시부스, 쇼룸, 브랜드 공간 포트폴리오입니다." />

      <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-aso-line">
        <Container className="py-4">
          <PortfolioFilterBar facets={facets} />
        </Container>
      </div>

      <Container className="pt-10">
        <p className="text-sm text-aso-charcoal-2/70 mb-6">
          총 <strong className="text-aso-black font-num">{total}</strong>개의 프로젝트
        </p>

        {items.length === 0 ? (
          <p className="text-aso-charcoal-2/60 py-20 text-center">조건에 맞는 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 min-w-0">
            {items.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex justify-center gap-2 mt-16" aria-label="페이지네이션">
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
