"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { rentalFormSchema } from "@/lib/validations/rental";
import {
  createRentalItem, updateRentalItem, deleteRentalItem, duplicateRentalItem, type RentalItemInput,
} from "@/lib/data/rentals";
import type { ContentStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData): RentalItemInput {
  const raw = Object.fromEntries(formData.entries());
  const parsed = rentalFormSchema.parse(raw);
  return {
    ...parsed,
    images: parsed.images ? parsed.images.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    priceVisible: Boolean(parsed.priceVisible),
    featured: Boolean(parsed.featured),
    rentalPrice: parsed.rentalPrice ?? null,
  };
}

export async function saveNewRental(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (profile.role === "staff") input.status = "draft";
    await createRentalItem(input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/rentals");
  revalidatePath("/rental");
  redirect("/admin/rentals");
}

export async function updateExistingRental(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (profile.role === "staff") input.status = "draft";
    await updateRentalItem(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/rentals");
  revalidatePath("/rental");
  redirect("/admin/rentals");
}

export async function removeRental(id: string) {
  await requireAdmin();
  await deleteRentalItem(id);
  revalidatePath("/admin/rentals");
  revalidatePath("/rental");
}

export async function duplicateExistingRental(id: string) {
  await requireStaffOrAdmin();
  await duplicateRentalItem(id);
  revalidatePath("/admin/rentals");
}

export async function setRentalStatus(id: string, status: ContentStatus) {
  await requireStaffOrAdmin();
  await updateRentalItem(id, { status });
  revalidatePath("/admin/rentals");
  revalidatePath("/rental");
}

export async function setRentalFeatured(id: string, featured: boolean) {
  await requireStaffOrAdmin();
  await updateRentalItem(id, { featured });
  revalidatePath("/admin/rentals");
  revalidatePath("/");
}
