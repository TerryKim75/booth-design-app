import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { BoothDesign, BoothFeature, BoothFeatureEntry, BoothStyleTag, BoothType, FrameType } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

export interface BoothDesignFilters {
  widthMin?: number;
  widthMax?: number;
  depthMin?: number;
  depthMax?: number;
  areaMin?: number;
  areaMax?: number;
  heightMin?: number;
  heightMax?: number;
  boothType?: BoothType[];
  openSides?: number[];
  frameType?: FrameType[];
  features?: BoothFeature[];
  styleTags?: BoothStyleTag[];
  sort?: "latest" | "featured" | "area";
  page?: number;
  pageSize?: number;
}

export interface BoothDesignListResult {
  items: BoothDesign[];
  total: number;
  page: number;
  pageSize: number;
}

function rowToBoothDesign(row: DbRow): BoothDesign {
  return {
    id: row.id,
    designCode: row.design_code,
    slug: row.slug,
    title: row.title,
    width: Number(row.width),
    depth: Number(row.depth),
    area: Number(row.area),
    height: Number(row.height),
    boothType: row.booth_type,
    openSides: row.open_sides,
    frameType: row.frame_type,
    features: (row.features ?? []) as BoothFeatureEntry[],
    styleTags: row.style_tags ?? [],
    description: row.description,
    thumbnail: row.thumbnail,
    gallery: row.gallery ?? [],
    floorPlan: row.floor_plan,
    materialSummary: row.material_summary,
    featured: row.featured,
    status: row.status,
    sortOrder: row.sort_order,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matchesFilters(b: BoothDesign, f: BoothDesignFilters): boolean {
  if (f.widthMin != null && b.width < f.widthMin) return false;
  if (f.widthMax != null && b.width > f.widthMax) return false;
  if (f.depthMin != null && b.depth < f.depthMin) return false;
  if (f.depthMax != null && b.depth > f.depthMax) return false;
  if (f.areaMin != null && b.area < f.areaMin) return false;
  if (f.areaMax != null && b.area > f.areaMax) return false;
  if (f.heightMin != null && b.height < f.heightMin) return false;
  if (f.heightMax != null && b.height > f.heightMax) return false;
  if (f.boothType?.length && !f.boothType.includes(b.boothType)) return false;
  if (f.openSides?.length && !f.openSides.includes(b.openSides)) return false;
  if (f.frameType?.length && !f.frameType.includes(b.frameType)) return false;
  if (f.features?.length && !f.features.every((feat) => b.features.some((entry) => entry.feature === feat))) return false;
  if (f.styleTags?.length && !f.styleTags.some((s) => b.styleTags.includes(s))) return false;
  return true;
}

function sortItems(items: BoothDesign[], sort?: BoothDesignFilters["sort"]): BoothDesign[] {
  const arr = [...items];
  if (sort === "area") return arr.sort((a, b) => b.area - a.area);
  if (sort === "featured") return arr.sort((a, b) => Number(b.featured) - Number(a.featured) || b.sortOrder - a.sortOrder);
  return arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listBoothDesigns(
  filters: BoothDesignFilters,
  opts: { includeUnpublished?: boolean } = {}
): Promise<BoothDesignListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    let items = store.boothDesigns.filter((b) => opts.includeUnpublished || b.status === "published");
    items = items.filter((b) => matchesFilters(b, filters));
    items = sortItems(items, filters.sort);
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("booth_designs").select("*", { count: "exact" });

  if (!opts.includeUnpublished) query = query.eq("status", "published");
  if (filters.widthMin != null) query = query.gte("width", filters.widthMin);
  if (filters.widthMax != null) query = query.lte("width", filters.widthMax);
  if (filters.depthMin != null) query = query.gte("depth", filters.depthMin);
  if (filters.depthMax != null) query = query.lte("depth", filters.depthMax);
  if (filters.areaMin != null) query = query.gte("area", filters.areaMin);
  if (filters.areaMax != null) query = query.lte("area", filters.areaMax);
  if (filters.heightMin != null) query = query.gte("height", filters.heightMin);
  if (filters.heightMax != null) query = query.lte("height", filters.heightMax);
  if (filters.boothType?.length) query = query.in("booth_type", filters.boothType);
  if (filters.openSides?.length) query = query.in("open_sides", filters.openSides);
  if (filters.frameType?.length) query = query.in("frame_type", filters.frameType);
  if (filters.features?.length) query = query.contains("features", filters.features.map((feat) => ({ feature: feat })));
  if (filters.styleTags?.length) query = query.overlaps("style_tags", filters.styleTags);

  if (filters.sort === "area") query = query.order("area", { ascending: false });
  else if (filters.sort === "featured") query = query.order("featured", { ascending: false }).order("sort_order", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    items: (data ?? []).map(rowToBoothDesign),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getBoothDesignBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.boothDesigns.find((b) => b.slug === slug);
    if (!item) return null;
    if (!opts.includeUnpublished && item.status !== "published") return null;
    return item;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("booth_designs").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const item = rowToBoothDesign(data);
  if (!opts.includeUnpublished && item.status !== "published") return null;
  return item;
}

export async function listFeaturedBoothDesigns(limit = 8): Promise<BoothDesign[]> {
  const { items } = await listBoothDesigns({ sort: "featured", pageSize: limit * 3 });
  return items.filter((b) => b.featured).slice(0, limit);
}

export async function listSimilarBoothDesigns(base: BoothDesign, limit = 4): Promise<BoothDesign[]> {
  const { items } = await listBoothDesigns({ boothType: [base.boothType], pageSize: 40 });
  return items.filter((b) => b.id !== base.id).slice(0, limit);
}

export async function getBoothDesignFacetCounts() {
  const { items } = await listBoothDesigns({ pageSize: 5000 });
  return {
    total: items.length,
  };
}

export async function getBoothDesignById(id: string): Promise<BoothDesign | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().boothDesigns.find((b) => b.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("booth_designs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToBoothDesign(data) : null;
}

export type BoothDesignInput = Omit<BoothDesign, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<BoothDesignInput>) {
  const row: DbRow = {};
  if (v.designCode !== undefined) row.design_code = v.designCode;
  if (v.slug !== undefined) row.slug = v.slug;
  if (v.title !== undefined) row.title = v.title;
  if (v.width !== undefined) row.width = v.width;
  if (v.depth !== undefined) row.depth = v.depth;
  if (v.area !== undefined) row.area = v.area;
  if (v.height !== undefined) row.height = v.height;
  if (v.boothType !== undefined) row.booth_type = v.boothType;
  if (v.openSides !== undefined) row.open_sides = v.openSides;
  if (v.frameType !== undefined) row.frame_type = v.frameType;
  if (v.features !== undefined) row.features = v.features;
  if (v.styleTags !== undefined) row.style_tags = v.styleTags;
  if (v.description !== undefined) row.description = v.description;
  if (v.thumbnail !== undefined) row.thumbnail = v.thumbnail;
  if (v.gallery !== undefined) row.gallery = v.gallery;
  if (v.floorPlan !== undefined) row.floor_plan = v.floorPlan;
  if (v.materialSummary !== undefined) row.material_summary = v.materialSummary;
  if (v.featured !== undefined) row.featured = v.featured;
  if (v.status !== undefined) row.status = v.status;
  if (v.sortOrder !== undefined) row.sort_order = v.sortOrder;
  if (v.createdBy !== undefined) row.created_by = v.createdBy;
  return row;
}

export async function createBoothDesign(input: BoothDesignInput): Promise<BoothDesign> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const item: BoothDesign = { ...input, id: `booth-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: now, updatedAt: now };
    store.boothDesigns.unshift(item);
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("booth_designs").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToBoothDesign(data);
}

export async function updateBoothDesign(id: string, patch: Partial<BoothDesignInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.boothDesigns.findIndex((b) => b.id === id);
    if (idx >= 0) store.boothDesigns[idx] = { ...store.boothDesigns[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("booth_designs").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteBoothDesign(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.boothDesigns = store.boothDesigns.filter((b) => b.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("booth_designs").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateBoothDesign(id: string): Promise<BoothDesign | null> {
  const source = await getBoothDesignById(id);
  if (!source) return null;
  const suffix = Date.now();
  return createBoothDesign({
    ...source,
    designCode: `${source.designCode}-COPY`,
    slug: `${source.slug}-copy-${suffix}`,
    status: "draft",
    featured: false,
  });
}

export async function bulkCreateBoothDesigns(inputs: BoothDesignInput[]): Promise<number> {
  let count = 0;
  for (const input of inputs) {
    await createBoothDesign(input);
    count++;
  }
  return count;
}
