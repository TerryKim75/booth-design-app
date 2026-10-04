import { z } from "zod";

export const noticeFormSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요."),
  body: z.string().default(""),
  status: z.enum(["draft", "published", "unpublished"]),
  isPinned: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});
