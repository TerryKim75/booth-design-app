import Link from "next/link";
import { ProjectForm } from "@/app/admin/client-projects/project-form";
import { saveNewProject } from "@/app/admin/client-projects/actions";
import { generateNextClientProjectDesignCode } from "@/lib/data/client-projects";
import { listClients } from "@/lib/data/clients";
import { listConstructionTeams } from "@/lib/data/construction-teams";

export default async function NewClientProjectPage() {
  const [clients, teams] = await Promise.all([listClients(), listConstructionTeams()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">고객 프로젝트 신규 등록</h1>
      {clients.length === 0 ? (
        <p className="text-sm text-aso-muted">
          먼저 <Link href="/admin/clients/new" className="underline">고객사를 등록</Link>해야 프로젝트를 만들 수 있습니다.
        </p>
      ) : (
        <ProjectForm action={saveNewProject} clients={clients} teams={teams} defaultDesignCode={generateNextClientProjectDesignCode()} />
      )}
    </div>
  );
}
