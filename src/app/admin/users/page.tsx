import Link from "next/link";
import { Plus } from "lucide-react";
import { listUsers } from "@/lib/data/users";
import { requireAdmin } from "@/lib/auth";
import { UserControls } from "@/app/admin/users/user-controls";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const users = await listUsers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-aso-black">사용자 관리</h1>
          <p className="text-sm text-aso-charcoal-2/60 mt-1">총 {users.length}명 · 공개 회원가입은 제공하지 않으며 계정은 관리자만 생성할 수 있습니다.</p>
        </div>
        <Link href="/admin/users/new" className="inline-flex items-center gap-2 bg-aso-black text-white text-sm font-semibold px-4 min-h-11">
          <Plus size={16} />
          계정 생성
        </Link>
      </div>

      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">이름</th>
              <th className="p-3 font-medium">이메일</th>
              <th className="p-3 font-medium">가입일</th>
              <th className="p-3 font-medium">권한 · 상태</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-aso-line last:border-0">
                <td className="p-3 font-medium text-aso-black">{u.name}</td>
                <td className="p-3 font-num text-aso-charcoal-2/70">{u.email}</td>
                <td className="p-3 font-num text-aso-muted">{new Date(u.createdAt).toLocaleDateString("ko-KR")}</td>
                <td className="p-3">
                  <UserControls id={u.id} role={u.role} status={u.status} isSelf={u.id === me.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
