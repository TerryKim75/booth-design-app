"use client";

import { useActionState } from "react";
import { TextField, SelectField, SubmitButton } from "@/components/admin/form-fields";
import { createNewUser, type FormState } from "@/app/admin/users/actions";

export function NewUserForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createNewUser, {});

  return (
    <form action={formAction} className="max-w-md space-y-4 bg-white border border-aso-line p-6">
      <TextField name="name" label="이름" required />
      <TextField name="email" label="이메일" type="email" required />
      <TextField name="password" label="임시 비밀번호 (10자 이상, 영문+숫자 포함)" type="password" required />
      <SelectField name="role" label="권한" defaultValue="staff" options={["admin", "staff"]} labels={{ admin: "관리자", staff: "담당자" }} />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton label="계정 생성" />
    </form>
  );
}
