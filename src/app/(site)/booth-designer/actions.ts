"use server";

import { boothQuoteSchema } from "@/lib/validations/booth-quote";
import { createBoothQuote } from "@/lib/data/booth-quotes";

export interface SubmitBoothQuoteResult {
  success: boolean;
  error?: string;
}

export async function submitBoothQuote(input: unknown): Promise<SubmitBoothQuoteResult> {
  const parsed = boothQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "입력값을 다시 확인해주세요." };
  }

  try {
    await createBoothQuote(parsed.data);
    return { success: true };
  } catch {
    return { success: false, error: "견적 요청 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
