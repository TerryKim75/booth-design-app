import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { listPortfolios } from "@/lib/data/portfolio";
import { listBoothDesigns } from "@/lib/data/booth-designs";
import { listRentalItems } from "@/lib/data/rentals";
import { listDownloadFiles } from "@/lib/data/downloads";
import { listInquiries, getInquiryDashboardStats } from "@/lib/data/inquiries";
import { listClientSignupRequests } from "@/lib/data/client-signup-requests";
import { inquiryStatusLabel } from "@/lib/labels";
import { listNotices } from "@/lib/data/notices";
import { requireStaffOrAdmin } from "@/lib/auth";
import { Megaphone, Pin } from "lucide-react";

export default async function AdminDashboardPage() {
  const [portfolio, booth, rental, downloads, inquiryStats, recentInquiries, pendingSignupRequests, notices, profile] = await Promise.all([
    listPortfolios({ pageSize: 1 }, { includeUnpublished: true }),
    listBoothDesigns({ pageSize: 1 }, { includeUnpublished: true }),
    listRentalItems({ pageSize: 1 }, { includeUnpublished: true }),
    listDownloadFiles({ pageSize: 1 }, { includeUnpublished: true }),
    getInquiryDashboardStats(),
    listInquiries({ pageSize: 5 }),
    listClientSignupRequests({ status: ["pending"] }),
    // 공지 조회 실패(마이그레이션 미적용 등)로 대시보드 전체가 깨지지 않도록 빈 목록으로 대체
    listNotices({ limit: 5 }).catch((err) => {
      unstable_rethrow(err);
      console.error("[notices] 대시보드 공지 조회 실패", err);
      return [];
    }),
    requireStaffOrAdmin(),
  ]);
  const isAdmin = profile.role === "admin";

  const stats = [
    { label: "전체 포트폴리오", value: portfolio.total, href: "/admin/portfolio" },
    { label: "시스템 부스 디자인", value: booth.total, href: "/admin/booth-designs" },
    { label: "전체 비품", value: rental.total, href: "/admin/rentals" },
    { label: "다운로드 자료", value: downloads.total, href: "/admin/downloads" },
    { label: "신규 문의", value: inquiryStats.new, href: "/admin/inquiries" },
    { label: "처리 중 문의", value: inquiryStats.inProgress, href: "/admin/inquiries" },
    { label: "고객사 가입 요청 (대기)", value: pendingSignupRequests.length, href: "/admin/client-signup-requests?status=pending" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">대시보드</h1>

      {(notices.length > 0 || isAdmin) && (
        <div className="bg-white border border-aso-line mb-8">
          <div className="flex items-center justify-between p-5 border-b border-aso-line">
            <h2 className="flex items-center gap-2 font-bold text-aso-black">
              <Megaphone size={18} className="text-aso-primary" />
              공지사항
            </h2>
            {isAdmin && (
              <Link href="/admin/notices" className="text-sm text-aso-primary hover:underline">
                공지 관리
              </Link>
            )}
          </div>
          {notices.length === 0 ? (
            <p className="p-5 text-sm text-aso-muted">게시된 공지가 없습니다.</p>
          ) : (
            <ul>
              {notices.map((n) => (
                <li key={n.id} className="border-b border-aso-line last:border-0">
                  <details className="group" open={n.isPinned}>
                    <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none hover:bg-aso-primary/5">
                      {n.isPinned && <Pin size={14} className="text-aso-primary shrink-0" aria-label="고정 공지" />}
                      <span className="font-medium text-aso-black flex-1">{n.title}</span>
                      <span className="text-xs text-aso-muted whitespace-nowrap">
                        {n.authorName ? `${n.authorName} · ` : ""}
                        {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </summary>
                    {n.body && (
                      <p className="px-5 pb-5 text-sm text-aso-charcoal-2/85 whitespace-pre-line">{n.body}</p>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
