"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, SubmitButton } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { rentalCategoryLabel, stockStatusLabel } from "@/lib/labels";
import type { FormState } from "@/app/admin/rentals/actions";
import type { RentalItem } from "@/types/domain";

export function RentalForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: RentalItem;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="기본 정보">
        <TextField name="productCode" label="제품 코드" defaultValue={initial?.productCode} required />
        <TextField name="slug" label="슬러그 (URL)" defaultValue={initial?.slug} required />
        <TextField name="name" label="제품명" defaultValue={initial?.name} required full />
        <SelectField name="category" label="카테고리" defaultValue={initial?.category} options={Object.keys(rentalCategoryLabel)} labels={rentalCategoryLabel} />
        <SelectField name="stockStatus" label="대여 가능 상태" defaultValue={initial?.stockStatus ?? "in_stock"} options={Object.keys(stockStatusLabel)} labels={stockStatusLabel} />
      </Section>

      <Section legend="규격">
        <TextField name="width" label="가로 (mm)" type="number" defaultValue={initial?.width} required />
        <TextField name="depth" label="세로 (mm)" type="number" defaultValue={initial?.depth} required />
        <TextField name="height" label="높이 (mm)" type="number" defaultValue={initial?.height} required />
        <TextField name="color" label="색상" defaultValue={initial?.color} />
        <TextField name="material" label="소재" defaultValue={initial?.material} />
      </Section>

      <Section legend="콘텐츠">
        <TextArea name="description" label="설명" defaultValue={initial?.description} rows={4} full />
        <ImageUploadField name="images" label="제품 이미지" bucket="rental-images" defaultValue={initial?.images.join("\n")} multiple full />
      </Section>

      <Section legend="가격 및 게시 설정">
        <label className="flex items-center gap-2 text-sm min-h-11">
          <input type="checkbox" name="priceVisible" defaultChecked={initial?.priceVisible} className="w-4 h-4" />
          가격 공개
        </label>
        <TextField name="rentalPrice" label="대여 가격 (원)" type="number" defaultValue={initial?.rentalPrice ?? undefined} />
        <SelectField name="status" label="상태" defaultValue={initial?.status ?? "draft"} options={["draft", "published", "unpublished"]} labels={{ draft: "Draft", published: "게시됨", unpublished: "게시 중지" }} />
        <TextField name="sortOrder" label="노출 순서" type="number" defaultValue={initial?.sortOrder ?? 0} />
        <label className="flex items-center gap-2 text-sm min-h-11">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="w-4 h-4" />
          메인페이지 추천 제품으로 지정
        </label>
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
