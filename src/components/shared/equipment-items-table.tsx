import { rentalCategoryLabel } from "@/lib/labels";
import type { ClientProjectEquipmentItem } from "@/types/domain";

export function EquipmentItemsTable({ items }: { items: ClientProjectEquipmentItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-aso-charcoal-2/50 border border-dashed border-aso-line px-3 py-4 text-center">비품임대에서 선택한 항목이 없습니다.</p>;
  }

  const total = items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.qty, 0);
  const allPriced = items.every((i) => i.unitPrice != null);

  return (
    <div className="border border-aso-line bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-aso-line text-left text-xs text-aso-muted">
            <th className="px-3 py-2 font-semibold">품목</th>
            <th className="px-3 py-2 font-semibold">카테고리</th>
            <th className="px-3 py-2 font-semibold text-right">수량</th>
            <th className="px-3 py-2 font-semibold text-right">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-aso-line last:border-0">
              <td className="px-3 py-2 font-medium text-aso-black">{item.name}</td>
              <td className="px-3 py-2 text-aso-muted">{item.category ? rentalCategoryLabel[item.category] : "-"}</td>
              <td className="px-3 py-2 text-right font-num">{item.qty}</td>
              <td className="px-3 py-2 text-right font-num">
                {item.unitPrice != null ? `${(item.unitPrice * item.qty).toLocaleString("ko-KR")}원` : "문의"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {allPriced && (
        <div className="flex justify-between items-center px-3 py-2.5 border-t border-aso-line bg-aso-offwhite">
          <span className="text-sm font-bold text-aso-black">합계</span>
          <span className="text-sm font-bold text-aso-black font-num">{total.toLocaleString("ko-KR")}원</span>
        </div>
      )}
    </div>
  );
}
