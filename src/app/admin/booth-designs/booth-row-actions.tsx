"use client";

import { RowActions } from "@/components/admin/row-actions";
import { setBoothDesignStatus, setBoothDesignFeatured, duplicateExistingBoothDesign, removeBoothDesign } from "@/app/admin/booth-designs/actions";
import type { ContentStatus } from "@/types/domain";

export function BoothRowActions({ id, status, featured }: { id: string; status: ContentStatus; featured: boolean }) {
  return (
    <RowActions
      editHref={`/admin/booth-designs/${id}/edit`}
      status={status}
      featured={featured}
      onStatusChange={(s) => setBoothDesignStatus(id, s)}
      onToggleFeatured={(v) => setBoothDesignFeatured(id, v)}
      onDuplicate={() => duplicateExistingBoothDesign(id)}
      onDelete={() => removeBoothDesign(id)}
    />
  );
}
