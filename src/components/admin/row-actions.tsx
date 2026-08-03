"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Trash2, Star, Pencil } from "lucide-react";
import type { ContentStatus } from "@/types/domain";

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "게시됨" },
  { value: "unpublished", label: "게시 중지" },
];

export function RowActions({
  editHref,
  status,
  featured,
  onStatusChange,
  onToggleFeatured,
  onDuplicate,
  onDelete,
  canDelete = true,
}: {
  editHref: string;
  status: ContentStatus;
  featured?: boolean;
  onStatusChange: (status: ContentStatus) => Promise<void>;
  onToggleFeatured?: (next: boolean) => Promise<void>;
  onDuplicate?: () => Promise<void>;
  onDelete: () => Promise<void>;
  canDelete?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => startTransition(() => onStatusChange(e.target.value as ContentStatus))}
        className="text-xs border border-aso-line px-2 py-1.5 min-h-9"
        aria-label="게시 상태"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {onToggleFeatured && (
        <button
          onClick={() => startTransition(() => onToggleFeatured(!featured))}
          disabled={pending}
          aria-pressed={featured}
          aria-label="추천 지정"
          className={`p-2 min-h-9 min-w-9 border ${featured ? "bg-aso-primary text-white border-aso-primary" : "border-aso-line text-aso-muted"}`}
        >
          <Star size={14} fill={featured ? "currentColor" : "none"} />
        </button>
      )}

      <Link href={editHref} className="p-2 min-h-9 min-w-9 border border-aso-line text-aso-charcoal-2 hover:border-aso-black inline-flex items-center justify-center" aria-label="수정">
        <Pencil size={14} />
      </Link>

      {onDuplicate && (
        <button
          onClick={() => startTransition(onDuplicate)}
          disabled={pending}
          className="p-2 min-h-9 min-w-9 border border-aso-line text-aso-charcoal-2 hover:border-aso-black"
          aria-label="복제"
        >
          <Copy size={14} />
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
              return;
            }
            startTransition(onDelete);
          }}
          disabled={pending}
          className={`p-2 min-h-9 min-w-9 border ${confirmDelete ? "bg-red-600 text-white border-red-600" : "border-aso-line text-aso-muted hover:text-red-600 hover:border-red-300"}`}
          aria-label={confirmDelete ? "삭제 확정" : "삭제"}
          title={confirmDelete ? "다시 누르면 삭제됩니다" : "삭제"}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
