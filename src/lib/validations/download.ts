import { z } from "zod";

export const downloadFormSchema = z.object({
  slug: z.string().min(1, "슬러그를 입력해주세요.").regex(/^[a-z0-9-]+$/, "영문 소문자, 숫자, 하이픈만 사용하세요."),
  title: z.string().min(1, "제목을 입력해주세요."),
  category: z.enum(["3d_source", "cad_drawing", "design_manual", "assembly_manual", "graphic_guideline", "product_catalog", "specification", "other"]),
  version: z.string().min(1, "버전을 입력해주세요."),
  fileType: z.enum(["PDF", "SKP", "DWG", "3DS", "OBJ", "FBX", "MAX", "ZIP", "AI", "JPG", "PNG"]),
  fileSize: z.string().min(1, "파일 크기를 입력해주세요."),
  fileUrl: z.string().min(1, "파일 경로/URL을 입력해주세요."),
  thumbnail: z.string().optional().default(""),
  description: z.string().optional().default(""),
  accessLevel: z.enum(["public", "member", "staff"]),
  status: z.enum(["draft", "published", "unpublished"]),
});
