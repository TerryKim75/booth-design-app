import { listFrameSpecs } from "@/lib/data/frame-specs";
import { AdminPageHeader } from "@/components/admin/page-header";
import { FrameSpecRowActions } from "@/app/admin/frame-specs/frame-spec-row-actions";
import { SafeImage } from "@/components/ui/safe-image";

export default async function AdminFrameSpecListPage() {
  const items = await listFrameSpecs({ includeUnpublished: true });

  return (
    <div>
      <AdminPageHeader title="Frame Specification 관리" total={items.length} newHref="/admin/frame-specs/new" />
      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">이미지</th>
              <th className="p-3 font-medium">이름</th>
              <th className="p-3 font-medium">규격 항목</th>
              <th className="p-3 font-medium">순서</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id} className="border-b border-aso-line last:border-0">
                <td className="p-3">
                  <div className="relative w-14 h-14 bg-aso-offwhite">
                    <SafeImage src={f.image} alt={f.name} fill className="object-cover" />
                  </div>
                </td>
                <td className="p-3 font-medium text-aso-black max-w-[220px] truncate">{f.name}</td>
                <td className="p-3 text-aso-charcoal-2/70">{f.specs.length}개</td>
                <td className="p-3 font-num text-aso-muted">{f.sortOrder}</td>
                <td className="p-3">
                  <FrameSpecRowActions id={f.id} status={f.status} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-aso-muted">등록된 프레임 규격이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
