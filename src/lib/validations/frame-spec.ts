import { z } from "zod";

export const frameSpecFormSchema = z.object({
  name: z.string().min(1, "프레임 이름을 입력해주세요."),
  description: z.string().optional().default(""),
  specs: z.string().optional().default(""),
  image: z.string().optional().default(""),
  applicationImage: z.string().optional().default(""),
  status: z.enum(["draft", "published", "unpublished"]),
  sortOrder: z.coerce.number().int().default(0),
});
