"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { changeClientStatus, removeClient } from "@/app/admin/clients/actions";
import type { UserStatus } from "@/types/domain";

export function ClientControls({ id, status, isAdmin }: { id: string; status: UserStatus; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isAdmin) {
    return (
      <span className="text-sm text-aso-charcoal-2/70">{status === "active" ? "활성" : "비활성"}</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => startTransition(() => changeClientStatus(id, e.target.value as UserStatus))}
        className="text-sm border border-aso-line px-2 py-1.5 min-h-9"
      >
        <option value="active">활성</option>
        <option value="suspended">비활성 (로그인 차단)</option>
      </select>
      <button
        onClick={() => {
          if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
          }
          startTransition(async () => {
            await removeClient(id);
            router.push("/admin/clients");
          });
        }}
        disabled={pending}
        className={`p-2 min-h-9 min-w-9 border inline-flex items-center justify-center ${
          confirmDelete ? "bg-red-600 text-white border-red-600" : "border-aso-line text-aso-muted hover:text-red-600 hover:border-red-300"
        }`}
        aria-label={confirmDelete ? "삭제 확정" : "삭제"}
        title={confirmDelete ? "다시 누르면 삭제됩니다" : "고객사 삭제"}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
