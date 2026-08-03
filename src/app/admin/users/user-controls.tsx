"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleUserStatus, changeUserRole, deleteUser } from "@/app/admin/users/actions";
import type { UserRole, UserStatus } from "@/types/domain";

export function UserControls({ id, role, status, isSelf }: { id: string; role: UserRole; status: UserStatus; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={role}
        disabled={pending || isSelf}
        onChange={(e) => startTransition(() => changeUserRole(id, e.target.value as UserRole))}
        className="text-xs border border-aso-line px-2 py-1.5 min-h-9"
      >
        <option value="admin">관리자</option>
        <option value="staff">담당자</option>
      </select>
      <select
        defaultValue={status}
        disabled={pending || isSelf}
        onChange={(e) => startTransition(() => toggleUserStatus(id, e.target.value as UserStatus))}
        className="text-xs border border-aso-line px-2 py-1.5 min-h-9"
      >
        <option value="active">활성</option>
        <option value="suspended">비활성</option>
      </select>

      {!isSelf && (
        <button
          onClick={() => {
            if (!confirmDelete) {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
              return;
            }
            startTransition(() => deleteUser(id));
          }}
          disabled={pending}
          className={`p-2 min-h-9 min-w-9 border inline-flex items-center justify-center ${
            confirmDelete ? "bg-red-600 text-white border-red-600" : "border-aso-line text-aso-muted hover:text-red-600 hover:border-red-300"
          }`}
          aria-label={confirmDelete ? "삭제 확정" : "삭제"}
          title={confirmDelete ? "다시 누르면 삭제됩니다" : "삭제"}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
