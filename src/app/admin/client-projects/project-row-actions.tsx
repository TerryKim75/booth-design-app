"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";
import { setProjectStage, removeProject } from "@/app/admin/client-projects/actions";
import type { ClientProjectStage } from "@/types/domain";

export function ProjectRowActions({ id, stage }: { id: string; stage: ClientProjectStage }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <select
        value={stage}
        disabled={pending}
        onChange={(e) => startTransition(() => setProjectStage(id, e.target.value as ClientProjectStage))}
        className="text-xs border border-aso-line px-2 py-1.5 min-h-9"
        aria-label="진행 상태"
      >
        <option value="ongoing">진행중</option>
        <option value="completed">완료</option>
      </select>

      <Link href={`/admin/client-projects/${id}/edit`} className="p-2 min-h-9 min-w-9 border border-aso-line text-aso-charcoal-2 hover:border-aso-black inline-flex items-center justify-center" aria-label="수정">
        <Pencil size={14} />
      </Link>

      <button
        onClick={() => {
          if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
          }
          startTransition(() => removeProject(id));
        }}
        disabled={pending}
        className={`p-2 min-h-9 min-w-9 border ${confirmDelete ? "bg-red-600 text-white border-red-600" : "border-aso-line text-aso-muted hover:text-red-600 hover:border-red-300"}`}
        aria-label={confirmDelete ? "삭제 확정" : "삭제"}
        title={confirmDelete ? "다시 누르면 삭제됩니다" : "삭제"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
