import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { ClientProject } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

export function generateNextClientProjectDesignCode(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ASO-PRJ-${y}${m}${d}-${rand}`;
}

function rowToProject(row: DbRow): ClientProject {
  return {
    id: row.id,
    designCode: row.design_code,
    clientId: row.client_id,
    title: row.title,
    stage: row.stage,
    constructionTeamId: row.construction_team_id ?? null,
    sitePrepStartDate: row.site_prep_start_date ?? null,
    sitePrepEndDate: row.site_prep_end_date ?? null,
    constructionStartDate: row.construction_start_date ?? null,
    constructionEndDate: row.construction_end_date ?? null,
    teardownStartDate: row.teardown_start_date ?? null,
    teardownEndDate: row.teardown_end_date ?? null,
    note: row.note,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ClientProjectFilters {
  clientId?: string;
}

export async function listClientProjects(filters: ClientProjectFilters = {}): Promise<ClientProject[]> {
  if (!isSupabaseConfigured()) {
    let items = [...getLocalStore().clientProjects];
    if (filters.clientId) items = items.filter((p) => p.clientId === filters.clientId);
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("client_projects").select("*").order("created_at", { ascending: false });
  if (filters.clientId) query = query.eq("client_id", filters.clientId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToProject);
}

export async function getClientProjectById(id: string): Promise<ClientProject | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().clientProjects.find((p) => p.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("client_projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProject(data) : null;
}

export type ClientProjectInput = Omit<ClientProject, "id" | "createdBy" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<ClientProjectInput>) {
  const row: DbRow = {};
  if (v.designCode !== undefined) row.design_code = v.designCode;
  if (v.clientId !== undefined) row.client_id = v.clientId;
  if (v.title !== undefined) row.title = v.title;
  if (v.stage !== undefined) row.stage = v.stage;
  if (v.constructionTeamId !== undefined) row.construction_team_id = v.constructionTeamId;
  if (v.sitePrepStartDate !== undefined) row.site_prep_start_date = v.sitePrepStartDate;
  if (v.sitePrepEndDate !== undefined) row.site_prep_end_date = v.sitePrepEndDate;
  if (v.constructionStartDate !== undefined) row.construction_start_date = v.constructionStartDate;
  if (v.constructionEndDate !== undefined) row.construction_end_date = v.constructionEndDate;
  if (v.teardownStartDate !== undefined) row.teardown_start_date = v.teardownStartDate;
  if (v.teardownEndDate !== undefined) row.teardown_end_date = v.teardownEndDate;
  if (v.note !== undefined) row.note = v.note;
  return row;
}

export async function createClientProject(input: ClientProjectInput, createdBy: string | null): Promise<ClientProject> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const project: ClientProject = { ...input, id: `project-${Date.now()}`, createdBy, createdAt: now, updatedAt: now };
    store.clientProjects.push(project);
    return project;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("client_projects")
    .insert({ ...toDbRow(input), created_by: createdBy })
    .select("*")
    .single();
  if (error) throw error;
  return rowToProject(data);
}

export async function updateClientProject(id: string, patch: Partial<ClientProjectInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.clientProjects.findIndex((p) => p.id === id);
    if (idx >= 0) store.clientProjects[idx] = { ...store.clientProjects[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("client_projects").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteClientProject(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.clientProjects = store.clientProjects.filter((p) => p.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("client_projects").delete().eq("id", id);
  if (error) throw error;
}
