import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { Inquiry, InquiryStatus } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

export interface InquiryFilters {
  status?: InquiryStatus[];
  assigneeId?: string;
  page?: number;
  pageSize?: number;
}

function rowToInquiry(row: DbRow, notes: DbRow[] = []): Inquiry {
  return {
    id: row.id,
    inquiryNumber: row.inquiry_number,
    company: row.company,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    exhibition: row.exhibition,
    country: row.country,
    city: row.city,
    eventDate: row.event_date,
    boothWidth: row.booth_width != null ? Number(row.booth_width) : null,
    boothDepth: row.booth_depth != null ? Number(row.booth_depth) : null,
    boothHeight: row.booth_height != null ? Number(row.booth_height) : null,
    budget: row.budget,
    boothDesignId: row.booth_design_id,
    requirements: row.requirements,
    attachments: row.attachments ?? [],
    status: row.status,
    assigneeId: row.assignee_id,
    internalNotes: notes.map((n) => ({
      id: n.id,
      authorId: n.author_id,
      authorName: n.author_name ?? "담당자",
      note: n.note,
      createdAt: n.created_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function generateInquiryNumber(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ASO-INQ-${y}${m}${d}-${rand}`;
}

export interface NewInquiryInput {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  exhibition?: string;
  country?: string;
  city?: string;
  eventDate?: string;
  boothWidth?: number;
  boothDepth?: number;
  boothHeight?: number;
  budget?: string;
  boothDesignId?: string | null;
  requirements: string;
  attachments: string[];
}

export async function createInquiry(input: NewInquiryInput): Promise<Inquiry> {
  const inquiryNumber = generateInquiryNumber();

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const inquiry: Inquiry = {
      id: `inquiry-${store.inquiries.length + 1}`,
      inquiryNumber,
      company: input.company,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      exhibition: input.exhibition ?? null,
      country: input.country ?? null,
      city: input.city ?? null,
      eventDate: input.eventDate ?? null,
      boothWidth: input.boothWidth ?? null,
      boothDepth: input.boothDepth ?? null,
      boothHeight: input.boothHeight ?? null,
      budget: input.budget ?? null,
      boothDesignId: input.boothDesignId ?? null,
      requirements: input.requirements,
      attachments: input.attachments,
      status: "new",
      assigneeId: null,
      internalNotes: [],
      createdAt: now,
      updatedAt: now,
    };
    store.inquiries.unshift(inquiry);
    return inquiry;
  }

  // 공개 문의 폼은 로그인 세션이 없으므로 anon 클라이언트로 insert (RLS: inquiries_anon_insert)
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      inquiry_number: inquiryNumber,
      company: input.company,
      contact_name: input.contactName,
      email: input.email,
      phone: input.phone,
      exhibition: input.exhibition ?? null,
      country: input.country ?? null,
      city: input.city ?? null,
      event_date: input.eventDate ?? null,
      booth_width: input.boothWidth ?? null,
      booth_depth: input.boothDepth ?? null,
      booth_height: input.boothHeight ?? null,
      budget: input.budget ?? null,
      booth_design_id: input.boothDesignId ?? null,
      requirements: input.requirements,
      attachments: input.attachments,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToInquiry(data);
}

export async function listInquiries(filters: InquiryFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    let items = store.inquiries;
    if (filters.status?.length) items = items.filter((i) => filters.status!.includes(i.status));
    if (filters.assigneeId) items = items.filter((i) => i.assigneeId === filters.assigneeId);
    items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("inquiries").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filters.status?.length) query = query.in("status", filters.status);
  if (filters.assigneeId) query = query.eq("assignee_id", filters.assigneeId);
  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1);
  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []).map((r) => rowToInquiry(r)), total: count ?? 0, page, pageSize };
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    return store.inquiries.find((i) => i.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: notes } = await supabase
    .from("inquiry_notes")
    .select("*, profiles(name)")
    .eq("inquiry_id", id)
    .order("created_at", { ascending: false });
  return rowToInquiry(
    data,
    (notes ?? []).map((n: DbRow) => ({ ...n, author_name: n.profiles?.name }))
  );
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.inquiries.find((i) => i.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
    }
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function assignInquiry(id: string, assigneeId: string | null) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.inquiries.find((i) => i.id === id);
    if (item) {
      item.assigneeId = assigneeId;
      item.status = assigneeId ? "assigned" : item.status;
      item.updatedAt = new Date().toISOString();
    }
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ assignee_id: assigneeId, status: assigneeId ? "assigned" : undefined })
    .eq("id", id);
  if (error) throw error;
}

export async function addInquiryNote(id: string, authorId: string, authorName: string, note: string) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const item = store.inquiries.find((i) => i.id === id);
    if (item) {
      item.internalNotes.unshift({
        id: `${id}-note-${item.internalNotes.length + 1}`,
        authorId,
        authorName,
        note,
        createdAt: new Date().toISOString(),
      });
    }
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("inquiry_notes").insert({ inquiry_id: id, author_id: authorId, note });
  if (error) throw error;
}

export async function getInquiryDashboardStats() {
  const { items } = await listInquiries({ pageSize: 5000 });
  return {
    total: items.length,
    new: items.filter((i) => i.status === "new").length,
    inProgress: items.filter((i) => !["new", "closed"].includes(i.status)).length,
    closed: items.filter((i) => i.status === "closed").length,
  };
}
