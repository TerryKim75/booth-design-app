import { z } from "zod";

const passwordField = z
  .string()
  .min(10, "비밀번호는 10자 이상이어야 합니다.")
  .regex(/[A-Za-z]/, "영문을 포함해야 합니다.")
  .regex(/[0-9]/, "숫자를 포함해야 합니다.");

/**
 * 비밀번호 정책: 최소 10자, 영문/숫자/특수문자 중 2종류 이상 조합.
 */
export const newUserSchema = z
  .object({
    name: z.string().min(1, "이름을 입력해주세요."),
    email: z.string().email("올바른 이메일 형식이 아닙니다."),
    password: passwordField,
    role: z.enum(["admin", "staff", "client"]),
    clientId: z.string().uuid().optional(),
  })
  .refine((data) => data.role !== "client" || !!data.clientId, {
    message: "고객사 계정은 소속 고객사를 지정해야 합니다.",
    path: ["clientId"],
  });

export const resetPasswordSchema = z.object({
  password: passwordField,
});
