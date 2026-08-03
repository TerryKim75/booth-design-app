"use client";

import { RowActions } from "@/components/admin/row-actions";
import { setRentalStatus, setRentalFeatured, duplicateExistingRental, removeRental } from "@/app/admin/rentals/actions";
import type { ContentStatus } from "@/types/domain";

export function RentalRowActions({ id, status, featured }: { id: string; status: ContentStatus; featured: boolean }) {
  return (
    <RowActions
      editHref={`/admin/rentals/${id}/edit`}
      status={status}
      featured={featured}
      onStatusChange={(s) => setRentalStatus(id, s)}
      onToggleFeatured={(v) => setRentalFeatured(id, v)}
      onDuplicate={() => duplicateExistingRental(id)}
      onDelete={() => removeRental(id)}
    />
  );
}
