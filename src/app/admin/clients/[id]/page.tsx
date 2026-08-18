import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireStaffOrAdmin } from "@/lib/auth";
import { getClientById } from "@/lib/data/clients";
import { listClientAccounts } from "@/lib/data/users";
import { listClientProjects } from "@/lib/data/client-projects";
import { ClientControls } from "@/app/admin/clients/[id]/client-controls";
import { ClientAccountForm } from "@/app/admin/clients/[id]/client-account-form";
import { ResetPasswordForm } from "@/app/admin/clients/[id]/reset-password-form";

const STAGE_LABELS: Record<string, string> = { ongoing: "진행중", completed: "완료" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await requireStaffOrAdmin();
  const client = await getClientById(id);
  if (!client) notFound();

  const isAdmin = profile.role === "admin";
  const [accounts, projects] = await Promise.all([
    isAdmin ? listClientAccounts(id) : Promise.resolve([]),
    listClientProjects({ clientId: id }),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-aso-black">{client.companyName}</h1>
          <p className="text-sm text-aso-charcoal-2/60 mt-1">
            {client.contactName} {client.contactEmail && `· ${client.contactEmail}`} {client.contactPhone && `· ${client.contactPhone}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClientControls id={client.id} status={client.status} isAdmin={isAdmin} />
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="p-2 min-h-9 min-w-9 border border-aso-line text-aso-charcoal-2 hover:border-aso-black inline-flex items-center justify-center"
            aria-label="회사 정보 수정"
          >
            <Pencil size={14} />
          </Link>
        </div>
      </div>

      {(client.address || client.note) && (
        <div className="bg-white border border-aso-line p-4 text-sm space-y-1">
          {client.address && <p><span className="text-aso-muted">주소</span> · {client.address}</p>}
          {client.note && <p className="text-aso-charcoal-2/80 whitespace-pre-line">{client.note}</p>}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-aso-black">소속 프로젝트</h2>
          <Link href="/admin/client-projects/new" className="text-xs text-aso-primary hover:underline">
            + 새 프로젝트 등록
          </Link>
        </div>
        <div className="bg-white border border-aso-line overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-aso-muted border-b border-aso-line">
                <th className="p-3 font-medium">디자인번호</th>
                <th className="p-3 font-medium">프로젝트명</th>
                <th className="p-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-aso-line last:border-0">
                  <td className="p-3 font-num text-aso-charcoal-2/70">{p.designCode}</td>
                  <td className="p-3 font-medium text-aso-black">
                    <Link href={`/admin/client-projects/${p.id}/edit`} className="hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-3">{STAGE_LABELS[p.stage]}</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-aso-muted">등록된 프로젝트가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-aso-black mb-3">고객 포털 로그인 계정</h2>
        {isAdmin ? (
          <div className="space-y-4">
            <div className="bg-white border border-aso-line overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-aso-muted border-b border-aso-line">
                    <th className="p-3 font-medium">이름</th>
                    <th className="p-3 font-medium">이메일</th>
                    <th className="p-3 font-medium">비밀번호</th>
                    <th className="p-3 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id} className="border-b border-aso-line last:border-0">
                      <td className="p-3 font-medium text-aso-black">{a.name}</td>
                      <td className="p-3 font-num text-aso-charcoal-2/70">{a.email}</td>
                      <td className="p-3 space-y-1">
                        {a.password ? (
                          <span className="font-num text-aso-charcoal-2/70">{a.password}</span>
                        ) : (
                          <p className="text-xs text-aso-muted">미확인 (재설정 필요)</p>
                        )}
                        <ResetPasswordForm key={a.password ?? "none"} clientId={client.id} userId={a.id} />
                      </td>
                      <td className="p-3">{a.status === "active" ? "활성" : "비활성"}</td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-aso-muted">생성된 로그인 계정이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <ClientAccountForm clientId={client.id} />
          </div>
        ) : (
          <p className="text-sm text-aso-muted">계정 관리는 관리자 권한이 필요합니다.</p>
        )}
      </section>
    </div>
  );
}
