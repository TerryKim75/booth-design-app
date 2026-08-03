"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { portfolioFormSchema } from "@/lib/validations/portfolio";
import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  duplicatePortfolio,
  type PortfolioInput,
} from "@/lib/data/portfolio";
import type { ContentStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData, actorId: string): PortfolioInput {
  const raw = Object.fromEntries(formData.entries());
  const parsed = portfolioFormSchema.parse(raw);
  return {
    ...parsed,
    gallery: parsed.gallery ? parsed.gallery.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    featured: Boolean(parsed.featured),
    createdBy: actorId,
  };
}

export async function saveNewPortfolio(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData, profile.id);
    // 담당자가 등록한 콘텐츠는 기본 Draft. 관리자는 그대로 지정한 상태 사용.
    if (profile.role === "staff") input.status = "draft";
    await createPortfolio(input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function updateExistingPortfolio(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData, profile.id);
    if (profile.role === "staff") input.status = "draft";
    await updatePortfolio(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function removePortfolio(id: string) {
  await requireAdmin();
  await deletePortfolio(id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function duplicateExistingPortfolio(id: string) {
  await requireStaffOrAdmin();
  await duplicatePortfolio(id);
  revalidatePath("/admin/portfolio");
}

export async function setPortfolioStatus(id: string, status: ContentStatus) {
  await requireStaffOrAdmin();
  await updatePortfolio(id, { status });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function setPortfolioFeatured(id: string, featured: boolean) {
  await requireStaffOrAdmin();
  await updatePortfolio(id, { featured });
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
}
