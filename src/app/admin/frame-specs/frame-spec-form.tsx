"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, SubmitButton } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { FormState } from "@/app/admin/frame-specs/actions";
import type { FrameSpec } from "@/types/domain";

export function FrameSpecForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: FrameSpec;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="기본 정보">
        <TextField name="name" label="프레임 이름" defaultValue={initial?.name} required full />
        <TextArea name="description" label="설명" defaultValue={initial?.description} rows={4} full />
        <TextArea name="specs" label="규격 항목 (줄바꿈으로 구분)" defaultValue={initial?.specs.join("\n")} rows={4} full />
        <ImageUploadField
          name="applicationImage"
          label="기본 이미지 (평상시 노출 · 적용 부스 사진)"
          bucket="booth-design-images"
          defaultValue={initial?.applicationImage}
          full
        />
        <ImageUploadField
          name="image"
          label="롤오버 이미지 (마우스오버 시 노출 · 프레임 이미지)"
          bucket="booth-design-images"
          defaultValue={initial?.image}
          full
        />
      </Section>

      <Section legend="게시 설정">
        <SelectField
          name="status"
          label="상태"
          defaultValue={initial?.status ?? "draft"}
          options={["draft", "published", "unpublished"]}
          labels={{ draft: "Draft", published: "게시됨", unpublished: "게시 중지" }}
        />
        <TextField name="sortOrder" label="노출 순서" type="number" defaultValue={initial?.sortOrder ?? 0} />
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
