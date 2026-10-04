import { requireAdmin } from "@/lib/auth";
import { listNotices } from "@/lib/data/notices";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NoticeRowActions } from "@/app/admin/notices/notice-row-actions";

export default async function AdminNoticeListPage() {
  await requireAdmin();
  const items = await listNotices({ includeUnpublished: true });

  return (
    <div>
      <AdminPageHeader title="공지사항" total={items.length} newHref="/admin/notices/new" newLabel="공지 작성" />
      <p className="text-sm text-aso-muted mb-6">게시된 공지는 대시보드 상단에 표시됩니다. 별표(★)를 누르면 상단에 고정됩니다.</p>

      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">제목</th>
              <th className="p-3 font-medium">작성자</th>
              <th className="p-3 font-medium">작성일</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-b border-aso-line last:border-0">
                <td className="p-3 font-medium text-aso-black max-w-[420px] truncate">
                  {n.isPinned && <span className="text-aso-primary mr-1.5">[고정]</span>}
                  {n.title}
                </td>
                <td className="p-3 text-aso-charcoal-2/70 whitespace-nowrap">{n.authorName ?? "-"}</td>
                <td className="p-3 text-aso-charcoal-2/70 whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString("ko-KR")}</td>
                <td className="p-3">
                  <NoticeRowActions id={n.id} status={n.status} isPinned={n.isPinned} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-aso-muted">등록된 공지가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
