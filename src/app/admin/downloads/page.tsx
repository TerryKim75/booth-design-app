import { listDownloadFiles } from "@/lib/data/downloads";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DownloadRowActions } from "@/app/admin/downloads/download-row-actions";
import { downloadCategoryLabel } from "@/lib/labels";

export default async function AdminDownloadListPage() {
  const { items, total } = await listDownloadFiles({ pageSize: 500 }, { includeUnpublished: true });

  return (
    <div>
      <AdminPageHeader title="다운로드 자료 관리" total={total} newHref="/admin/downloads/new" />
      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">제목</th>
              <th className="p-3 font-medium">카테고리</th>
              <th className="p-3 font-medium">버전</th>
              <th className="p-3 font-medium">형식</th>
              <th className="p-3 font-medium">공개 범위</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id} className="border-b border-aso-line last:border-0">
                <td className="p-3 font-medium text-aso-black max-w-[240px] truncate">{f.title}</td>
                <td className="p-3">{downloadCategoryLabel[f.category]}</td>
                <td className="p-3 font-num">{f.version}</td>
                <td className="p-3 font-num">{f.fileType}</td>
                <td className="p-3">{f.accessLevel === "public" ? "전체 공개" : f.accessLevel === "member" ? "로그인 사용자" : "담당자·관리자"}</td>
                <td className="p-3">
                  <DownloadRowActions id={f.id} status={f.status} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-aso-muted">등록된 자료가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
