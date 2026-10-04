"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, SubmitButton } from "@/components/admin/form-fields";
import type { FormState } from "@/app/admin/notices/actions";
import type { Notice } from "@/types/domain";

export function NoticeForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: Notice;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="공지 내용">
        <TextField name="title" label="제목" defaultValue={initial?.title} required full />
        <TextArea name="body" label="내용" defaultValue={initial?.body} rows={8} full />
      </Section>

      <Section legend="게시 설정">
        <SelectField
          name="status"
          label="상태"
          defaultValue={initial?.status ?? "published"}
          options={["draft", "published", "unpublished"]}
          labels={{ draft: "Draft", published: "게시됨", unpublished: "게시 중지" }}
        />
        <label className="flex items-center gap-2 text-sm text-aso-black self-end min-h-11">
          <input type="checkbox" name="isPinned" defaultChecked={initial?.isPinned} className="size-4" />
          상단 고정
        </label>
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
