"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { newUserSchema } from "@/lib/validations/user";
import { createUserAccount, setUserStatus, setUserRole, deleteUserAccount } from "@/lib/data/users";
import type { UserRole, UserStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

export async function createNewUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = newUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  try {
    await createUserAccount(parsed.data);
  } catch (err) {
    return { error: formatActionError(err, "계정 생성 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUserStatus(id: string, status: UserStatus) {
  await requireAdmin();
  await setUserStatus(id, status);
  revalidatePath("/admin/users");
}

export async function changeUserRole(id: string, role: UserRole) {
  await requireAdmin();
  await setUserRole(id, role);
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (id === me.id) throw new Error("본인 계정은 삭제할 수 없습니다.");
  await deleteUserAccount(id);
  revalidatePath("/admin/users");
}
