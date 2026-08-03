import { requireClient } from "@/lib/auth";
import { listClientProjects } from "@/lib/data/client-projects";
import { ProjectStageTabs } from "@/components/portal/project-stage-tabs";

export default async function PortalDashboardPage() {
  const profile = await requireClient();
  const projects = await listClientProjects({ clientId: profile.clientId });

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-6">프로젝트 현황</h1>
      <ProjectStageTabs projects={projects} />
    </div>
  );
}
