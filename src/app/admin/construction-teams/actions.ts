"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { constructionTeamFormSchema } from "@/lib/validations/construction-team";
import {
  createConstructionTeam, updateConstructionTeam, deleteConstructionTeam, type ConstructionTeamInput,
} from "@/lib/data/construction-teams";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData): ConstructionTeamInput {
  const raw = Object.fromEntries(formData.entries());
  return constructionTeamFormSchema.parse(raw);
}

export async function saveNewTeam(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaffOrAdmin();
  try {
    await createConstructionTeam(parseInput(formData));
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/construction-teams");
  redirect("/admin/construction-teams");
}

export async function updateExistingTeam(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaffOrAdmin();
  try {
    await updateConstructionTeam(id, parseInput(formData));
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/construction-teams");
  redirect("/admin/construction-teams");
}

export async function removeTeam(id: string) {
  await requireAdmin();
  await deleteConstructionTeam(id);
  revalidatePath("/admin/construction-teams");
}

export async function toggleTeamActive(id: string, active: boolean) {
  await requireStaffOrAdmin();
  await updateConstructionTeam(id, { active });
  revalidatePath("/admin/construction-teams");
}
