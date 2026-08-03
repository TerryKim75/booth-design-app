import Link from "next/link";
import { Plus } from "lucide-react";

export function AdminPageHeader({
  title,
  total,
  newHref,
  newLabel = "새로 등록",
  extra,
}: {
  title: string;
  total?: number;
  newHref?: string;
  newLabel?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-aso-black">{title}</h1>
        {total != null && <p className="text-sm text-aso-charcoal-2/60 mt-1">총 {total}개</p>}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {newHref && (
          <Link href={newHref} className="inline-flex items-center gap-2 bg-aso-black text-white text-sm font-semibold px-4 min-h-11">
            <Plus size={16} />
            {newLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
