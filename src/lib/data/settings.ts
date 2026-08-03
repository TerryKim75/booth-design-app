import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import { siteSettingSeed } from "@/lib/seed-data/site-settings";

const fallbackMap = new Map(siteSettingSeed.map((s) => [s.key, s.value]));

export async function getSetting(key: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    return store.siteSettings.find((s) => s.key === key)?.value ?? fallbackMap.get(key) ?? "";
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  return data?.value ?? fallbackMap.get(key) ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const entries = await Promise.all(keys.map(async (k) => [k, await getSetting(k)] as const));
  return Object.fromEntries(entries);
}

export async function getAllSettings(): Promise<{ key: string; value: string }[]> {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    return store.siteSettings;
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("key, value").order("key");
  return data ?? [];
}

export async function updateSetting(key: string, value: string) {
  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const existing = store.siteSettings.find((s) => s.key === key);
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date().toISOString();
    } else {
      store.siteSettings.push({ id: `setting-${store.siteSettings.length + 1}`, key, value, updatedAt: new Date().toISOString() });
    }
    return;
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}
