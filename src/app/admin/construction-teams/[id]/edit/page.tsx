import { notFound } from "next/navigation";
import { TeamForm } from "@/app/admin/construction-teams/team-form";
import { updateExistingTeam } from "@/app/admin/construction-teams/actions";
import { getConstructionTeamById } from "@/lib/data/construction-teams";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamPage({ params }: PageProps) {
  const { id } = await params;
  const team = await getConstructionTeamById(id);
  if (!team) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">시공팀 수정 — {team.name}</h1>
      <TeamForm action={updateExistingTeam.bind(null, id)} initial={team} />
    </div>
  );
}
