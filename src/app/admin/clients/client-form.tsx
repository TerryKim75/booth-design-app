"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SubmitButton } from "@/components/admin/form-fields";
import type { FormState } from "@/app/admin/clients/actions";
import type { Client } from "@/types/domain";

export function ClientForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: Client;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="회사 정보">
        <TextField name="companyName" label="회사명" defaultValue={initial?.companyName} required full />
        <TextField name="contactName" label="담당자명" defaultValue={initial?.contactName} />
        <TextField name="contactEmail" label="담당자 이메일" type="email" defaultValue={initial?.contactEmail} />
        <TextField name="contactPhone" label="담당자 연락처" defaultValue={initial?.contactPhone} />
        <TextField name="address" label="주소" defaultValue={initial?.address} full />
        <TextArea name="note" label="메모" defaultValue={initial?.note} rows={3} full />
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
