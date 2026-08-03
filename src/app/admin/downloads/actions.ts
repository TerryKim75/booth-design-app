"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { downloadFormSchema } from "@/lib/validations/download";
import {
  createDownloadFile, updateDownloadFile, deleteDownloadFile, type DownloadFileInput,
} from "@/lib/data/downloads";
import type { ContentStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData): DownloadFileInput {
  const raw = Object.fromEntries(formData.entries());
  return downloadFormSchema.parse(raw);
}

export async function saveNewDownload(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (profile.role === "staff") input.status = "draft";
    await createDownloadFile(input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
  redirect("/admin/downloads");
}

export async function updateExistingDownload(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (profile.role === "staff") input.status = "draft";
    await updateDownloadFile(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
  redirect("/admin/downloads");
}

export async function removeDownload(id: string) {
  await requireAdmin();
  await deleteDownloadFile(id);
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}

export async function setDownloadStatus(id: string, status: ContentStatus) {
  await requireStaffOrAdmin();
  await updateDownloadFile(id, { status });
  revalidatePath("/admin/downloads");
  revalidatePath("/downloads");
}
