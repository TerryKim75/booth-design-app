import { z } from "zod";

export const inquiryFormSchema = z.object({
  company: z.string().min(1, "회사명을 입력해주세요.").max(120),
  contactName: z.string().min(1, "담당자명을 입력해주세요.").max(60),
  email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일 형식이 아닙니다."),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(/^[0-9+\-() ]{7,20}$/, "올바른 전화번호 형식이 아닙니다."),
  exhibition: z.string().max(120).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  boothWidth: z.coerce.number().min(0).max(500).optional(),
  boothDepth: z.coerce.number().min(0).max(500).optional(),
  boothHeight: z.coerce.number().min(0).max(50).optional(),
  budget: z.string().max(120).optional().or(z.literal("")),
  boothDesignId: z.string().optional().or(z.literal("")),
  boothDesignCode: z.string().optional().or(z.literal("")),
  requirements: z.string().min(10, "상세 요청사항을 10자 이상 입력해주세요.").max(4000),
  privacyConsent: z
    .union([z.literal("on"), z.literal(true), z.literal("true")])
    .refine((v) => Boolean(v), { message: "개인정보 수집·이용에 동의해야 문의를 제출할 수 있습니다." }),
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;
