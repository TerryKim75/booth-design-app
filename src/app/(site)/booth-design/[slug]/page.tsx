import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SafeImage } from "@/components/ui/safe-image";
import { ButtonLink } from "@/components/ui/button";
import { BoothCard } from "@/components/booth-design/booth-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getBoothDesignBySlug, listSimilarBoothDesigns } from "@/lib/data/booth-designs";
import { boothTypeLabel, frameTypeLabel, boothFeatureLabel, boothStyleLabel } from "@/lib/labels";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getBoothDesignBySlug(slug);
  if (!item) return {};
  return {
    title: `${item.title} (${item.designCode})`,
    description: item.description.slice(0, 140),
    alternates: { canonical: `/booth-design/${slug}` },
    openGraph: { images: [{ url: item.thumbnail }] },
  };
}

export default async function BoothDesignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getBoothDesignBySlug(slug);
  if (!item) notFound();

  const similar = await listSimilarBoothDesigns(item, 4);

  const inquiryHref = `/inquiry?boothDesignId=${item.id}&boothDesignCode=${encodeURIComponent(item.designCode)}&boothWidth=${item.width}&boothDepth=${item.depth}&boothHeight=${item.height}`;

  return (
    <div className="pt-32 md:pt-36 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.title,
          sku: item.designCode,
          description: item.description,
          image: item.thumbnail,
          brand: { "@type": "Brand", name: "ASO SYSTEM" },
          additionalProperty: [
            { "@type": "PropertyValue", name: "width", value: `${item.width}m` },
            { "@type": "PropertyValue", name: "depth", value: `${item.depth}m` },
            { "@type": "PropertyValue", name: "height", value: `${item.height}m` },
            { "@type": "PropertyValue", name: "frameType", value: item.frameType },
          ],
        }}
      />

      <Container className="pt-12">
        <nav className="text-xs text-aso-muted mb-6">
          <Link href="/booth-design" className="hover:text-aso-primary">시스템부스디자인</Link> / 디자인번호 : {item.designCode}
        </nav>

        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <p className="font-num text-eyebrow text-aso-primary mb-2">{item.designCode}</p>
              <h1 className="text-subheading text-aso-black mb-3">{item.title}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="font-num text-xs px-2.5 py-1 rounded-full bg-aso-offwhite border border-aso-line text-aso-charcoal-2">
                  {item.width}×{item.depth}m
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-aso-offwhite border border-aso-line text-aso-charcoal-2">
                  {boothTypeLabel[item.boothType]}
                </span>
                <span className="font-num text-xs px-2.5 py-1 rounded-full bg-aso-offwhite border border-aso-line text-aso-charcoal-2">
                  {item.openSides}면 오픈
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-aso-offwhite border border-aso-line text-aso-charcoal-2">
                  {frameTypeLabel[item.frameType]}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-aso-charcoal-2/85 mb-6">{item.description}</p>

              {item.features.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-aso-muted mb-2 tracking-wide">주요 구성요소</p>
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((f) => (
                      <span key={f.feature} className="text-sm px-3 py-1.5 bg-aso-offwhite border border-aso-line">
                        {boothFeatureLabel[f.feature]}
                        {f.note && <span className="text-aso-muted"> · {f.note}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.styleTags.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-aso-muted mb-2 tracking-wide">디자인 스타일</p>
                  <div className="flex flex-wrap gap-2">
                    {item.styleTags.map((s) => (
                      <span key={s} className="text-sm px-3 py-1.5 bg-aso-black text-white">
                        {boothStyleLabel[s]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-aso-line pt-4">
                <p className="text-xs font-semibold text-aso-muted mb-1.5 tracking-wide">정보 및 시공 구성 요소</p>
                <p className="text-sm text-aso-charcoal-2/80 font-num">{item.materialSummary}</p>
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-aso-offwhite">
              <SafeImage src={item.thumbnail} alt={`${item.title} 대표 렌더링`} fill preload className="object-contain" />
            </div>
          </div>

          <div className="flex justify-center py-6 border-t border-aso-line/60">
            <ButtonLink href={inquiryHref} variant="accent" className="px-10">
              이 디자인으로 문의하기
            </ButtonLink>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-24 pt-16 border-t border-aso-line">
            <h2 className="text-subheading text-aso-black mb-8">비슷한 디자인</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similar.map((s) => (
                <BoothCard key={s.id} design={s} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
