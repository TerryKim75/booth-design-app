import { z } from "zod";

export const boothFeatureEnum = z.enum([
  "storage",
  "meeting_room",
  "semi_open_meeting_room",
  "standalone_display",
  "front_display",
  "showcase",
  "shelf",
  "video_wall",
  "lighting_graphic",
]);

const boothFeatureEntrySchema = z.object({
  feature: boothFeatureEnum,
  note: z.string().optional().default(""),
});

export const boothDesignFormSchema = z.object({
  designCode: z.string().min(1, "디자인 번호를 입력해주세요."),
  slug: z.string().min(1, "슬러그를 입력해주세요.").regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈만 사용하세요."),
  title: z.string().min(1, "제목을 입력해주세요."),
  width: z.coerce.number().positive(),
  depth: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  boothType: z.enum(["inline", "corner", "peninsula", "island"]),
  openSides: z.coerce.number().int().min(1).max(4),
  frameType: z.enum(["55mm", "124mm", "mixed"]),
  features: z
    .string()
    .optional()
    .default("[]")
    .transform((v, ctx) => {
      try {
        const parsed = JSON.parse(v || "[]");
        return z.array(boothFeatureEntrySchema).parse(parsed);
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "필수 요소 형식이 올바르지 않습니다." });
        return z.NEVER;
      }
    }),
  styleTags: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(""),
  thumbnail: z.string().optional().default(""),
  gallery: z.string().optional().default(""),
  floorPlan: z.string().optional().default(""),
  materialSummary: z.string().optional().default(""),
  featured: z.union([z.literal("on"), z.literal(true)]).optional().transform((v) => Boolean(v)),
  status: z.enum(["draft", "published", "unpublished"]),
  sortOrder: z.coerce.number().int().default(0),
});
