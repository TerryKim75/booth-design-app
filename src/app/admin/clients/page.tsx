import Link from "next/link";
import { listClients } from "@/lib/data/clients";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function AdminClientsPage() {
  const clients = await listClients();

  return (
    <div>
      <AdminPageHeader title="고객사 관리" total={clients.length} newHref="/admin/clients/new" newLabel="고객사 등록" />
      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">회사명</th>
              <th className="p-3 font-medium">담당자</th>
              <th className="p-3 font-medium">연락처</th>
              <th className="p-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-aso-line last:border-0">
                <td className="p-3 font-medium text-aso-black">
                  <Link href={`/admin/clients/${c.id}`} className="hover:underline">
                    {c.companyName}
                  </Link>
                </td>
                <td className="p-3 text-aso-charcoal-2/80">{c.contactName || "-"}</td>
                <td className="p-3 font-num text-aso-charcoal-2/70">{c.contactEmail || c.contactPhone || "-"}</td>
                <td className="p-3">
                  <span className={c.status === "active" ? "text-aso-black" : "text-aso-muted"}>
                    {c.status === "active" ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-aso-muted">등록된 고객사가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
