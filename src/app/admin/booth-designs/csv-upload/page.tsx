import Link from "next/link";
import { Download } from "lucide-react";
import { CsvUploadForm } from "@/app/admin/booth-designs/csv-upload/csv-upload-form";

export default function CsvUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-2">부스 디자인 CSV 일괄 등록</h1>
      <p className="text-sm text-aso-charcoal-2/70 mb-6">
        헤더 형식이 동일한 CSV 파일로 다수의 시스템 부스 디자인을 한 번에 등록할 수 있습니다. 등록된 디자인은
        담당자 계정일 경우 Draft 상태로 저장되며, 관리자 승인 후 게시됩니다.
      </p>
      <Link
        href="/samples/booth-design-sample.csv"
        download
        className="inline-flex items-center gap-2 text-sm font-semibold text-aso-primary hover:underline mb-8"
      >
        <Download size={16} />
        샘플 CSV 다운로드
      </Link>
      <CsvUploadForm />
    </div>
  );
}
