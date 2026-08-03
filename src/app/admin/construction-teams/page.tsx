import { listConstructionTeams } from "@/lib/data/construction-teams";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TeamRowActions } from "@/app/admin/construction-teams/team-row-actions";

export default async function AdminConstructionTeamsPage() {
  const teams = await listConstructionTeams();

  return (
    <div>
      <AdminPageHeader title="시공팀 관리" total={teams.length} newHref="/admin/construction-teams/new" newLabel="시공팀 등록" />
      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">시공팀명</th>
              <th className="p-3 font-medium">담당자</th>
              <th className="p-3 font-medium">연락처</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-b border-aso-line last:border-0">
                <td className="p-3 font-medium text-aso-black">{t.name}</td>
                <td className="p-3 text-aso-charcoal-2/80">{t.contactName || "-"}</td>
                <td className="p-3 font-num text-aso-charcoal-2/70">{t.contactPhone || "-"}</td>
                <td className="p-3">
                  <TeamRowActions id={t.id} active={t.active} />
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-aso-muted">등록된 시공팀이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
