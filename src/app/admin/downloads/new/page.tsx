import { DownloadForm } from "@/app/admin/downloads/download-form";
import { saveNewDownload } from "@/app/admin/downloads/actions";

export default function NewDownloadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">다운로드 자료 신규 등록</h1>
      <DownloadForm action={saveNewDownload} />
    </div>
  );
}
