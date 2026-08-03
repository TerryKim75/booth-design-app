import { listPortfolios } from "@/lib/data/portfolio";
import { AdminPageHeader } from "@/components/admin/page-header";
import { PortfolioRowActions } from "@/app/admin/portfolio/portfolio-row-actions";
import { SafeImage } from "@/components/ui/safe-image";

export default async function AdminPortfolioListPage() {
  const { items, total } = await listPortfolios({ pageSize: 500, sort: "latest" }, { includeUnpublished: true });

  return (
    <div>
      <AdminPageHeader title="포트폴리오 관리" total={total} newHref="/admin/portfolio/new" />

      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">이미지</th>
              <th className="p-3 font-medium">제목</th>
              <th className="p-3 font-medium">고객사</th>
              <th className="p-3 font-medium">연도</th>
              <th className="p-3 font-medium">규격</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-aso-line last:border-0">
                <td className="p-3">
                  <div className="relative w-16 h-12 bg-aso-offwhite">
                    <SafeImage src={p.thumbnail} alt={p.title} fill className="object-cover" />
                  </div>
                </td>
                <td className="p-3 font-medium text-aso-black max-w-[240px] truncate">{p.title}</td>
                <td className="p-3 text-aso-charcoal-2/70">{p.client}</td>
                <td className="p-3 font-num">{p.year}</td>
                <td className="p-3 font-num text-aso-charcoal-2/70">{p.boothWidth}×{p.boothDepth}m</td>
                <td className="p-3">
                  <PortfolioRowActions id={p.id} status={p.status} featured={p.featured} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-aso-muted">등록된 포트폴리오가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
