"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader2, CheckCircle2 } from "lucide-react";
import { rentalCategoryLabel } from "@/lib/labels";
import { saveEquipmentSelection } from "@/app/portal/(app)/projects/[id]/equipment/actions";
import type { EquipmentSelectionLine } from "@/lib/data/client-project-equipment";
import type { ClientProjectEquipmentItem, RentalCategory, RentalItem } from "@/types/domain";

const CATEGORY_ORDER: RentalCategory[] = [
  "chair", "table", "sofa", "counter", "display", "showcase",
  "refrigerator", "tv_monitor", "lighting", "kitchen", "accessories",
];

function priceLabel(item: RentalItem): string {
  if (!item.priceVisible || item.rentalPrice == null) return "가격 문의";
  return `${item.rentalPrice.toLocaleString("ko-KR")}원`;
}

export function EquipmentPicker({
  projectId,
  rentalItems,
  initialItems,
}: {
  projectId: string;
  rentalItems: RentalItem[];
  initialItems: ClientProjectEquipmentItem[];
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<RentalCategory | "all">("all");
  const [cart, setCart] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const i of initialItems) if (i.rentalItemId) map[i.rentalItemId] = i.qty;
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(
    () => (activeCategory === "all" ? rentalItems : rentalItems.filter((i) => i.category === activeCategory)),
    [rentalItems, activeCategory]
  );

  const setQty = (id: string, qty: number) => {
    setSaved(false);
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  };

  const cartEntries = Object.entries(cart);
  const cartCount = cartEntries.reduce((sum, [, qty]) => sum + qty, 0);
  const cartItems = cartEntries
    .map(([id, qty]) => { const item = rentalItems.find((i) => i.id === id); return item ? { item, qty } : null; })
    .filter(Boolean) as { item: RentalItem; qty: number }[];
  const allPriced = cartItems.every((c) => c.item.priceVisible && c.item.rentalPrice != null);
  const total = cartItems.reduce((sum, c) => sum + (c.item.rentalPrice ?? 0) * c.qty, 0);

  async function handleSubmit() {
    setSaving(true);
    setError("");
    const lines: EquipmentSelectionLine[] = cartItems.map(({ item, qty }) => ({
      rentalItemId: item.id,
      name: item.name,
      category: item.category,
      qty,
      unitPrice: item.priceVisible ? item.rentalPrice : null,
    }));
    const res = await saveEquipmentSelection(projectId, lines);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      router.push(`/portal/projects/${projectId}`);
      router.refresh();
    } else {
      setError(res.error ?? "저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`text-xs font-semibold rounded-full border px-3.5 py-2 transition-colors ${activeCategory === "all" ? "bg-aso-primary text-white border-aso-primary" : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary"}`}
        >
          전체
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-semibold rounded-full border px-3.5 py-2 transition-colors ${activeCategory === cat ? "bg-aso-primary text-white border-aso-primary" : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary"}`}
          >
            {rentalCategoryLabel[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {filtered.map((item) => {
          const qty = cart[item.id] ?? 0;
          return (
            <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden flex flex-col ${qty > 0 ? "border-aso-primary" : "border-aso-line"}`}>
              <div className="relative aspect-square bg-aso-offwhite overflow-hidden">
                {item.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.images[0]} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-aso-silver text-xs">이미지 없음</div>
                )}
              </div>
              <div className="flex flex-col flex-1 p-2.5">
                <h3 className="font-semibold text-aso-black text-xs leading-snug line-clamp-2 mb-1.5">{item.name}</h3>
                <p className="text-aso-primary font-bold text-xs mb-2 font-num">{priceLabel(item)}</p>
                <div className="mt-auto">
                  {qty === 0 ? (
                    <button
                      onClick={() => setQty(item.id, 1)}
                      className="w-full flex items-center justify-center gap-1 rounded-full border border-aso-primary text-aso-primary text-[10px] font-semibold hover:bg-aso-primary hover:text-white min-h-8"
                    >
                      <Plus size={11} />
                      담기
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-full border border-aso-primary/30 bg-aso-primary/5 px-2 py-1">
                      <button onClick={() => setQty(item.id, qty - 1)} className="w-5 h-5 flex items-center justify-center rounded-full text-aso-primary hover:bg-aso-primary/10" aria-label="수량 감소">
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-aso-primary font-num">{qty}</span>
                      <button onClick={() => setQty(item.id, qty + 1)} className="w-5 h-5 flex items-center justify-center rounded-full text-aso-primary hover:bg-aso-primary/10" aria-label="수량 증가">
                        <Plus size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-aso-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-bold text-aso-black">{cartCount}개 선택됨</span>
            {allPriced && cartItems.length > 0 && (
              <span className="text-aso-muted font-num ml-2">· {total.toLocaleString("ko-KR")}원</span>
            )}
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-aso-primary text-white font-semibold hover:bg-aso-primary-dark disabled:opacity-60 text-sm px-6 min-h-11"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle2 size={15} /> : null}
            {saving ? "저장 중..." : "등록완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
