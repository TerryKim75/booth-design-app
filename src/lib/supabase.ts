import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export interface QuoteRow {
  id?: string;
  created_at?: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  notes: string;
  booth_size_id: string;
  booth_size_label: string;
  booth_width: number;
  booth_depth: number;
  logo_text: string;
  chair_count: number;
  table_count: number;
  tv_count: number;
  has_reception: boolean;
  has_storage_room: boolean;
  lighting_type: string;
  graphic_coverage: string;
  status: string;
}
