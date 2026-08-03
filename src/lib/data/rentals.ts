import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { RentalCategory, RentalItem } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

export interface RentalFilters {
  category?: RentalCategory[];
  color?: string[];
  material?: string[];
  availableOnly?: boolean;
  sort?: "latest" | "featured";
  page?: number;
  pageSize?: number;
}

function rowToRental(row: DbRow): RentalItem {
  return {
    id: row.id,
    productCode: row.product_code,
    slug: row.slug,
    name: row.name,
    category: row.category,
    width: Number(row.width),
    depth: Number(row.depth),
    height: Number(row.height),
    color: row.color,
    material: row.material,
    description: row.description,
    images: row.images ?? [],
    stockStatus: row.stock_status,
    priceVisible: row.price_visible,
    rentalPrice: row.rental_price != null ? Number(row.rental_price) : null,
    featured: row.featured,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matches(item: RentalItem, f: RentalFilters): boolean {
  if (f.category?.length && !f.category.includes(item.category)) return false;
  if (f.color?.length && !f.color.includes(item.color)) return false;
  if (f.material?.length && !f.material.includes(item.material)) return false;
  if (f.availableOnly && item.stockStatus === "out_of_stock") return false;
  return true;
}

export async function listRentalItems(filters: RentalFilters, opts: { includeUnpublished?: boolean } = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    let items = store.rentalItems.filter((r) => opts.includeUnpublished || r.status === "published");
    items = items.filter((r) => matches(r, filters));
    if (filters.sort === "featured") items.sort((a, b) => Number(b.featured) - Number(a.featured));
    else items.sort((a, b) => a.sortOrder - b.sortOrder);
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("rental_items").select("*", { count: "exact" });
  if (!opts.includeUnpublished) query = query.eq("status", "published");
  if (filters.category?.length) query = query.in("category", filters.category);
  if (filters.color?.length) query = query.in("color", filters.color);
  if (filters.material?.length) query = query.in("material", filters.material);
  if (filters.availableOnly) query = query.neq("stock_status", "out_of_stock");
  query = filters.sort === "featured" ? query.order("featured", { ascending: false }) : query.order("sort_order", { ascending: true });

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []).map(rowToRental), total: count ?? 0, page, pageSize };
}

export async function getRentalItemBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.rentalItems.find((r) => r.slug === slug);
    if (!item) return null;
    if (!opts.includeUnpublished && item.status !== "published") return null;
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rental_items").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const item = rowToRental(data);
  if (!opts.includeUnpublished && item.status !== "published") return null;
  return item;
}

export async function listRelatedRentalItems(base: RentalItem, limit = 4): Promise<RentalItem[]> {
  const { items } = await listRentalItems({ category: [base.category], pageSize: 20 });
  return items.filter((r) => r.id !== base.id).slice(0, limit);
}

export async function getRentalItemById(id: string): Promise<RentalItem | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().rentalItems.find((r) => r.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rental_items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToRental(data) : null;
}

export type RentalItemInput = Omit<RentalItem, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<RentalItemInput>) {
  const row: DbRow = {};
  if (v.productCode !== undefined) row.product_code = v.productCode;
  if (v.slug !== undefined) row.slug = v.slug;
  if (v.name !== undefined) row.name = v.name;
  if (v.category !== undefined) row.category = v.category;
  if (v.width !== undefined) row.width = v.width;
  if (v.depth !== undefined) row.depth = v.depth;
  if (v.height !== undefined) row.height = v.height;
  if (v.color !== undefined) row.color = v.color;
  if (v.material !== undefined) row.material = v.material;
  if (v.description !== undefined) row.description = v.description;
  if (v.images !== undefined) row.images = v.images;
  if (v.stockStatus !== undefined) row.stock_status = v.stockStatus;
  if (v.priceVisible !== undefined) row.price_visible = v.priceVisible;
  if (v.rentalPrice !== undefined) row.rental_price = v.rentalPrice;
  if (v.featured !== undefined) row.featured = v.featured;
  if (v.status !== undefined) row.status = v.status;
  if (v.sortOrder !== undefined) row.sort_order = v.sortOrder;
  return row;
}

export async function createRentalItem(input: RentalItemInput): Promise<RentalItem> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const item: RentalItem = { ...input, id: `rental-${Date.now()}`, createdAt: now, updatedAt: now };
    store.rentalItems.unshift(item);
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("rental_items").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToRental(data);
}

export async function updateRentalItem(id: string, patch: Partial<RentalItemInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.rentalItems.findIndex((r) => r.id === id);
    if (idx >= 0) store.rentalItems[idx] = { ...store.rentalItems[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("rental_items").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteRentalItem(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.rentalItems = store.rentalItems.filter((r) => r.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("rental_items").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateRentalItem(id: string): Promise<RentalItem | null> {
  const source = await getRentalItemById(id);
  if (!source) return null;
  return createRentalItem({
    ...source,
    productCode: `${source.productCode}-COPY`,
    slug: `${source.slug}-copy-${Date.now()}`,
    status: "draft",
    featured: false,
  });
}
