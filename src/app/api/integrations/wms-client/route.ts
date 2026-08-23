import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface WmsClientRecord {
  id: string;
  name: string;
  manager?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

/**
 * PMS(aso-wms)의 clients 테이블 INSERT 시 Supabase Database Webhook이 호출하는 엔드포인트.
 * wms_client_id를 onConflict 대상으로 upsert하여, 웹훅이 재시도되어도 중복 생성되지 않는다.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-wms-webhook-secret");
  if (!secret || secret !== process.env.WMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { type?: string; record?: WmsClientRecord };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const record = body.record;
  if (!record?.id || !record.name) {
    return NextResponse.json({ error: "missing record.id or record.name" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("clients")
    .upsert(
      {
        wms_client_id: record.id,
        company_name: record.name,
        contact_name: record.contact_name ?? record.manager ?? "",
        contact_email: record.email ?? "",
        contact_phone: record.phone ?? "",
        address: record.address ?? "",
        note: record.notes ?? "",
      },
      { onConflict: "wms_client_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
