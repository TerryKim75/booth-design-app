import { z } from "zod";

export const clientFormSchema = z.object({
  companyName: z.string().min(1, "회사명을 입력해주세요."),
  contactName: z.string().optional().default(""),
  contactEmail: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  note: z.string().optional().default(""),
});
