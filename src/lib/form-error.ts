import { ZodError } from "zod";

/**
 * 서버 액션 catch 블록에서 사용자에게 보여줄 오류 메시지를 만든다.
 * zod의 ZodError.message는 이슈 배열을 JSON 문자열로 그대로 담고 있어
 * (err instanceof Error) 분기만으로 처리하면 원본 JSON이 화면에 그대로 노출된다.
 * ZodError는 각 필드별 한글 메시지를 모아 사람이 읽을 수 있는 문장으로 합친다.
 */
export function formatActionError(err: unknown, fallback: string): string {
  if (err instanceof ZodError) {
    return err.issues.map((issue) => issue.message).join(" / ");
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
