"use client";

import { RowActions } from "@/components/admin/row-actions";
import { setNoticeStatus, setNoticePinned, removeNotice } from "@/app/admin/notices/actions";
import type { ContentStatus } from "@/types/domain";

export function NoticeRowActions({ id, status, isPinned }: { id: string; status: ContentStatus; isPinned: boolean }) {
  return (
    <RowActions
      editHref={`/admin/notices/${id}/edit`}
      status={status}
      featured={isPinned}
      onStatusChange={(s) => setNoticeStatus(id, s)}
      onToggleFeatured={(next) => setNoticePinned(id, next)}
      onDelete={() => removeNotice(id)}
    />
  );
}
