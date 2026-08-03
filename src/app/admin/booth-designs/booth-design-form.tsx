"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, CheckboxGroup, SubmitButton } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { FeatureChecklistField } from "@/components/admin/feature-checklist-field";
import { BoothSizeField } from "@/components/admin/booth-size-field";
import { boothTypeLabel, frameTypeLabel, boothStyleLabel } from "@/lib/labels";
import type { FormState } from "@/app/admin/booth-designs/actions";
import type { BoothDesign } from "@/types/domain";

export function BoothDesignForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: BoothDesign;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="기본 정보">
        <TextField name="designCode" label="디자인 번호" defaultValue={initial?.designCode} required />
        <TextField name="slug" label="슬러그 (URL)" defaultValue={initial?.slug} required />
        <TextField name="title" label="제목" defaultValue={initial?.title} required full />
      </Section>

      <Section legend="규격">
        <BoothSizeField defaultWidth={initial?.width} defaultDepth={initial?.depth} />
        <TextField name="height" label="최고 높이 (m)" type="number" step="0.1" defaultValue={initial?.height} required />
        <SelectField name="boothType" label="부스 유형" defaultValue={initial?.boothType} options={["inline", "corner", "peninsula", "island"]} labels={boothTypeLabel} />
        <SelectField name="openSides" label="오픈 면 수" defaultValue={String(initial?.openSides ?? 1)} options={["1", "2", "3", "4"]} />
        <SelectField name="frameType" label="프레임 타입" defaultValue={initial?.frameType} options={["55mm", "124mm", "mixed"]} labels={frameTypeLabel} />
      </Section>

      <Section legend="구성 요소 · 스타일">
        <FeatureChecklistField name="features" defaultValue={initial?.features} />
        <CheckboxGroup
          name="styleTags"
          label="디자인 스타일"
          options={["open", "semi_closed", "closed", "round_structure", "straight_structure"]}
          labels={boothStyleLabel}
          defaultValue={initial?.styleTags}
        />
      </Section>

      <Section legend="콘텐츠">
        <TextArea name="description" label="디자인 설명" defaultValue={initial?.description} rows={4} full />
        <ImageUploadField name="thumbnail" label="대표 렌더링 이미지" bucket="booth-design-images" defaultValue={initial?.thumbnail} full />
        <ImageUploadField name="gallery" label="갤러리 이미지" bucket="booth-design-images" defaultValue={initial?.gallery.join("\n")} multiple full />
        <ImageUploadField name="floorPlan" label="평면도 이미지" bucket="booth-design-images" defaultValue={initial?.floorPlan ?? ""} full />
        <TextField name="materialSummary" label="필요 자재 요약" defaultValue={initial?.materialSummary} full />
      </Section>

      <Section legend="게시 설정">
        <SelectField name="status" label="상태" defaultValue={initial?.status ?? "draft"} options={["draft", "published", "unpublished"]} labels={{ draft: "Draft", published: "게시됨", unpublished: "게시 중지" }} />
        <TextField name="sortOrder" label="노출 순서" type="number" defaultValue={initial?.sortOrder ?? 0} />
        <label className="flex items-center gap-2 text-sm min-h-11">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="w-4 h-4" />
          메인페이지 추천 디자인으로 지정
        </label>
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
