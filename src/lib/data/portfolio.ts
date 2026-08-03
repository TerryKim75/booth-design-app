import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { Portfolio, ProjectType } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

export interface PortfolioFilters {
  year?: number[];
  country?: string[];
  city?: string[];
  exhibition?: string[];
  industry?: string[];
  projectType?: ProjectType[];
  sort?: "latest" | "featured" | "size";
  page?: number;
  pageSize?: number;
}

function rowToPortfolio(row: DbRow): Portfolio {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    exhibition: row.exhibition,
    year: row.year,
    country: row.country,
    city: row.city,
    boothWidth: Number(row.booth_width),
    boothDepth: Number(row.booth_depth),
    boothHeight: Number(row.booth_height),
    projectType: row.project_type,
    industry: row.industry,
    systemType: row.system_type,
    description: row.description,
    thumbnail: row.thumbnail,
    gallery: row.gallery ?? [],
    featured: row.featured,
    status: row.status,
    sortOrder: row.sort_order,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matches(p: Portfolio, f: PortfolioFilters): boolean {
  if (f.year?.length && !f.year.includes(p.year)) return false;
  if (f.country?.length && !f.country.includes(p.country)) return false;
  if (f.city?.length && !f.city.includes(p.city)) return false;
  if (f.exhibition?.length && !f.exhibition.includes(p.exhibition)) return false;
  if (f.industry?.length && !f.industry.includes(p.industry)) return false;
  if (f.projectType?.length && !f.projectType.includes(p.projectType)) return false;
  return true;
}

function sortItems(items: Portfolio[], sort?: PortfolioFilters["sort"]): Portfolio[] {
  const arr = [...items];
  if (sort === "size") return arr.sort((a, b) => b.boothWidth * b.boothDepth - a.boothWidth * a.boothDepth);
  if (sort === "featured") return arr.sort((a, b) => Number(b.featured) - Number(a.featured) || b.sortOrder - a.sortOrder);
  return arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listPortfolios(filters: PortfolioFilters, opts: { includeUnpublished?: boolean } = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 9;

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    let items = store.portfolios.filter((p) => opts.includeUnpublished || p.status === "published");
    items = items.filter((p) => matches(p, filters));
    items = sortItems(items, filters.sort);
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("portfolios").select("*", { count: "exact" });
  if (!opts.includeUnpublished) query = query.eq("status", "published");
  if (filters.year?.length) query = query.in("year", filters.year);
  if (filters.country?.length) query = query.in("country", filters.country);
  if (filters.city?.length) query = query.in("city", filters.city);
  if (filters.exhibition?.length) query = query.in("exhibition", filters.exhibition);
  if (filters.industry?.length) query = query.in("industry", filters.industry);
  if (filters.projectType?.length) query = query.in("project_type", filters.projectType);

  if (filters.sort === "featured") query = query.order("featured", { ascending: false }).order("sort_order", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []).map(rowToPortfolio), total: count ?? 0, page, pageSize };
}

export async function getPortfolioBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.portfolios.find((p) => p.slug === slug);
    if (!item) return null;
    if (!opts.includeUnpublished && item.status !== "published") return null;
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("portfolios").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const item = rowToPortfolio(data);
  if (!opts.includeUnpublished && item.status !== "published") return null;
  return item;
}

export async function listFeaturedPortfolios(limit = 6): Promise<Portfolio[]> {
  const { items } = await listPortfolios({ sort: "featured", pageSize: limit * 3 });
  return items.filter((p) => p.featured).slice(0, limit);
}

export async function listRelatedPortfolios(base: Portfolio, limit = 3): Promise<Portfolio[]> {
  const { items } = await listPortfolios({ industry: [base.industry], pageSize: 20 });
  return items.filter((p) => p.id !== base.id).slice(0, limit);
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().portfolios.find((p) => p.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("portfolios").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToPortfolio(data) : null;
}

export type PortfolioInput = Omit<Portfolio, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<PortfolioInput>) {
  const row: DbRow = {};
  if (v.slug !== undefined) row.slug = v.slug;
  if (v.title !== undefined) row.title = v.title;
  if (v.client !== undefined) row.client = v.client;
  if (v.exhibition !== undefined) row.exhibition = v.exhibition;
  if (v.year !== undefined) row.year = v.year;
  if (v.country !== undefined) row.country = v.country;
  if (v.city !== undefined) row.city = v.city;
  if (v.boothWidth !== undefined) row.booth_width = v.boothWidth;
  if (v.boothDepth !== undefined) row.booth_depth = v.boothDepth;
  if (v.boothHeight !== undefined) row.booth_height = v.boothHeight;
  if (v.projectType !== undefined) row.project_type = v.projectType;
  if (v.industry !== undefined) row.industry = v.industry;
  if (v.systemType !== undefined) row.system_type = v.systemType;
  if (v.description !== undefined) row.description = v.description;
  if (v.thumbnail !== undefined) row.thumbnail = v.thumbnail;
  if (v.gallery !== undefined) row.gallery = v.gallery;
  if (v.featured !== undefined) row.featured = v.featured;
  if (v.status !== undefined) row.status = v.status;
  if (v.sortOrder !== undefined) row.sort_order = v.sortOrder;
  if (v.createdBy !== undefined) row.created_by = v.createdBy;
  return row;
}

export async function createPortfolio(input: PortfolioInput): Promise<Portfolio> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const item: Portfolio = { ...input, id: `portfolio-${Date.now()}`, createdAt: now, updatedAt: now };
    store.portfolios.unshift(item);
    return item;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("portfolios").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToPortfolio(data);
}

export async function updatePortfolio(id: string, patch: Partial<PortfolioInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.portfolios.findIndex((p) => p.id === id);
    if (idx >= 0) store.portfolios[idx] = { ...store.portfolios[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("portfolios").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deletePortfolio(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.portfolios = store.portfolios.filter((p) => p.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicatePortfolio(id: string): Promise<Portfolio | null> {
  const source = await getPortfolioById(id);
  if (!source) return null;
  return createPortfolio({ ...source, slug: `${source.slug}-copy-${Date.now()}`, status: "draft", featured: false });
}
