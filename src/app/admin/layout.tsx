import { requireStaffOrAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "관리자", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaffOrAdmin();

  return (
    <div className="flex min-h-screen bg-aso-offwhite">
      <AdminSidebar role={profile.role} name={profile.name} />
      <div className="flex-1 min-w-0">
        {!isSupabaseConfigured() && (
          <div className="bg-amber-100 text-amber-900 text-xs px-6 py-2 text-center">
            Supabase가 연결되지 않아 로컬 미리보기 모드로 동작합니다. 변경사항은 서버 재시작 시 초기화됩니다. (README &gt; 배포 방법 참고)
          </div>
        )}
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
