"use client";

import { RowActions } from "@/components/admin/row-actions";
import { setDownloadStatus, removeDownload } from "@/app/admin/downloads/actions";
import type { ContentStatus } from "@/types/domain";

export function DownloadRowActions({ id, status }: { id: string; status: ContentStatus }) {
  return (
    <RowActions
      editHref={`/admin/downloads/${id}/edit`}
      status={status}
      onStatusChange={(s) => setDownloadStatus(id, s)}
      onDelete={() => removeDownload(id)}
    />
  );
}
