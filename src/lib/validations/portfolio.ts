import { z } from "zod";

export const portfolioFormSchema = z.object({
  slug: z.string().min(1, "슬러그를 입력해주세요.").regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈만 사용하세요."),
  title: z.string().min(1, "제목을 입력해주세요."),
  client: z.string().min(1, "고객사를 입력해주세요."),
  exhibition: z.string().min(1, "전시회명을 입력해주세요."),
  year: z.coerce.number().int().min(2000).max(2100),
  country: z.string().min(1, "국가를 입력해주세요."),
  city: z.string().min(1, "도시를 입력해주세요."),
  boothWidth: z.coerce.number().positive(),
  boothDepth: z.coerce.number().positive(),
  boothHeight: z.coerce.number().positive(),
  projectType: z.enum(["exhibition_booth", "showroom", "brand_space", "corporate_office", "retail_popup", "event_space"]),
  industry: z.string().optional().default(""),
  systemType: z.enum(["55mm", "124mm", "mixed"]),
  description: z.string().min(1, "설명을 입력해주세요."),
  thumbnail: z.string().min(1, "대표 이미지를 업로드해주세요."),
  gallery: z.string().optional().default(""),
  featured: z.union([z.literal("on"), z.literal(true)]).optional().transform((v) => Boolean(v)),
  status: z.enum(["draft", "published", "unpublished"]),
  sortOrder: z.coerce.number().int().default(0),
});

export type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;
