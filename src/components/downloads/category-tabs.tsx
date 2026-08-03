"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { downloadCategoryLabel } from "@/lib/labels";
import type { DownloadCategory } from "@/types/domain";

const CATEGORIES: DownloadCategory[] = [
  "3d_source", "cad_drawing", "design_manual", "assembly_manual",
  "graphic_guideline", "product_catalog", "specification", "other",
];

export function CategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  function go(cat?: DownloadCategory) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat);
    else params.delete("category");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      <TabButton active={!active} onClick={() => go()}>
        전체
      </TabButton>
      {CATEGORIES.map((c) => (
        <TabButton key={c} active={active === c} onClick={() => go(c)}>
          {downloadCategoryLabel[c]}
        </TabButton>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
        active
          ? "bg-aso-primary text-white border-aso-primary"
          : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary"
      }`}
    >
      {children}
    </button>
  );
}
