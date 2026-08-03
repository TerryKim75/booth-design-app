"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { frameSpecFormSchema } from "@/lib/validations/frame-spec";
import { createFrameSpec, updateFrameSpec, deleteFrameSpec, type FrameSpecInput } from "@/lib/data/frame-specs";
import type { ContentStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData): FrameSpecInput {
  const raw = Object.fromEntries(formData.entries());
  const parsed = frameSpecFormSchema.parse(raw);
  return {
    ...parsed,
    specs: parsed.specs ? parsed.specs.split("\n").map((s) => s.trim()).filter(Boolean) : [],
  };
}

export async function saveNewFrameSpec(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (profile.role === "staff") input.status = "draft";
    await createFrameSpec(input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/frame-specs");
  revalidatePath("/system");
  redirect("/admin/frame-specs");
}

export async function updateExistingFrameSpec(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (profile.role === "staff") input.status = "draft";
    await updateFrameSpec(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/frame-specs");
  revalidatePath("/system");
  redirect("/admin/frame-specs");
}

export async function removeFrameSpec(id: string) {
  await requireAdmin();
  await deleteFrameSpec(id);
  revalidatePath("/admin/frame-specs");
  revalidatePath("/system");
}

export async function setFrameSpecStatus(id: string, status: ContentStatus) {
  await requireStaffOrAdmin();
  await updateFrameSpec(id, { status });
  revalidatePath("/admin/frame-specs");
  revalidatePath("/system");
}
