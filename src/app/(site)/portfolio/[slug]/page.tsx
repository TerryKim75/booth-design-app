import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SafeImage } from "@/components/ui/safe-image";
import { ButtonLink } from "@/components/ui/button";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getPortfolioBySlug, listRelatedPortfolios } from "@/lib/data/portfolio";
import { projectTypeLabel } from "@/lib/labels";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.description.slice(0, 140),
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: { images: [{ url: item.thumbnail }] },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) notFound();

  const related = await listRelatedPortfolios(item, 3);

  const facts = [
    { label: "고객사", value: item.client },
    { label: "전시회", value: item.exhibition },
    { label: "개최 장소", value: `${item.city}, ${item.country}` },
    { label: "연도", value: String(item.year) },
    { label: "부스 크기", value: `${item.boothWidth}×${item.boothDepth}m` },
    { label: "높이", value: `${item.boothHeight}m` },
    { label: "적용 시스템", value: item.systemType === "mixed" ? "혼합 프레임" : `${item.systemType} 프레임` },
    { label: "프로젝트 유형", value: projectTypeLabel[item.projectType] },
  ];

  return (
    <div className="pt-32 md:pt-36 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: item.title,
          description: item.description,
          image: item.thumbnail,
          creator: { "@type": "Organization", name: "ASO SYSTEM" },
          about: item.exhibition,
          dateCreated: String(item.year),
        }}
      />
      <div className="relative aspect-[16/9] md:aspect-[21/9] bg-aso-offwhite">
        <SafeImage src={item.thumbnail} alt={item.title} fill preload className="object-cover" />
      </div>

      <Container className="pt-10">
        <nav className="text-xs text-aso-muted mb-6">
          <Link href="/portfolio" className="hover:text-aso-primary">포트폴리오</Link> / {item.title}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div>
            <p className="text-eyebrow text-aso-primary mb-3">
              {item.country} · {item.city} · {item.year}
            </p>
            <h1 className="text-heading text-aso-black mb-6">{item.title}</h1>
            <p className="text-base leading-relaxed text-aso-charcoal-2/85 whitespace-pre-line mb-10">
              {item.description}
            </p>

            {item.gallery.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.gallery.map((src, i) => (
                  <div key={i} className="relative aspect-[4/3] bg-aso-offwhite">
                    <SafeImage src={src} alt={`${item.title} 이미지 ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-aso-line p-6 shadow-sm">
            <p className="text-eyebrow text-aso-muted mb-4">Project Overview</p>
            <dl className="space-y-3 mb-8">
              {facts.map((f) => (
                <div key={f.label} className="flex justify-between text-sm gap-4">
                  <dt className="text-aso-muted shrink-0">{f.label}</dt>
                  <dd className="text-aso-black font-medium text-right font-num">{f.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href={`/inquiry?ref=portfolio&title=${encodeURIComponent(item.title)}`} variant="accent" className="w-full">
              이 프로젝트로 문의하기
            </ButtonLink>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-aso-line">
            <h2 className="text-subheading text-aso-black mb-8">관련 포트폴리오</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((r) => (
                <PortfolioCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
