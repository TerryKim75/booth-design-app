import { z } from "zod";

export const constructionTeamFormSchema = z.object({
  name: z.string().min(1, "시공팀명을 입력해주세요."),
  contactName: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  note: z.string().optional().default(""),
  active: z.union([z.literal("on"), z.literal(true)]).optional().transform((v) => Boolean(v)),
});
