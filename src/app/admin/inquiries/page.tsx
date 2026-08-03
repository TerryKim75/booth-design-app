import Link from "next/link";
import { listInquiries } from "@/lib/data/inquiries";
import { AdminPageHeader } from "@/components/admin/page-header";
import { inquiryStatusLabel } from "@/lib/labels";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUSES = ["new", "reviewing", "assigned", "quoting", "replied", "on_hold", "closed"] as const;

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status as (typeof STATUSES)[number] | undefined;
  const { items, total } = await listInquiries({ status: status ? [status] : undefined, pageSize: 200 });

  return (
    <div>
      <AdminPageHeader title="문의 관리" total={total} />

      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/admin/inquiries" className={`text-xs font-semibold px-3 py-1.5 border ${!status ? "bg-aso-black text-white border-aso-black" : "border-aso-line"}`}>
          전체
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/inquiries?status=${s}`} className={`text-xs font-semibold px-3 py-1.5 border ${status === s ? "bg-aso-black text-white border-aso-black" : "border-aso-line"}`}>
            {inquiryStatusLabel[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">문의번호</th>
              <th className="p-3 font-medium">회사명</th>
              <th className="p-3 font-medium">담당자명</th>
              <th className="p-3 font-medium">전시회</th>
              <th className="p-3 font-medium">상태</th>
              <th className="p-3 font-medium">접수일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((inq) => (
              <tr key={inq.id} className="border-b border-aso-line last:border-0 hover:bg-aso-offwhite">
                <td className="p-3">
                  <Link href={`/admin/inquiries/${inq.id}`} className="font-num text-aso-primary hover:underline">
                    {inq.inquiryNumber}
                  </Link>
                </td>
                <td className="p-3">{inq.company}</td>
                <td className="p-3">{inq.contactName}</td>
                <td className="p-3 text-aso-charcoal-2/70">{inq.exhibition ?? "-"}</td>
                <td className="p-3">{inquiryStatusLabel[inq.status]}</td>
                <td className="p-3 font-num text-aso-muted">{new Date(inq.createdAt).toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-aso-muted">문의가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
