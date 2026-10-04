import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { Notice } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToNotice(row: DbRow): Notice {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? "",
    status: row.status,
    isPinned: row.is_pinned,
    authorName: row.author_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 고정 공지 먼저, 그다음 최신순 */
function sortNotices(items: Notice[]): Notice[] {
  return [...items].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt));
}

export async function listNotices(opts: { includeUnpublished?: boolean; limit?: number } = {}): Promise<Notice[]> {
  if (!isSupabaseConfigured()) {
    const items = sortNotices(
      getLocalStore().notices.filter((n) => opts.includeUnpublished || n.status === "published")
    );
    return opts.limit ? items.slice(0, opts.limit) : items;
  }
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("notices")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (!opts.includeUnpublished) query = query.eq("status", "published");
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToNotice);
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().notices.find((n) => n.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("notices").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToNotice(data) : null;
}

export type NoticeInput = Omit<Notice, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<NoticeInput>) {
  const row: DbRow = {};
  if (v.title !== undefined) row.title = v.title;
  if (v.body !== undefined) row.body = v.body;
  if (v.status !== undefined) row.status = v.status;
  if (v.isPinned !== undefined) row.is_pinned = v.isPinned;
  if (v.authorName !== undefined) row.author_name = v.authorName;
  return row;
}

export async function createNotice(input: NoticeInput): Promise<Notice> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const item: Notice = { ...input, id: `notice-${Date.now()}`, createdAt: now, updatedAt: now };
    store.notices.push(item);
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("notices").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToNotice(data);
}

export async function updateNotice(id: string, patch: Partial<NoticeInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.notices.findIndex((n) => n.id === id);
    if (idx >= 0) store.notices[idx] = { ...store.notices[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("notices").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteNotice(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.notices = store.notices.filter((n) => n.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw error;
}
