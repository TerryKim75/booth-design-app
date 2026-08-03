import Link from "next/link";
import { Upload } from "lucide-react";
import { listBoothDesigns } from "@/lib/data/booth-designs";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BoothDesignTable } from "@/app/admin/booth-designs/booth-design-table";

export default async function AdminBoothDesignListPage() {
  const { items, total } = await listBoothDesigns({ pageSize: 1000, sort: "latest" }, { includeUnpublished: true });

  return (
    <div>
      <AdminPageHeader
        title="시스템 부스 디자인 관리"
        total={total}
        newHref="/admin/booth-designs/new"
        extra={
          <Link href="/admin/booth-designs/csv-upload" className="inline-flex items-center gap-2 border border-aso-black text-sm font-semibold px-4 min-h-11">
            <Upload size={16} />
            CSV 일괄 등록
          </Link>
        }
      />
      <BoothDesignTable items={items} />
    </div>
  );
}
