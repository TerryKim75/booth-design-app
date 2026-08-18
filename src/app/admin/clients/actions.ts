"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { clientFormSchema } from "@/lib/validations/client";
import { newUserSchema, resetPasswordSchema } from "@/lib/validations/user";
import { createClient, updateClient, deleteClient, setClientStatus, type ClientInput } from "@/lib/data/clients";
import { createUserAccount, resetClientAccountPassword } from "@/lib/data/users";
import type { UserStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData): ClientInput {
  const raw = Object.fromEntries(formData.entries());
  return clientFormSchema.parse(raw);
}

export async function saveNewClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  let id: string;
  try {
    const input = parseInput(formData);
    const client = await createClient(input, profile.id);
    id = client.id;
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${id}`);
}

export async function updateExistingClient(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaffOrAdmin();
  try {
    const input = parseInput(formData);
    await updateClient(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}`);
}

export async function removeClient(id: string) {
  await requireAdmin();
  await deleteClient(id);
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function changeClientStatus(id: string, status: UserStatus) {
  await requireAdmin();
  await setClientStatus(id, status);
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
}

export interface AccountFormState {
  error?: string;
}

export async function createClientAccount(
  clientId: string,
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  await requireAdmin();
  const raw = { ...Object.fromEntries(formData.entries()), role: "client", clientId };
  const parsed = newUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  try {
    await createUserAccount(parsed.data);
  } catch (err) {
    return { error: formatActionError(err, "계정 생성 중 오류가 발생했습니다.") };
  }
  revalidatePath(`/admin/clients/${clientId}`);
  return {};
}

export async function resetClientAccountPasswordAction(
  clientId: string,
  userId: string,
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  await requireAdmin();
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  try {
    await resetClientAccountPassword(userId, parsed.data.password);
  } catch (err) {
    return { error: formatActionError(err, "비밀번호 재설정 중 오류가 발생했습니다.") };
  }
  revalidatePath(`/admin/clients/${clientId}`);
  return {};
}
