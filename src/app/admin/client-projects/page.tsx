import { listClientProjects } from "@/lib/data/client-projects";
import { listClients } from "@/lib/data/clients";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProjectRowActions } from "@/app/admin/client-projects/project-row-actions";

const STAGE_LABELS: Record<string, string> = { ongoing: "진행중", completed: "완료" };

export default async function AdminClientProjectsPage() {
  const [projects, clients] = await Promise.all([listClientProjects(), listClients()]);
  const clientNameById = new Map(clients.map((c) => [c.id, c.companyName]));

  return (
    <div>
      <AdminPageHeader title="고객 프로젝트 관리" total={projects.length} newHref="/admin/client-projects/new" newLabel="프로젝트 등록" />
      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-aso-muted border-b border-aso-line">
              <th className="p-3 font-medium">디자인번호</th>
              <th className="p-3 font-medium">프로젝트명</th>
              <th className="p-3 font-medium">고객사</th>
              <th className="p-3 font-medium">상태</th>
              <th className="p-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-aso-line last:border-0">
                <td className="p-3 font-num text-aso-charcoal-2/70">{p.designCode}</td>
                <td className="p-3 font-medium text-aso-black max-w-[240px] truncate">{p.title}</td>
                <td className="p-3">{clientNameById.get(p.clientId) ?? "-"}</td>
                <td className="p-3">{STAGE_LABELS[p.stage]}</td>
                <td className="p-3">
                  <ProjectRowActions id={p.id} stage={p.stage} />
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-aso-muted">등록된 프로젝트가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
