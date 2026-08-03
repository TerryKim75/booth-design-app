import { notFound } from "next/navigation";
import { getInquiryById } from "@/lib/data/inquiries";
import { listUsers } from "@/lib/data/users";
import { InquiryControls } from "@/app/admin/inquiries/inquiry-controls";
import { addNote } from "@/app/admin/inquiries/actions";
import { SubmitButton } from "@/components/admin/form-fields";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [inquiry, users] = await Promise.all([getInquiryById(id), listUsers()]);
  if (!inquiry) notFound();

  const staffUsers = users.filter((u) => u.status === "active");

  const facts: [string, string][] = [
    ["회사명", inquiry.company],
    ["담당자명", inquiry.contactName],
    ["이메일", inquiry.email],
    ["전화번호", inquiry.phone],
    ["참가 전시회명", inquiry.exhibition ?? "-"],
    ["개최 도시/국가", [inquiry.city, inquiry.country].filter(Boolean).join(", ") || "-"],
    ["행사 일정", inquiry.eventDate ?? "-"],
    ["부스 규격", inquiry.boothWidth ? `${inquiry.boothWidth}×${inquiry.boothDepth}m, 높이 ${inquiry.boothHeight}m` : "-"],
    ["예산 범위", inquiry.budget ?? "-"],
  ];

  return (
    <div className="max-w-4xl">
      <p className="font-num text-eyebrow text-aso-primary mb-2">{inquiry.inquiryNumber}</p>
      <h1 className="text-2xl font-bold text-aso-black mb-8">{inquiry.company} 문의</h1>

      <div className="bg-white border border-aso-line p-6 mb-6">
        <InquiryControls id={inquiry.id} status={inquiry.status} assigneeId={inquiry.assigneeId} staffUsers={staffUsers} />
      </div>

      <div className="bg-white border border-aso-line p-6 mb-6">
        <h2 className="font-bold text-aso-black mb-4">문의 개요</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-aso-muted text-xs mb-0.5">{label}</dt>
              <dd className="text-aso-black">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-white border border-aso-line p-6 mb-6">
        <h2 className="font-bold text-aso-black mb-3">상세 요청사항</h2>
        <p className="text-sm text-aso-charcoal-2/85 whitespace-pre-line">{inquiry.requirements}</p>
      </div>

      {inquiry.attachments.length > 0 && (
        <div className="bg-white border border-aso-line p-6 mb-6">
          <h2 className="font-bold text-aso-black mb-3">첨부파일</h2>
          <ul className="space-y-1.5 text-sm">
            {inquiry.attachments.map((a) => (
              <li key={a}>
                <a href={a} className="text-aso-primary hover:underline" target="_blank" rel="noreferrer">
                  {a.split("/").pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-aso-line p-6">
        <h2 className="font-bold text-aso-black mb-4">내부 메모</h2>
        <ul className="space-y-3 mb-5">
          {inquiry.internalNotes.map((n) => (
            <li key={n.id} className="text-sm border-b border-aso-line pb-3 last:border-0">
              <p className="text-aso-black">{n.note}</p>
              <p className="text-xs text-aso-muted mt-1">
                {n.authorName} · {new Date(n.createdAt).toLocaleString("ko-KR")}
              </p>
            </li>
          ))}
          {inquiry.internalNotes.length === 0 && <p className="text-sm text-aso-muted">작성된 메모가 없습니다.</p>}
        </ul>

        <form action={addNote.bind(null, inquiry.id)} className="flex gap-2">
          <textarea name="note" rows={2} placeholder="내부 메모 작성..." className="input flex-1 resize-none" />
          <SubmitButton label="등록" />
        </form>
      </div>
    </div>
  );
}
