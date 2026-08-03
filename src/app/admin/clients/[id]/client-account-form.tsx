"use client";

import { useActionState, useRef, useEffect } from "react";
import { TextField, SubmitButton } from "@/components/admin/form-fields";
import { createClientAccount, type AccountFormState } from "@/app/admin/clients/actions";

export function ClientAccountForm({ clientId }: { clientId: string }) {
  const action = createClientAccount.bind(null, clientId);
  const [state, formAction] = useActionState<AccountFormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-aso-offwhite border border-aso-line p-4">
      <TextField name="name" label="이름" required />
      <TextField name="email" label="이메일" type="email" required />
      <TextField name="password" label="임시 비밀번호 (10자 이상, 영문+숫자)" type="password" required />
      {state.error && <p role="alert" className="text-sm text-red-600 sm:col-span-3">{state.error}</p>}
      <div className="sm:col-span-3">
        <SubmitButton label="로그인 계정 생성" />
      </div>
    </form>
  );
}
