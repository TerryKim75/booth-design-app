import { z } from "zod";

export const rentalFormSchema = z.object({
  productCode: z.string().min(1, "제품 코드를 입력해주세요."),
  slug: z.string().min(1, "슬러그를 입력해주세요.").regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈만 사용하세요."),
  name: z.string().min(1, "제품명을 입력해주세요."),
  category: z.enum(["chair", "table", "sofa", "counter", "display", "showcase", "refrigerator", "tv_monitor", "lighting", "kitchen", "accessories"]),
  width: z.coerce.number().positive(),
  depth: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  color: z.string().optional().default(""),
  material: z.string().optional().default(""),
  description: z.string().optional().default(""),
  images: z.string().optional().default(""),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock", "on_order"]),
  priceVisible: z.union([z.literal("on"), z.literal(true)]).optional().transform((v) => Boolean(v)),
  rentalPrice: z.coerce.number().optional(),
  featured: z.union([z.literal("on"), z.literal(true)]).optional().transform((v) => Boolean(v)),
  status: z.enum(["draft", "published", "unpublished"]),
  sortOrder: z.coerce.number().int().default(0),
});
