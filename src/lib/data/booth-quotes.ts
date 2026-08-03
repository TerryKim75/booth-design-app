import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalStore } from "@/lib/data/local-store";
import type { BoothQuote } from "@/types/domain";
import type { BoothQuoteInput } from "@/lib/validations/booth-quote";

export async function createBoothQuote(input: BoothQuoteInput): Promise<BoothQuote> {
  const { boothConfig } = input;
  const size = boothConfig.size;
  if (!size) throw new Error("부스 크기가 선택되지 않았습니다.");

  const now = new Date().toISOString();
  const base = {
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    eventName: input.eventName || null,
    eventDate: input.eventDate || null,
    notes: input.notes || null,
    boothSizeId: size.id,
    boothSizeLabel: size.label,
    boothWidth: size.width,
    boothDepth: size.depth,
    openFaces: boothConfig.openFaces,
    logoText: boothConfig.elements.logoText || null,
    chairCount: boothConfig.elements.chairCount,
    tableCount: boothConfig.elements.tableCount,
    tvCount: boothConfig.elements.tvCount,
    hasReception: boothConfig.elements.hasReception,
    hasStorageRoom: boothConfig.elements.storage.enabled,
    hasMeetingRoom: boothConfig.elements.meetingRoom.enabled,
    lightingType: boothConfig.elements.lightingType,
    graphicCoverage: boothConfig.elements.graphicCoverage,
    status: "pending" as const,
  };

  if (!isSupabaseConfigured()) {
    const store = getLocalStore();
    const quote: BoothQuote = {
      id: `booth-quote-${store.boothQuotes.length + 1}`,
      ...base,
      createdAt: now,
    };
    store.boothQuotes.push(quote);
    return quote;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      company_name: base.companyName,
      contact_name: base.contactName,
      email: base.email,
      phone: base.phone,
      event_name: base.eventName,
      event_date: base.eventDate,
      notes: base.notes,
      booth_size_id: base.boothSizeId,
      booth_size_label: base.boothSizeLabel,
      booth_width: base.boothWidth,
      booth_depth: base.boothDepth,
      open_faces: base.openFaces,
      logo_text: base.logoText,
      chair_count: base.chairCount,
      table_count: base.tableCount,
      tv_count: base.tvCount,
      has_reception: base.hasReception,
      has_storage_room: base.hasStorageRoom,
      has_meeting_room: base.hasMeetingRoom,
      lighting_type: base.lightingType,
      graphic_coverage: base.graphicCoverage,
      status: base.status,
    })
    .select("id, created_at")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    ...base,
    createdAt: data.created_at,
  };
}
