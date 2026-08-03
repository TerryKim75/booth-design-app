import type { ClientProject } from "@/types/domain";

const ROWS: { label: string; start: keyof ClientProject; end: keyof ClientProject }[] = [
  { label: "설치", start: "sitePrepStartDate", end: "sitePrepEndDate" },
  { label: "전시", start: "constructionStartDate", end: "constructionEndDate" },
  { label: "철거", start: "teardownStartDate", end: "teardownEndDate" },
];

function formatDate(v: string | null): string {
  return v ? v.slice(0, 10) : "-";
}

export function ScheduleTimeline({ project }: { project: ClientProject }) {
  return (
    <div className="bg-white border border-aso-line divide-y divide-aso-line">
      {ROWS.map((row) => {
        const start = project[row.start] as string | null;
        const end = project[row.end] as string | null;
        return (
          <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-semibold text-aso-black">{row.label}</span>
            <span className="font-num text-aso-charcoal-2/80">
              {start || end ? `${formatDate(start)} ~ ${formatDate(end)}` : "일정 미정"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
