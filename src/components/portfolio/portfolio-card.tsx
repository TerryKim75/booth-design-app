import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { Card, CardContent } from "@/components/ui/card";
import { projectTypeLabel } from "@/lib/labels";
import type { Portfolio } from "@/types/domain";

export function PortfolioCard({ item }: { item: Portfolio }) {
  return (
    <Link href={`/portfolio/${item.slug}`} className="group block h-full min-w-0">
      <Card className="h-full min-w-0 py-0 gap-0 transition-colors group-hover:border-aso-primary/40">
        <div className="relative aspect-[16/11] overflow-hidden bg-aso-offwhite shrink-0">
          <SafeImage
            src={item.thumbnail}
            alt={`${item.title} 대표 이미지`}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <CardContent className="p-5 min-w-0">
          <p className="text-eyebrow text-aso-primary mb-1 truncate">
            {item.country} · {item.city} · {item.year}
          </p>
          <h3 className="font-bold text-lg text-aso-black leading-snug mb-1 line-clamp-2 group-hover:text-aso-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-aso-charcoal-2/70 truncate">
            {item.client} · {item.exhibition}
          </p>
          <p className="font-num text-xs text-aso-muted mt-2 truncate">
            {item.boothWidth}×{item.boothDepth}m · {projectTypeLabel[item.projectType]}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
