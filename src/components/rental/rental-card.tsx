import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rentalCategoryLabel, stockStatusLabel } from "@/lib/labels";
import type { RentalItem } from "@/types/domain";

export function RentalCard({ item }: { item: RentalItem }) {
  return (
    <Link href={`/rental/${item.slug}`} className="group block h-full min-w-0">
      <Card className="h-full min-w-0 flex flex-col py-0 gap-0 transition-colors group-hover:border-aso-primary/40">
        <div className="relative aspect-square overflow-hidden bg-aso-offwhite shrink-0">
          <SafeImage
            src={item.images[0]}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 22vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <Badge variant="secondary" className="absolute top-3 left-3 rounded-full text-[11px] font-semibold px-2 py-1 bg-white/90 text-aso-charcoal-2">
            {stockStatusLabel[item.stockStatus]}
          </Badge>
        </div>
        <CardContent className="p-5 min-w-0 flex-1 flex flex-col">
          <p className="text-eyebrow text-aso-primary mb-1 truncate">{rentalCategoryLabel[item.category]}</p>
          <h3 className="font-bold text-aso-black leading-snug mb-1 line-clamp-2 group-hover:text-aso-primary transition-colors">
            {item.name}
          </h3>
          <p className="font-num text-xs text-aso-muted truncate">
            {item.width}×{item.depth}×{item.height}mm · {item.color}
          </p>
          {item.priceVisible && item.rentalPrice != null && (
            <p className="font-num text-sm font-semibold text-aso-black mt-2 truncate">
              {item.rentalPrice.toLocaleString("ko-KR")}원 / 회당
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
