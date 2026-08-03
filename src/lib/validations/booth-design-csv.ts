import { z } from "zod";
import { boothFeatureEnum } from "@/lib/validations/booth-design";

const listField = z
  .string()
  .optional()
  .default("")
  .transform((v) => v.split("|").map((s) => s.trim()).filter(Boolean));

const featuresListField = listField.pipe(z.array(boothFeatureEnum));

export const boothDesignCsvRowSchema = z.object({
  designCode: z.string().min(1, "designCode는 필수입니다."),
  title: z.string().min(1, "title은 필수입니다."),
  width: z.coerce.number().positive(),
  depth: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  boothType: z.enum(["inline", "corner", "peninsula", "island"]),
  openSides: z.coerce.number().int().min(1).max(4),
  frameType: z.enum(["55mm", "124mm", "mixed"]),
  features: featuresListField,
  styleTags: listField,
  description: z.string().optional().default(""),
  materialSummary: z.string().optional().default(""),
  thumbnail: z.string().optional().default(""),
  featured: z
    .string()
    .optional()
    .default("false")
    .transform((v) => ["true", "1", "y", "yes"].includes(v.toLowerCase())),
  status: z.enum(["draft", "published", "unpublished"]).optional().default("draft"),
});

export type BoothDesignCsvRow = z.infer<typeof boothDesignCsvRowSchema>;

export const BOOTH_DESIGN_CSV_HEADERS = [
  "designCode", "title", "width", "depth", "height", "boothType", "openSides",
  "frameType", "features", "styleTags", "description", "materialSummary", "thumbnail",
  "featured", "status",
] as const;
