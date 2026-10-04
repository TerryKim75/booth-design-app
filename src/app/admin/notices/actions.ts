"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { noticeFormSchema } from "@/lib/validations/notice";
import { createNotice, updateNotice, deleteNotice } from "@/lib/data/notices";
import type { ContentStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function revalidateNotices() {
  revalidatePath("/admin/notices");
  revalidatePath("/admin");
}

function parseInput(formData: FormData) {
  return noticeFormSchema.parse(Object.fromEntries(formData.entries()));
}

export async function saveNewNotice(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireAdmin();
  try {
    await createNotice({ ...parseInput(formData), authorName: profile.name });
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidateNotices();
  redirect("/admin/notices");
}

export async function updateExistingNotice(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    await updateNotice(id, parseInput(formData));
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidateNotices();
  redirect("/admin/notices");
}

export async function removeNotice(id: string) {
  await requireAdmin();
  await deleteNotice(id);
  revalidateNotices();
}

export async function setNoticeStatus(id: string, status: ContentStatus) {
  await requireAdmin();
  await updateNotice(id, { status });
  revalidateNotices();
}

export async function setNoticePinned(id: string, isPinned: boolean) {
  await requireAdmin();
  await updateNotice(id, { isPinned });
  revalidateNotices();
}
