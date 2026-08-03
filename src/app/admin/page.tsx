import Link from "next/link";
import { listPortfolios } from "@/lib/data/portfolio";
import { listBoothDesigns } from "@/lib/data/booth-designs";
import { listRentalItems } from "@/lib/data/rentals";
import { listDownloadFiles } from "@/lib/data/downloads";
import { listInquiries, getInquiryDashboardStats } from "@/lib/data/inquiries";
import { inquiryStatusLabel } from "@/lib/labels";

export default async function AdminDashboardPage() {
  const [portfolio, booth, rental, downloads, inquiryStats, recentInquiries] = await Promise.all([
    listPortfolios({ pageSize: 1 }, { includeUnpublished: true }),
    listBoothDesigns({ pageSize: 1 }, { includeUnpublished: true }),
    listRentalItems({ pageSize: 1 }, { includeUnpublished: true }),
    listDownloadFiles({ pageSize: 1 }, { includeUnpublished: true }),
    getInquiryDashboardStats(),
    listInquiries({ pageSize: 5 }),
  ]);

  const stats = [
    { label: "전체 포트폴리오", value: portfolio.total, href: "/admin/portfolio" },
    { label: "시스템 부스 디자인", value: booth.total, href: "/admin/booth-designs" },
    { label: "전체 비품", value: rental.total, href: "/admin/rentals" },
    { label: "다운로드 자료", value: downloads.total, href: "/admin/downloads" },
    { label: "신규 문의", value: inquiryStats.new, href: "/admin/inquiries" },
    { label: "처리 중 문의", value: inquiryStats.inProgress, href: "/admin/inquiries" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">대시보드</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-aso-line p-5 hover:border-aso-black transition-colors">
            <p className="font-num text-3xl font-bold text-aso-black">{s.value}</p>
            <p className="text-xs text-aso-charcoal-2/60 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-aso-line">
        <div className="flex items-center justify-between p-5 border-b border-aso-line">
          <h2 className="font-bold text-aso-black">최근 문의</h2>
          <Link href="/admin/inquiries" className="text-sm text-aso-primary hover:underline">
            전체 보기
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-4 font-medium">문의번호</th>
              <th className="p-4 font-medium">회사명</th>
              <th className="p-4 font-medium">담당자</th>
              <th className="p-4 font-medium">상태</th>
              <th className="p-4 font-medium">접수일</th>
            </tr>
          </thead>
          <tbody>
            {recentInquiries.items.map((inq) => (
              <tr key={inq.id} className="border-b border-aso-line last:border-0">
                <td className="p-4">
                  <Link href={`/admin/inquiries/${inq.id}`} className="font-num text-aso-primary hover:underline">
                    {inq.inquiryNumber}
                  </Link>
                </td>
                <td className="p-4">{inq.company}</td>
                <td className="p-4">{inq.contactName}</td>
                <td className="p-4">{inquiryStatusLabel[inq.status]}</td>
                <td className="p-4 font-num text-aso-muted">{new Date(inq.createdAt).toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
            {recentInquiries.items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-aso-muted">
                  아직 접수된 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
