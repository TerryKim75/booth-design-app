import { notFound } from "next/navigation";
import { ProjectForm } from "@/app/admin/client-projects/project-form";
import { updateExistingProject } from "@/app/admin/client-projects/actions";
import { getClientProjectById } from "@/lib/data/client-projects";
import { listClients } from "@/lib/data/clients";
import { listConstructionTeams } from "@/lib/data/construction-teams";
import { listClientProjectFilesWithUrls, groupFilesByCategory } from "@/lib/data/client-project-files";
import { listEquipmentItems } from "@/lib/data/client-project-equipment";
import { ClientProjectFilesPanel } from "@/app/admin/client-projects/[id]/client-project-files-panel";
import { EquipmentItemsTable } from "@/components/shared/equipment-items-table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientProjectPage({ params }: PageProps) {
  const { id } = await params;
  const [project, clients, teams, files, equipmentItems] = await Promise.all([
    getClientProjectById(id),
    listClients(),
    listConstructionTeams(),
    listClientProjectFilesWithUrls(id),
    listEquipmentItems(id),
  ]);
  if (!project) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">프로젝트 수정 — {project.title}</h1>
      <ProjectForm action={updateExistingProject.bind(null, id)} initial={project} clients={clients} teams={teams} />

      <div className="max-w-3xl mt-10">
        <h2 className="text-sm font-bold text-aso-black mb-4">첨부 파일</h2>
        <ClientProjectFilesPanel projectId={id} filesByCategory={groupFilesByCategory(files)} />
      </div>

      <div className="max-w-3xl mt-10">
        <h2 className="text-sm font-bold text-aso-black mb-4">비품리스트 (고객사가 비품임대에서 선택·등록)</h2>
        <EquipmentItemsTable items={equipmentItems} />
      </div>
    </div>
  );
}
