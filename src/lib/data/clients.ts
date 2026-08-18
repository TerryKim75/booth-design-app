import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getLocalStore } from "@/lib/data/local-store";
import type { Client, UserStatus } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToClient(row: DbRow): Client {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    address: row.address,
    note: row.note,
    status: row.status,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listClients(): Promise<Client[]> {
  if (!isSupabaseConfigured()) {
    return [...getLocalStore().clients].sort((a, b) => a.companyName.localeCompare(b.companyName));
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("clients").select("*").order("company_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().clients.find((c) => c.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToClient(data) : null;
}

export type ClientInput = Omit<Client, "id" | "status" | "createdBy" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<ClientInput>) {
  const row: DbRow = {};
  if (v.companyName !== undefined) row.company_name = v.companyName;
  if (v.contactName !== undefined) row.contact_name = v.contactName;
  if (v.contactEmail !== undefined) row.contact_email = v.contactEmail;
  if (v.contactPhone !== undefined) row.contact_phone = v.contactPhone;
  if (v.address !== undefined) row.address = v.address;
  if (v.note !== undefined) row.note = v.note;
  return row;
}

export async function createClient(input: ClientInput, createdBy: string | null): Promise<Client> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const client: Client = {
      ...input,
      id: randomUUID(),
      status: "active",
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    store.clients.push(client);
    return client;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...toDbRow(input), created_by: createdBy })
    .select("*")
    .single();
  if (error) throw error;
  return rowToClient(data);
}

export async function updateClient(id: string, patch: Partial<ClientInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.clients.findIndex((c) => c.id === id);
    if (idx >= 0) store.clients[idx] = { ...store.clients[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("clients").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.clients = store.clients.filter((c) => c.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

/**
 * 고객사 상태 변경 — 소속 client 계정들의 profiles.status도 함께 cascade해서
 * 정지 즉시 해당 회사의 모든 로그인이 차단되도록 한다. profiles 쓰기는 RLS상
 * admin 전용이라 Service Role 클라이언트를 사용한다(호출부는 requireAdmin으로 제한).
 */
export async function setClientStatus(id: string, status: UserStatus): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const client = store.clients.find((c) => c.id === id);
    if (client) client.status = status;
    store.users.filter((u) => u.role === "client" && u.clientId === id).forEach((u) => (u.status = status));
    return;
  }
  const admin = createAdminSupabaseClient();
  const { error: clientErr } = await admin.from("clients").update({ status }).eq("id", id);
  if (clientErr) throw clientErr;
  const { error: profilesErr } = await admin
    .from("profiles")
    .update({ status })
    .eq("role", "client")
    .eq("client_id", id);
  if (profilesErr) throw profilesErr;
}
