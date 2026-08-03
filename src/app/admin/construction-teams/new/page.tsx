import { TeamForm } from "@/app/admin/construction-teams/team-form";
import { saveNewTeam } from "@/app/admin/construction-teams/actions";

export default function NewTeamPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">시공팀 신규 등록</h1>
      <TeamForm action={saveNewTeam} />
    </div>
  );
}
