import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getLocalStore } from "@/lib/data/local-store";
import type { AsoUser, UserRole, UserStatus } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToUser(row: DbRow): AsoUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    clientId: row.client_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** admin/staff 계정만 반환한다 — client 계정은 /admin/clients/[id] 전용 플로우로 관리한다. */
export async function listUsers(): Promise<AsoUser[]> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().users.filter((u) => u.role !== "client");
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["admin", "staff"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToUser);
}

/** 특정 고객사에 연결된 로그인 계정 목록 — 비밀번호는 보관된 경우에만 함께 반환한다. */
export async function listClientAccounts(clientId: string): Promise<AsoUser[]> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().users.filter((u) => u.role === "client" && u.clientId === clientId);
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const users = (data ?? []).map(rowToUser);
  if (users.length === 0) return users;

  const { data: passwords, error: pwError } = await supabase
    .from("client_account_passwords")
    .select("user_id, password")
    .in("user_id", users.map((u) => u.id));
  if (pwError) throw pwError;
  const passwordByUserId = new Map((passwords ?? []).map((p) => [p.user_id, p.password]));
  return users.map((u) => ({ ...u, password: passwordByUserId.get(u.id) ?? null }));
}

export interface NewUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  clientId?: string | null;
}

/**
 * 공개 회원가입은 없다 — 이 함수는 관리자 화면(/admin/users, /admin/clients/[id])에서만
 * 호출되며, Service Role 키로 Supabase Auth 계정과 profiles row를 함께 생성한다.
 */
export async function createUserAccount(input: NewUserInput): Promise<AsoUser> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const user: AsoUser = {
      id: `user-${Date.now()}`,
      name: input.name,
      email: input.email,
      role: input.role,
      status: "active",
      clientId: input.clientId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(user);
    return user;
  }

  const admin = createAdminSupabaseClient();
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (authError) throw authError;

  const { data, error } = await admin
    .from("profiles")
    .insert({
      id: created.user.id,
      name: input.name,
      email: input.email,
      role: input.role,
      status: "active",
      client_id: input.clientId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  if (input.role === "client") {
    const { error: pwError } = await admin
      .from("client_account_passwords")
      .upsert({ user_id: created.user.id, password: input.password, updated_at: new Date().toISOString() });
    if (pwError) throw pwError;
  }

  return rowToUser(data);
}

/**
 * 고객사 계정의 비밀번호를 재설정한다 — 이미 생성되어 있어 원래 비밀번호를 알 수 없는
 * 계정(client_account_passwords 도입 이전 생성분 포함)도 이 경로로 새 비밀번호를 부여하면
 * 이후 관리자 화면에서 조회할 수 있다.
 */
export async function resetClientAccountPassword(userId: string, password: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const u = store.users.find((x) => x.id === userId);
    if (u) u.password = password;
    return;
  }
  const admin = createAdminSupabaseClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, { password });
  if (authError) throw authError;

  const { error: pwError } = await admin
    .from("client_account_passwords")
    .upsert({ user_id: userId, password, updated_at: new Date().toISOString() });
  if (pwError) throw pwError;
}

export async function setUserStatus(id: string, status: UserStatus): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const u = store.users.find((x) => x.id === id);
    if (u) u.status = status;
    return;
  }
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setUserRole(id: string, role: UserRole): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const u = store.users.find((x) => x.id === id);
    if (u) u.role = role;
    return;
  }
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

/**
 * Auth 계정을 삭제한다 — profiles row는 FK(on delete cascade)로 자동 삭제된다.
 */
export async function deleteUserAccount(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.users = store.users.filter((x) => x.id !== id);
    return;
  }
  const admin = createAdminSupabaseClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
}
