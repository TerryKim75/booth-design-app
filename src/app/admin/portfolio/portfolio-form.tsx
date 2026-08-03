"use client";

import { useActionState } from "react";
import { Section, TextField, TextArea, SelectField, SubmitButton } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { FormState } from "@/app/admin/portfolio/actions";
import type { Portfolio } from "@/types/domain";

const PROJECT_TYPES = [
  ["exhibition_booth", "전시부스"], ["showroom", "쇼룸"], ["brand_space", "브랜드 공간"],
  ["corporate_office", "오피스·사옥"], ["retail_popup", "리테일·팝업"], ["event_space", "행사·이벤트"],
] as const;

export function PortfolioForm({
  action,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: Portfolio;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section legend="기본 정보">
        <TextField name="slug" label="슬러그 (URL)" defaultValue={initial?.slug} required />
        <TextField name="title" label="제목" defaultValue={initial?.title} required />
        <TextField name="client" label="고객사" defaultValue={initial?.client} required />
        <TextField name="exhibition" label="전시회명" defaultValue={initial?.exhibition} required />
        <TextField name="year" label="연도" type="number" defaultValue={initial?.year} required />
        <TextField name="country" label="국가" defaultValue={initial?.country} required />
        <TextField name="city" label="도시" defaultValue={initial?.city} required />
        <SelectField name="industry" label="산업 분야" defaultValue={initial?.industry} options={[
          "반도체·전자장비", "모빌리티·자동차", "뷰티·코스메틱", "식품·F&B", "이차전지·에너지",
          "가구·인테리어", "정부·공공 파빌리온", "오피스 가구", "기타",
        ]} freeSolo />
      </Section>

      <Section legend="부스 규격">
        <TextField name="boothWidth" label="가로 (m)" type="number" step="0.1" defaultValue={initial?.boothWidth} required />
        <TextField name="boothDepth" label="세로 (m)" type="number" step="0.1" defaultValue={initial?.boothDepth} required />
        <TextField name="boothHeight" label="높이 (m)" type="number" step="0.1" defaultValue={initial?.boothHeight} required />
        <SelectField name="systemType" label="적용 시스템" defaultValue={initial?.systemType} options={["55mm", "124mm", "mixed"]} />
        <SelectField name="projectType" label="프로젝트 유형" defaultValue={initial?.projectType} options={PROJECT_TYPES.map(([v]) => v)} labels={Object.fromEntries(PROJECT_TYPES)} />
      </Section>

      <Section legend="콘텐츠">
        <TextArea name="description" label="설명" defaultValue={initial?.description} rows={5} full />
        <ImageUploadField name="thumbnail" label="대표 이미지" bucket="portfolio-images" defaultValue={initial?.thumbnail} full />
        <ImageUploadField name="gallery" label="갤러리 이미지" bucket="portfolio-images" defaultValue={initial?.gallery.join("\n")} multiple full />
      </Section>

      <Section legend="게시 설정">
        <SelectField name="status" label="상태" defaultValue={initial?.status ?? "draft"} options={["draft", "published", "unpublished"]} labels={{ draft: "Draft", published: "게시됨", unpublished: "게시 중지" }} />
        <TextField name="sortOrder" label="노출 순서" type="number" defaultValue={initial?.sortOrder ?? 0} />
        <label className="flex items-center gap-2 text-sm min-h-11">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="w-4 h-4" />
          메인페이지 추천 콘텐츠로 지정
        </label>
      </Section>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
