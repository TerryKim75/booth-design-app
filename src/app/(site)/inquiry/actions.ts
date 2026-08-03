"use server";

import { inquiryFormSchema } from "@/lib/validations/inquiry";
import { createInquiry } from "@/lib/data/inquiries";
import { saveInquiryAttachment, UploadValidationError } from "@/lib/upload";

export interface SubmitInquiryResult {
  success: boolean;
  inquiryNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitInquiry(formData: FormData): Promise<SubmitInquiryResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inquiryFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "입력값을 다시 확인해주세요.", fieldErrors };
  }

  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > 5) {
    return { success: false, error: "첨부파일은 최대 5개까지 업로드할 수 있습니다." };
  }

  const attachments: string[] = [];
  for (const file of files) {
    try {
      const url = await saveInquiryAttachment(file);
      attachments.push(url);
    } catch (err) {
      if (err instanceof UploadValidationError) {
        return { success: false, error: err.message };
      }
      throw err;
    }
  }

  const v = parsed.data;

  const inquiry = await createInquiry({
    company: v.company,
    contactName: v.contactName,
    email: v.email,
    phone: v.phone,
    exhibition: v.exhibition || undefined,
    country: v.country || undefined,
    city: v.city || undefined,
    eventDate: v.eventDate || undefined,
    boothWidth: v.boothWidth,
    boothDepth: v.boothDepth,
    boothHeight: v.boothHeight,
    budget: v.budget || undefined,
    boothDesignId: v.boothDesignId || null,
    requirements: v.requirements,
    attachments,
  });

  // TODO: 관리자 알림(이메일/슬랙 등) 연동 — .env에 알림 채널이 설정되면 여기서 발송한다.

  return { success: true, inquiryNumber: inquiry.inquiryNumber };
}
