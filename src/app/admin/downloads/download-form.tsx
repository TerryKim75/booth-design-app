"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, SubmitButton } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { downloadCategoryLabel } from "@/lib/labels";
import type { FormState } from "@/app/admin/downloads/actions";
import type { DownloadFile } from "@/types/domain";

const ACCESS_LABELS = { public: "전체 공개", member: "로그인 사용자만", staff: "담당자 및 관리자만" };

export function DownloadForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: DownloadFile;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="기본 정보">
        <TextField name="slug" label="슬러그 (URL)" defaultValue={initial?.slug} required />
        <TextField name="title" label="제목" defaultValue={initial?.title} required full />
        <SelectField name="category" label="카테고리" defaultValue={initial?.category} options={Object.keys(downloadCategoryLabel)} labels={downloadCategoryLabel} />
        <TextField name="version" label="버전" defaultValue={initial?.version ?? "v1.0"} required />
        <SelectField name="fileType" label="파일 형식" defaultValue={initial?.fileType ?? "PDF"} options={["PDF", "SKP", "DWG", "3DS", "OBJ", "FBX", "MAX", "ZIP", "AI", "JPG", "PNG"]} />
        <TextField name="fileSize" label="파일 크기 (예: 12.4 MB)" defaultValue={initial?.fileSize} required />
      </Section>

      <Section legend="콘텐츠">
        <TextField name="fileUrl" label="파일 경로/URL" defaultValue={initial?.fileUrl} required full />
        <ImageUploadField name="thumbnail" label="썸네일" bucket="downloads" defaultValue={initial?.thumbnail} full />
        <TextArea name="description" label="설명" defaultValue={initial?.description} rows={4} full />
      </Section>

      <Section legend="공개 범위 및 게시 설정">
        <SelectField name="accessLevel" label="공개 범위" defaultValue={initial?.accessLevel ?? "public"} options={["public", "member", "staff"]} labels={ACCESS_LABELS} />
        <SelectField name="status" label="상태" defaultValue={initial?.status ?? "draft"} options={["draft", "published", "unpublished"]} labels={{ draft: "Draft", published: "게시됨", unpublished: "게시 중지" }} />
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
