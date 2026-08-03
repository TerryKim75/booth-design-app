import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { AccessLevel, DownloadCategory, DownloadFile } from "@/types/domain";
import type { SessionProfile } from "@/lib/auth";
import type { DbRow } from "@/lib/data/row-types";

export interface DownloadFilters {
  category?: DownloadCategory[];
  page?: number;
  pageSize?: number;
}

function rowToDownload(row: DbRow): DownloadFile {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    version: row.version,
    fileType: row.file_type,
    fileSize: row.file_size,
    fileUrl: row.file_url,
    thumbnail: row.thumbnail,
    description: row.description,
    accessLevel: row.access_level,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 로그인/역할 여부에 따라 접근 가능한 공개 범위를 판단한다. */
export function canAccessDownload(accessLevel: AccessLevel, viewer: SessionProfile | null): boolean {
  if (accessLevel === "public") return true;
  if (accessLevel === "member") return viewer != null;
  if (accessLevel === "staff") return viewer?.role === "staff" || viewer?.role === "admin";
  return false;
}

export async function listDownloadFiles(filters: DownloadFilters, opts: { includeUnpublished?: boolean } = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    let items = store.downloadFiles.filter((d) => opts.includeUnpublished || d.status === "published");
    if (filters.category?.length) items = items.filter((d) => filters.category!.includes(d.category));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("download_files").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (!opts.includeUnpublished) query = query.eq("status", "published");
  if (filters.category?.length) query = query.in("category", filters.category);

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []).map(rowToDownload), total: count ?? 0, page, pageSize };
}

export async function getDownloadBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.downloadFiles.find((d) => d.slug === slug);
    if (!item) return null;
    if (!opts.includeUnpublished && item.status !== "published") return null;
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("download_files").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const item = rowToDownload(data);
  if (!opts.includeUnpublished && item.status !== "published") return null;
  return item;
}

export async function getDownloadById(id: string): Promise<DownloadFile | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().downloadFiles.find((d) => d.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("download_files").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToDownload(data) : null;
}

export type DownloadFileInput = Omit<DownloadFile, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<DownloadFileInput>) {
  const row: DbRow = {};
  if (v.slug !== undefined) row.slug = v.slug;
  if (v.title !== undefined) row.title = v.title;
  if (v.category !== undefined) row.category = v.category;
  if (v.version !== undefined) row.version = v.version;
  if (v.fileType !== undefined) row.file_type = v.fileType;
  if (v.fileSize !== undefined) row.file_size = v.fileSize;
  if (v.fileUrl !== undefined) row.file_url = v.fileUrl;
  if (v.thumbnail !== undefined) row.thumbnail = v.thumbnail;
  if (v.description !== undefined) row.description = v.description;
  if (v.accessLevel !== undefined) row.access_level = v.accessLevel;
  if (v.status !== undefined) row.status = v.status;
  return row;
}

export async function createDownloadFile(input: DownloadFileInput): Promise<DownloadFile> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const item: DownloadFile = { ...input, id: `download-${Date.now()}`, createdAt: now, updatedAt: now };
    store.downloadFiles.unshift(item);
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("download_files").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToDownload(data);
}

export async function updateDownloadFile(id: string, patch: Partial<DownloadFileInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.downloadFiles.findIndex((d) => d.id === id);
    if (idx >= 0) store.downloadFiles[idx] = { ...store.downloadFiles[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("download_files").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteDownloadFile(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.downloadFiles = store.downloadFiles.filter((d) => d.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("download_files").delete().eq("id", id);
  if (error) throw error;
}
