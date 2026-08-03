"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SubmitButton } from "@/components/admin/form-fields";
import type { FormState } from "@/app/admin/construction-teams/actions";
import type { ConstructionTeam } from "@/types/domain";

export function TeamForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: ConstructionTeam;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <Section legend="시공팀 정보">
        <TextField name="name" label="시공팀명" defaultValue={initial?.name} required full />
        <TextField name="contactName" label="담당자명" defaultValue={initial?.contactName} />
        <TextField name="contactPhone" label="연락처" defaultValue={initial?.contactPhone} />
        <TextArea name="note" label="메모" defaultValue={initial?.note} rows={3} full />
        <label className="flex items-center gap-2 text-sm min-h-11">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="w-4 h-4" />
          운영 중 (프로젝트 배정 목록에 표시)
        </label>
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
