import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { boothTypeLabel, frameTypeLabel, boothFeatureLabel } from "@/lib/labels";
import type { BoothDesign } from "@/types/domain";

export function BoothCard({ design }: { design: BoothDesign }) {
  return (
    <Link href={`/booth-design/${design.slug}`} className="group block h-full min-w-0">
      <Card className="h-full min-w-0 flex flex-col py-0 gap-0 transition-colors group-hover:border-aso-primary/40">
        <div className="relative aspect-[4/3] overflow-hidden bg-aso-offwhite shrink-0">
          <SafeImage
            src={design.thumbnail}
            alt={`${design.title} 대표 렌더링`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {design.featured && (
            <Badge className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-wide px-2 py-1">
              추천 디자인
            </Badge>
          )}
          <Badge variant="secondary" className="absolute bottom-3 left-3 rounded-full font-num text-[11px] font-semibold tracking-widest text-white bg-aso-black/70 px-2 py-1">
            {design.designCode}
          </Badge>
        </div>
        <CardContent className="p-5 min-w-0 flex-1 flex flex-col">
          <h3 className="font-bold text-aso-black leading-snug line-clamp-2 mb-2 group-hover:text-aso-primary transition-colors">
            {design.title}
          </h3>
          <dl className="font-num text-xs text-aso-charcoal-2/80 grid grid-cols-2 gap-x-2 gap-y-1.5 mb-3">
            <div className="min-w-0 flex items-baseline gap-1">
              <dt className="text-aso-muted shrink-0">규격</dt>
              <dd className="truncate">{design.width}×{design.depth}m</dd>
            </div>
            <div className="min-w-0 flex items-baseline gap-1">
              <dt className="text-aso-muted shrink-0">최고높이</dt>
              <dd className="truncate">{design.height}m</dd>
            </div>
            <div className="min-w-0 flex items-baseline gap-1">
              <dt className="text-aso-muted shrink-0">오픈면</dt>
              <dd className="truncate">{design.openSides}면 · {boothTypeLabel[design.boothType]}</dd>
            </div>
            <div className="min-w-0 flex items-baseline gap-1">
              <dt className="text-aso-muted shrink-0">프레임</dt>
              <dd className="truncate">{frameTypeLabel[design.frameType]}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-1 mt-auto">
            {design.features.slice(0, 3).map((f) => (
              <Badge key={f.feature} variant="outline" className="rounded-full text-[11px] font-normal px-2 py-0.5 bg-aso-offwhite text-aso-charcoal-2 border-aso-line">
                {boothFeatureLabel[f.feature]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
