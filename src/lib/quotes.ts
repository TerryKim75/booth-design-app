import { supabase } from './supabase';
import type { QuoteRequest } from '../types/booth';

export async function submitQuote(quote: QuoteRequest): Promise<{ id: string }> {
  const { size, elements } = quote.boothConfig;
  if (!size) throw new Error('부스 크기가 선택되지 않았습니다.');

  const { data, error } = await supabase
    .from('quote_requests')
    .insert({
      company_name: quote.companyName,
      contact_name: quote.contactName,
      email: quote.email,
      phone: quote.phone,
      event_name: quote.eventName,
      event_date: quote.eventDate || null,
      notes: quote.notes,
      booth_size_id: size.id,
      booth_size_label: size.label,
      booth_width: size.width,
      booth_depth: size.depth,
      logo_text: elements.logoText,
      chair_count: elements.chairCount,
      table_count: elements.tableCount,
      tv_count: elements.tvCount,
      has_reception: elements.hasReception,
      has_storage_room: elements.hasStorageRoom,
      lighting_type: elements.lightingType,
      graphic_coverage: elements.graphicCoverage,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id };
}
