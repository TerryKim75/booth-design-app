import { z } from "zod";

const sizedElementSchema = z.object({
  enabled: z.boolean(),
  widthM: z.number().min(0).max(20),
  depthM: z.number().min(0).max(20),
  heightM: z.number().min(0).max(10),
});

const posSchema = z.object({ x: z.number(), y: z.number() });

export const boothQuoteSchema = z.object({
  companyName: z.string().min(1, "회사명을 입력해주세요.").max(120),
  contactName: z.string().min(1, "담당자명을 입력해주세요.").max(60),
  email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일 형식이 아닙니다."),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요.")
    .regex(/^[0-9+\-() ]{7,20}$/, "올바른 연락처 형식이 아닙니다."),
  eventName: z.string().max(120).optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  boothConfig: z.object({
    size: z
      .object({
        id: z.string(),
        width: z.number(),
        depth: z.number(),
        label: z.string(),
        description: z.string(),
      })
      .nullable(),
    openFaces: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    elements: z.object({
      logoText: z.string(),
      chairCount: z.number().int().min(0).max(100),
      tableCount: z.number().int().min(0).max(100),
      tvCount: z.number().int().min(0).max(100),
      hasReception: z.boolean(),
      storage: sizedElementSchema,
      meetingRoom: sizedElementSchema,
      lightingType: z.enum(["basic", "led", "spotlight"]),
      graphicCoverage: z.enum(["none", "partial", "full"]),
    }),
    positions: z.object({
      tables: z.array(posSchema),
      chairs: z.array(posSchema),
      tvs: z.array(posSchema),
      reception: posSchema,
      storage: posSchema,
      meetingRoom: posSchema,
    }),
  }),
});

export type BoothQuoteInput = z.infer<typeof boothQuoteSchema>;
