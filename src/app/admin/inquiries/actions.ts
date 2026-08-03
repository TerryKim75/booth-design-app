"use server";

import { revalidatePath } from "next/cache";
import { requireStaffOrAdmin } from "@/lib/auth";
import { updateInquiryStatus, assignInquiry, addInquiryNote } from "@/lib/data/inquiries";
import type { InquiryStatus } from "@/types/domain";

export async function changeInquiryStatus(id: string, status: InquiryStatus) {
  await requireStaffOrAdmin();
  await updateInquiryStatus(id, status);
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function changeInquiryAssignee(id: string, assigneeId: string | null) {
  await requireStaffOrAdmin();
  await assignInquiry(id, assigneeId);
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
}

export async function addNote(id: string, formData: FormData) {
  const profile = await requireStaffOrAdmin();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;
  await addInquiryNote(id, profile.id, profile.name, note);
  revalidatePath(`/admin/inquiries/${id}`);
}
