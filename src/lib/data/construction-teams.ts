import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { ConstructionTeam } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToTeam(row: DbRow): ConstructionTeam {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    note: row.note,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listConstructionTeams(): Promise<ConstructionTeam[]> {
  if (!isSupabaseConfigured()) {
    return [...getLocalStore().constructionTeams].sort((a, b) => a.name.localeCompare(b.name));
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("construction_teams").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTeam);
}

export async function getConstructionTeamById(id: string): Promise<ConstructionTeam | null> {
  if (!isSupabaseConfigured()) {
    return getLocalStore().constructionTeams.find((t) => t.id === id) ?? null;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("construction_teams").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToTeam(data) : null;
}

export type ConstructionTeamInput = Omit<ConstructionTeam, "id" | "createdAt" | "updatedAt">;

function toDbRow(v: Partial<ConstructionTeamInput>) {
  const row: DbRow = {};
  if (v.name !== undefined) row.name = v.name;
  if (v.contactName !== undefined) row.contact_name = v.contactName;
  if (v.contactPhone !== undefined) row.contact_phone = v.contactPhone;
  if (v.note !== undefined) row.note = v.note;
  if (v.active !== undefined) row.active = v.active;
  return row;
}

export async function createConstructionTeam(input: ConstructionTeamInput): Promise<ConstructionTeam> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const now = new Date().toISOString();
    const team: ConstructionTeam = { ...input, id: `team-${Date.now()}`, createdAt: now, updatedAt: now };
    store.constructionTeams.push(team);
    return team;
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("construction_teams").insert(toDbRow(input)).select("*").single();
  if (error) throw error;
  return rowToTeam(data);
}

export async function updateConstructionTeam(id: string, patch: Partial<ConstructionTeamInput>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const idx = store.constructionTeams.findIndex((t) => t.id === id);
    if (idx >= 0) store.constructionTeams[idx] = { ...store.constructionTeams[idx], ...patch, updatedAt: new Date().toISOString() };
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("construction_teams").update(toDbRow(patch)).eq("id", id);
  if (error) throw error;
}

export async function deleteConstructionTeam(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    store.constructionTeams = store.constructionTeams.filter((t) => t.id !== id);
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("construction_teams").delete().eq("id", id);
  if (error) throw error;
}
