"use client";

import { useTransition } from "react";
import { changeInquiryStatus, changeInquiryAssignee } from "@/app/admin/inquiries/actions";
import { inquiryStatusLabel } from "@/lib/labels";
import type { AsoUser, InquiryStatus } from "@/types/domain";

const STATUSES: InquiryStatus[] = ["new", "reviewing", "assigned", "quoting", "replied", "on_hold", "closed"];

export function InquiryControls({
  id,
  status,
  assigneeId,
  staffUsers,
}: {
  id: string;
  status: InquiryStatus;
  assigneeId: string | null;
  staffUsers: AsoUser[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="status" className="block text-xs text-aso-muted mb-1">상태</label>
        <select
          id="status"
          defaultValue={status}
          disabled={pending}
          onChange={(e) => startTransition(() => changeInquiryStatus(id, e.target.value as InquiryStatus))}
          className="input"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{inquiryStatusLabel[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assignee" className="block text-xs text-aso-muted mb-1">담당자 배정</label>
        <select
          id="assignee"
          defaultValue={assigneeId ?? ""}
          disabled={pending}
          onChange={(e) => startTransition(() => changeInquiryAssignee(id, e.target.value || null))}
          className="input"
        >
          <option value="">미배정</option>
          {staffUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
