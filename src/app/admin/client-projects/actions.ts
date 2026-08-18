"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { clientProjectFormSchema } from "@/lib/validations/client-project";
import {
  createClientProject, updateClientProject, deleteClientProject,
  generateNextClientProjectDesignCode, type ClientProjectInput,
} from "@/lib/data/client-projects";
import { deleteClientProjectFile } from "@/lib/data/client-project-files";
import type { ClientProjectStage } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData): ClientProjectInput {
  const raw = Object.fromEntries(formData.entries());
  return clientProjectFormSchema.parse(raw);
}

export async function saveNewProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  let id: string;
  try {
    const input = parseInput(formData);
    if (!input.designCode) input.designCode = generateNextClientProjectDesignCode();
    const project = await createClientProject(input, profile.id);
    id = project.id;
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/client-projects");
  redirect(`/admin/client-projects/${id}/edit`);
}

export async function updateExistingProject(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    if (!input.designCode) input.designCode = generateNextClientProjectDesignCode();
    await updateClientProject(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/client-projects");
  revalidatePath(`/admin/client-projects/${id}/edit`);
  redirect("/admin/client-projects");
}

export async function removeProject(id: string) {
  await requireAdmin();
  await deleteClientProject(id);
  revalidatePath("/admin/client-projects");
}

export async function setProjectStage(id: string, stage: ClientProjectStage) {
  await requireStaffOrAdmin();
  await updateClientProject(id, { stage });
  revalidatePath("/admin/client-projects");
}

export async function removeProjectFile(projectId: string, fileId: string) {
  await requireAdmin();
  await deleteClientProjectFile(fileId);
  revalidatePath(`/admin/client-projects/${projectId}/edit`);
}
