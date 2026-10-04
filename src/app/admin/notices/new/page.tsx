import { requireAdmin } from "@/lib/auth";
import { NoticeForm } from "@/app/admin/notices/notice-form";
import { saveNewNotice } from "@/app/admin/notices/actions";

export default async function NewNoticePage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">공지 작성</h1>
      <NoticeForm action={saveNewNotice} />
    </div>
  );
}
