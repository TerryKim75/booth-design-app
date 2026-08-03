"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquiryFormSchema, type InquiryFormValues } from "@/lib/validations/inquiry";
import { submitInquiry } from "@/app/(site)/inquiry/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Paperclip, X } from "lucide-react";
import {
  BOOTH_SIZE_PRESETS, BOOTH_SIZE_CUSTOM, boothSizeOptionValue, boothSizeOptionLabel, findBoothSizePreset,
} from "@/lib/booth-sizes";

const SPACE_ELEMENT_OPTIONS = [
  "창고", "미팅룸", "카운터", "제품 전시대", "타워", "캐노피", "브리지", "LED 미디어",
];

export interface InquiryPrefill {
  boothDesignId?: string;
  boothDesignCode?: string;
  boothWidth?: number;
  boothDepth?: number;
  boothHeight?: number;
  requirementsPrefix?: string;
}

export function InquiryForm({ prefill }: { prefill: InquiryPrefill }) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<{ status: "idle" | "submitting" | "error"; message?: string }>({
    status: "idle",
  });
  const [result, setResult] = useState<{ inquiryNumber: string } | null>(null);
  const [spaceElements, setSpaceElements] = useState<string[]>([]);
  const [boothSizeMode, setBoothSizeMode] = useState<string>(() => {
    if (prefill.boothWidth != null && prefill.boothDepth != null) {
      const preset = findBoothSizePreset(prefill.boothWidth, prefill.boothDepth);
      return preset ? boothSizeOptionValue(preset) : BOOTH_SIZE_CUSTOM;
    }
    return "";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      boothWidth: prefill.boothWidth,
      boothDepth: prefill.boothDepth,
      boothHeight: prefill.boothHeight,
      boothDesignId: prefill.boothDesignId ?? "",
      boothDesignCode: prefill.boothDesignCode ?? "",
      requirements: prefill.requirementsPrefix ?? "",
    },
  });

  function handleBoothSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setBoothSizeMode(value);
    if (value === BOOTH_SIZE_CUSTOM || value === "") return;
    const [width, depth] = value.split("x").map(Number);
    setValue("boothWidth", width);
    setValue("boothDepth", depth);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const allowed = ["pdf", "jpg", "jpeg", "png", "zip", "dwg", "skp"];
    const maxSize = 25 * 1024 * 1024;

    for (const f of selected) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowed.includes(ext)) {
        setFileError(`허용되지 않는 파일 형식입니다: ${f.name}`);
        return;
      }
      if (f.size > maxSize) {
        setFileError(`파일 용량 초과(25MB): ${f.name}`);
        return;
      }
    }

    setFileError(null);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function onSubmit(values: InquiryFormValues) {
    setSubmitState({ status: "submitting" });

    const fd = new FormData();
    const spaceElementNote = spaceElements.length ? `[필요 공간/요소: ${spaceElements.join(", ")}]\n` : "";

    Object.entries(values).forEach(([key, value]) => {
      if (key === "requirements") {
        fd.set("requirements", `${spaceElementNote}${value ?? ""}`);
        return;
      }
      if (value != null) fd.set(key, String(value));
    });
    files.forEach((f) => fd.append("attachments", f));

    const res = await submitInquiry(fd);
    if (res.success && res.inquiryNumber) {
      setResult({ inquiryNumber: res.inquiryNumber });
      setSubmitState({ status: "idle" });
    } else {
      setSubmitState({ status: "error", message: res.error ?? "제출 중 오류가 발생했습니다." });
    }
  }

  if (result) {
    return (
      <div className="border border-aso-line p-10 text-center">
        <CheckCircle2 className="text-aso-primary mx-auto mb-4" size={40} />
        <h2 className="text-subheading text-aso-black mb-3">문의가 접수되었습니다</h2>
        <p className="text-aso-charcoal-2/70 mb-6">
          문의번호 <strong className="font-num text-aso-black">{result.inquiryNumber}</strong>로 접수되었으며,
          담당자 확인 후 입력하신 이메일 또는 전화번호로 회신드립니다.
        </p>
        <Button variant="outline" onClick={() => setResult(null)}>
          새 문의 작성하기
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      <Fieldset legend="담당자 정보">
        <Field label="회사명" error={errors.company?.message} required>
          <input {...register("company")} className="input" />
        </Field>
        <Field label="담당자명" error={errors.contactName?.message} required>
          <input {...register("contactName")} className="input" />
        </Field>
        <Field label="이메일" error={errors.email?.message} required>
          <input type="email" {...register("email")} className="input" />
        </Field>
        <Field label="전화번호" error={errors.phone?.message} required>
          <input type="tel" {...register("phone")} className="input" />
        </Field>
      </Fieldset>

      <Fieldset legend="전시회 정보">
        <Field label="참가 전시회명">
          <input {...register("exhibition")} className="input" />
        </Field>
        <Field label="개최 국가">
          <input {...register("country")} className="input" />
        </Field>
        <Field label="개최 도시">
          <input {...register("city")} className="input" />
        </Field>
        <Field label="행사 일정">
          <input type="date" {...register("eventDate")} className="input" />
        </Field>
      </Fieldset>

      <Fieldset legend="부스 규격">
        <Field label="부스 사이즈">
          <select value={boothSizeMode} onChange={handleBoothSizeChange} className="input">
            <option value="" disabled>
              선택해주세요
            </option>
            {BOOTH_SIZE_PRESETS.map((p) => (
              <option key={boothSizeOptionValue(p)} value={boothSizeOptionValue(p)}>
                {boothSizeOptionLabel(p)}
              </option>
            ))}
            <option value={BOOTH_SIZE_CUSTOM}>부스사이즈 기재</option>
          </select>
        </Field>
        {boothSizeMode === BOOTH_SIZE_CUSTOM && (
          <>
            <Field label="부스 가로 크기 (m)">
              <input type="number" step="0.1" {...register("boothWidth")} className="input" />
            </Field>
            <Field label="부스 세로 크기 (m)">
              <input type="number" step="0.1" {...register("boothDepth")} className="input" />
            </Field>
          </>
        )}
        <Field label="최고 높이 (m)">
          <input type="number" step="0.1" {...register("boothHeight")} className="input" />
        </Field>
        <Field label="예산 범위">
          <input {...register("budget")} placeholder="예: 3,000만원 ~ 5,000만원" className="input" />
        </Field>
      </Fieldset>

      <div>
        <p className="text-sm font-semibold text-aso-black mb-3">필요한 공간 및 요소</p>
        <div className="flex flex-wrap gap-2">
          {SPACE_ELEMENT_OPTIONS.map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 min-h-11 px-3 border border-aso-line text-sm cursor-pointer has-[:checked]:border-aso-black has-[:checked]:bg-aso-offwhite">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={spaceElements.includes(opt)}
                onChange={(e) =>
                  setSpaceElements((prev) => (e.target.checked ? [...prev, opt] : prev.filter((v) => v !== opt)))
                }
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <input type="hidden" {...register("boothDesignId")} />
      {prefill.boothDesignCode && (
        <Field label="참고 디자인 번호">
          <input {...register("boothDesignCode")} readOnly className="input bg-aso-offwhite" />
        </Field>
      )}

      <Field label="상세 요청사항" error={errors.requirements?.message} required>
        <textarea {...register("requirements")} rows={6} className="input resize-y" />
      </Field>

      <div>
        <p className="text-sm font-semibold text-aso-black mb-1">참고 이미지 및 문서 첨부</p>
        <p className="text-xs text-aso-muted mb-3">PDF, JPG, PNG, ZIP, DWG, SKP · 파일당 25MB 이내 · 최대 5개</p>
        <label className="inline-flex items-center gap-2 min-h-11 px-4 border border-aso-black text-sm font-semibold cursor-pointer">
          <Paperclip size={16} />
          파일 선택
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.zip,.dwg,.skp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {fileError && <p className="text-xs text-red-600 mt-2">{fileError}</p>}
        {files.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {files.map((f) => (
              <li key={f.name} className="flex items-center justify-between text-sm bg-aso-offwhite px-3 py-2">
                <span className="truncate">{f.name}</span>
                <button type="button" onClick={() => removeFile(f.name)} aria-label={`${f.name} 삭제`}>
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-aso-charcoal-2">
        <input type="checkbox" {...register("privacyConsent")} className="w-4 h-4 mt-0.5" />
        <span>
          개인정보 수집 및 이용에 동의합니다. 입력하신 정보는 문의 응대 목적으로만 사용되며, 처리 완료 후
          관련 법령에 따라 보관·파기됩니다.
          {errors.privacyConsent && <span className="block text-red-600 mt-1">{errors.privacyConsent.message}</span>}
        </span>
      </label>

      {submitState.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {submitState.message}
        </p>
      )}

      <Button type="submit" variant="accent" disabled={submitState.status === "submitting"} className="w-full md:w-auto">
        {submitState.status === "submitting" ? "제출 중..." : "문의 제출하기"}
      </Button>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-aso-black mb-4">{legend}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-aso-charcoal-2 mb-1.5">
        {label} {required && <span className="text-aso-primary">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
