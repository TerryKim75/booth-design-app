"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { updateSetting } from "@/lib/data/settings";

export interface FormState {
  success?: boolean;
  error?: string;
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        await updateSetting(key, value);
      }
    }
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}
