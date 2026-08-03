import { notFound } from "next/navigation";
import { DownloadForm } from "@/app/admin/downloads/download-form";
import { updateExistingDownload } from "@/app/admin/downloads/actions";
import { getDownloadById } from "@/lib/data/downloads";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDownloadPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getDownloadById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">다운로드 자료 수정 — {item.title}</h1>
      <DownloadForm action={updateExistingDownload.bind(null, id)} initial={item} />
    </div>
  );
}
