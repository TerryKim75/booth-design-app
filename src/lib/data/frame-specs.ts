import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { FrameSpec } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToFrameSpec(row: DbRow): FrameSpec {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    specs: row.specs ?? [],
    image: row.image,
    applicationImage: row.application_image ?? "",
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listFrameSpecs(opts: { includeUnpublished?: boolean } = {}): Promise<FrameSpec[]> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    return store.frameSpecs
      .filter((f) => opts.includeUnpublished || f.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("frame_specs").select("*").order("sort_order", { ascending: true });
  if (!opts.includeUnpublished) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToFrameSpec);
}

export async function getFrameSpecById(id: string): Promise<FrameSpec | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().frameSpecs.find((f) => f.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("frame_specs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToFrameSpec(data) : null;
}

export type FrameSpecInput = Omit<FrameSpec, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<FrameSpecInput>) {
  const row: DbRow = {};
  if (v.name !== undefined) row.name = v.name;
  if (v.description !== undefined) row.description = v.description;
  if (v.specs !== undefined) row.specs = v.specs;
  if (v.image !== undefined) row.image = v.image;
  if (v.applicationImage !== undefined) row.application_image = v.applicationImage;
  if (v.status !== undefined) row.status = v.status;
  if (v.sortOrder !== undefined) row.sort_order = v.sortOrder;
  return row;
}

export async function createFrameSpec(input: FrameSpecInput): Promise<FrameSpec> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const item: FrameSpec = { ...input, id: `framespec-${Date.now()}`, createdAt: now, updatedAt: now };
    store.frameSpecs.push(item);
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("frame_specs").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToFrameSpec(data);
}

export async function updateFrameSpec(id: string, patch: Partial<FrameSpecInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.frameSpecs.findIndex((f) => f.id === id);
    if (idx >= 0) store.frameSpecs[idx] = { ...store.frameSpecs[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("frame_specs").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteFrameSpec(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.frameSpecs = store.frameSpecs.filter((f) => f.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("frame_specs").delete().eq("id", id);
  if (error) throw error;
}
