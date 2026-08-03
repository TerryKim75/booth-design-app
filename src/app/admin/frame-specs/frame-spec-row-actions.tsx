"use client";

import { RowActions } from "@/components/admin/row-actions";
import { setFrameSpecStatus, removeFrameSpec } from "@/app/admin/frame-specs/actions";
import type { ContentStatus } from "@/types/domain";

export function FrameSpecRowActions({ id, status }: { id: string; status: ContentStatus }) {
  return (
    <RowActions
      editHref={`/admin/frame-specs/${id}/edit`}
      status={status}
      onStatusChange={(s) => setFrameSpecStatus(id, s)}
      onDelete={() => removeFrameSpec(id)}
    />
  );
}
