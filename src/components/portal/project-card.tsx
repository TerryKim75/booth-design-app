import Link from "next/link";
import { clientProjectStageLabel } from "@/lib/labels";
import type { ClientProject } from "@/types/domain";

export function ProjectCard({ project }: { project: ClientProject }) {
  return (
    <Link
      href={`/portal/projects/${project.id}`}
      className="block bg-white border border-aso-line p-5 hover:border-aso-black transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-num text-xs text-aso-muted">{project.designCode}</span>
        <span className="text-xs font-semibold text-aso-primary">{clientProjectStageLabel[project.stage]}</span>
      </div>
      <h3 className="text-base font-bold text-aso-black">{project.title}</h3>
      {project.constructionStartDate && (
        <p className="text-xs text-aso-charcoal-2/60 mt-2">
          전시 {project.constructionStartDate.slice(0, 10)}
          {project.constructionEndDate && ` ~ ${project.constructionEndDate.slice(0, 10)}`}
        </p>
      )}
    </Link>
  );
}
