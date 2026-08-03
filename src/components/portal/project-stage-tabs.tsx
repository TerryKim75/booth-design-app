"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/portal/project-card";
import type { ClientProject, ClientProjectStage } from "@/types/domain";

export function ProjectStageTabs({ projects }: { projects: ClientProject[] }) {
  const [stage, setStage] = useState<ClientProjectStage>("ongoing");

  const ongoing = projects.filter((p) => p.stage === "ongoing");
  const completed = projects.filter((p) => p.stage === "completed");
  const shown = stage === "ongoing" ? ongoing : completed;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-aso-line">
        {([
          ["ongoing", `진행중 (${ongoing.length})`],
          ["completed", `완료 (${completed.length})`],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStage(value)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              stage === value ? "border-aso-black text-aso-black" : "border-transparent text-aso-muted hover:text-aso-charcoal-2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-aso-muted py-8 text-center">해당하는 프로젝트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
