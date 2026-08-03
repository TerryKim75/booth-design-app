import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SafeImage } from "@/components/ui/safe-image";
import { ButtonLink } from "@/components/ui/button";
import { RentalCard } from "@/components/rental/rental-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getRentalItemBySlug, listRelatedRentalItems } from "@/lib/data/rentals";
import { rentalCategoryLabel, stockStatusLabel } from "@/lib/labels";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getRentalItemBySlug(slug);
  if (!item) return {};
  return { title: item.name, description: item.description.slice(0, 140), alternates: { canonical: `/rental/${slug}` } };
}

const availabilityByStockStatus: Record<string, string> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
  on_order: "https://schema.org/PreOrder",
};

export default async function RentalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getRentalItemBySlug(slug);
  if (!item) notFound();

  const related = await listRelatedRentalItems(item, 4);
  const inquiryHref = `/inquiry?rentalItem=${encodeURIComponent(item.name)}`;

  const facts = [
    { label: "제품 코드", value: item.productCode },
    { label: "크기", value: `${item.width}×${item.depth}×${item.height}mm` },
    { label: "색상", value: item.color },
    { label: "소재", value: item.material },
    { label: "카테고리", value: rentalCategoryLabel[item.category] },
    { label: "대여 가능 상태", value: stockStatusLabel[item.stockStatus] },
  ];

  return (
    <div className="pt-32 md:pt-36 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.name,
          sku: item.productCode,
          description: item.description,
          image: item.images[0],
          brand: { "@type": "Brand", name: "ASO SYSTEM" },
          additionalProperty: [
            { "@type": "PropertyValue", name: "width", value: `${item.width}mm` },
            { "@type": "PropertyValue", name: "depth", value: `${item.depth}mm` },
            { "@type": "PropertyValue", name: "height", value: `${item.height}mm` },
            { "@type": "PropertyValue", name: "material", value: item.material },
            { "@type": "PropertyValue", name: "color", value: item.color },
          ],
          ...(item.priceVisible && item.rentalPrice != null
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.rentalPrice,
                  priceCurrency: "KRW",
                  availability: availabilityByStockStatus[item.stockStatus],
                  businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
                },
              }
            : {}),
        }}
      />
      <Container className="pt-8">
        <nav className="text-xs text-aso-muted mb-6">
          <Link href="/rental" className="hover:text-aso-primary">비품 임대</Link> / {item.name}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="grid grid-cols-2 gap-1">
              {(item.images.length > 0 ? item.images : [""]).map((src, i) => (
                <div key={i} className={`relative aspect-square bg-aso-offwhite ${i === 0 ? "col-span-2" : ""}`}>
                  <SafeImage src={src} alt={`${item.name} 이미지 ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-eyebrow text-aso-primary mb-3">{rentalCategoryLabel[item.category]}</p>
            <h1 className="text-heading text-aso-black mb-4">{item.name}</h1>
            <p className="text-base leading-relaxed text-aso-charcoal-2/85 mb-8">{item.description}</p>

            {item.priceVisible && item.rentalPrice != null && (
              <p className="font-num text-2xl font-bold text-aso-black mb-8">
                {item.rentalPrice.toLocaleString("ko-KR")}원 <span className="text-sm font-normal text-aso-muted">/ 회당</span>
              </p>
            )}

            <dl className="space-y-3 mb-8 border-t border-b border-aso-line py-6">
              {facts.map((f) => (
                <div key={f.label} className="flex justify-between text-sm gap-4">
                  <dt className="text-aso-muted shrink-0">{f.label}</dt>
                  <dd className="text-aso-black font-medium font-num">{f.value}</dd>
                </div>
              ))}
            </dl>

            <ButtonLink href={inquiryHref} variant="accent" className="w-full">
              문의에 추가
            </ButtonLink>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-aso-line">
            <h2 className="text-subheading text-aso-black mb-8">관련 제품</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 min-w-0">
              {related.map((r) => (
                <RentalCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
