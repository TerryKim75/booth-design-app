import { z } from "zod";

const emptyToNull = (v: unknown) => (v === "" ? null : v);

export const clientProjectFormSchema = z.object({
  designCode: z.string().min(1, "디자인번호를 입력해주세요."),
  clientId: z.string().uuid("고객사를 선택해주세요."),
  title: z.string().min(1, "프로젝트명을 입력해주세요."),
  stage: z.enum(["ongoing", "completed"]),
  constructionTeamId: z.preprocess(emptyToNull, z.string().uuid().nullable()).optional().default(null),
  sitePrepStartDate: z.preprocess(emptyToNull, z.string().nullable()).optional().default(null),
  sitePrepEndDate: z.preprocess(emptyToNull, z.string().nullable()).optional().default(null),
  constructionStartDate: z.preprocess(emptyToNull, z.string().nullable()).optional().default(null),
  constructionEndDate: z.preprocess(emptyToNull, z.string().nullable()).optional().default(null),
  teardownStartDate: z.preprocess(emptyToNull, z.string().nullable()).optional().default(null),
  teardownEndDate: z.preprocess(emptyToNull, z.string().nullable()).optional().default(null),
  note: z.string().optional().default(""),
});
