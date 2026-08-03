import { listRentalItems } from "@/lib/data/rentals";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RentalRowActions } from "@/app/admin/rentals/rental-row-actions";
import { SafeImage } from "@/components/ui/safe-image";
import { rentalCategoryLabel, stockStatusLabel } from "@/lib/labels";

export default async function AdminRentalListPage() {
  const { items, total } = await listRentalItems({ pageSize: 500 }, { includeUnpublished: true });

  return (
    <div>
      <AdminPageHeader title="비품 임대 관리" total={total} newHref="/admin/rentals/new" />
      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">이미지</th>
              <th className="p-3 font-medium">제품명</th>
              <th className="p-3 font-medium">코드</th>
              <th className="p-3 font-medium">카테고리</th>
              <th className="p-3 font-medium">재고</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-aso-line last:border-0">
                <td className="p-3">
                  <div className="relative w-14 h-14 bg-aso-offwhite">
                    <SafeImage src={r.images[0]} alt={r.name} fill className="object-cover" />
                  </div>
                </td>
                <td className="p-3 font-medium text-aso-black max-w-[200px] truncate">{r.name}</td>
                <td className="p-3 font-num text-aso-charcoal-2/70">{r.productCode}</td>
                <td className="p-3">{rentalCategoryLabel[r.category]}</td>
                <td className="p-3">{stockStatusLabel[r.stockStatus]}</td>
                <td className="p-3">
                  <RentalRowActions id={r.id} status={r.status} featured={r.featured} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-aso-muted">등록된 비품이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
