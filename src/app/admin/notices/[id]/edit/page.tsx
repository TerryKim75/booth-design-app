import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { NoticeForm } from "@/app/admin/notices/notice-form";
import { updateExistingNotice } from "@/app/admin/notices/actions";
import { getNoticeById } from "@/lib/data/notices";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNoticePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const item = await getNoticeById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">공지 수정</h1>
      <NoticeForm action={updateExistingNotice.bind(null, id)} initial={item} />
    </div>
  );
}
