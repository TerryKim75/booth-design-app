"use client";

import { useActionState, useState } from "react";
import { TextField, SubmitButton } from "@/components/admin/form-fields";
import { resetClientAccountPasswordAction, type AccountFormState } from "@/app/admin/clients/actions";

/**
 * 부모(page.tsx)가 이 컴포넌트를 key={a.password}로 렌더링한다 — 비밀번호 변경이
 * 성공하면 revalidatePath로 새 비밀번호가 내려오면서 key가 바뀌어 컴포넌트가
 * 리마운트되고, 열려 있던 입력 폼이 자연히 접힌 초기 상태로 되돌아간다.
 */
export function ResetPasswordForm({ clientId, userId }: { clientId: string; userId: string }) {
  const [open, setOpen] = useState(false);
  const action = resetClientAccountPasswordAction.bind(null, clientId, userId);
  const [state, formAction] = useActionState<AccountFormState, FormData>(action, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-aso-primary hover:underline">
        비밀번호 재설정
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
      <TextField name="password" label="새 비밀번호 (10자 이상, 영문+숫자)" type="password" required />
      <div className="flex items-center gap-2">
        <SubmitButton label="변경" />
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-aso-muted hover:underline min-h-11">
          취소
        </button>
      </div>
      {state.error && <p role="alert" className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
