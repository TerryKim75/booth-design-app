import "server-only";
import { randomUUID } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getLocalStore } from "@/lib/data/local-store";
import type { Notice } from "@/types/domain";

/**
 * 공지는 별도 테이블 없이 비공개 Storage 버킷의 JSON 파일 하나에 저장한다.
 * service role로만 읽고 쓰며, 권한 검사는 호출부(requireStaffOrAdmin / requireAdmin)에서 담당한다.
 */
const NOTICES_BUCKET = "admin-notices";
const NOTICES_FILE = "notices.json";

function bucket() {
  return createAdminSupabaseClient().storage.from(NOTICES_BUCKET);
}

async function readAll(): Promise<Notice[]> {
  if (!isSupabaseConfigured()) return getLocalStore().notices;
  const { data, error } = await bucket().download(NOTICES_FILE);
  if (error) {
    // 아직 공지를 한 번도 저장하지 않아 파일(또는 버킷)이 없는 경우
    if (/not.?found/i.test(error.message) || (error as { statusCode?: string }).statusCode === "404") return [];
    throw error;
  }
  return JSON.parse(await data.text()) as Notice[];
}

async function writeAll(items: Notice[]): Promise<void> {
  if (!isSupabaseConfigured()) {
    getLocalStore().notices = items;
    return;
  }
  const body = JSON.stringify(items);
  const upload = () =>
    bucket().upload(NOTICES_FILE, body, { contentType: "application/json", upsert: true, cacheControl: "0" });
  let { error } = await upload();
  if (error && /bucket.*not.?found/i.test(error.message)) {
    const created = await createAdminSupabaseClient().storage.createBucket(NOTICES_BUCKET, { public: false });
    if (created.error) throw created.error;
    ({ error } = await upload());
  }
  if (error) throw error;
}

/** 고정 공지 먼저, 그다음 최신순 */
function sortNotices(items: Notice[]): Notice[] {
  return [...items].sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt));
}

export async function listNotices(opts: { includeUnpublished?: boolean; limit?: number } = {}): Promise<Notice[]> {
  const items = sortNotices((await readAll()).filter((n) => opts.includeUnpublished || n.status === "published"));
  return opts.limit ? items.slice(0, opts.limit) : items;
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  return (await readAll()).find((n) => n.id === id) ?? null;
}

export type NoticeInput = Omit<Notice, "id" | "createdAt" | "updatedAt">;

export async function createNotice(input: NoticeInput): Promise<Notice> {
  const items = await readAll();
  const now = new Date().toISOString();
  const item: Notice = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  await writeAll([...items, item]);
  return item;
}

export async function updateNotice(id: string, patch: Partial<NoticeInput>): Promise<void> {
  const items = await readAll();
  await writeAll(items.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)));
}

export async function deleteNotice(id: string): Promise<void> {
  const items = await readAll();
  await writeAll(items.filter((n) => n.id !== id));
}
