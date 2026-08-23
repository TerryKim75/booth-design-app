import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { generateNextClientProjectDesignCode } from "@/lib/data/client-projects";

export const runtime = "nodejs";

interface WmsProjectRecord {
  id: string;
  name: string;
  client?: string | null;
  status?: string | null;
  construction_date?: string | null;
  end_date?: string | null;
  demolition_date?: string | null;
  exhibition?: string | null;
  organizer?: string | null;
  exhibitor?: string | null;
  manager?: string | null;
}

// PMS(aso-wms)의 실제 status enum: '제안중' | '계약완료' | '시공진행' | '완료' | '취소'
// (src/types/index.ts ProjectStatus 참고 — schema.sql에 남아있던 'active'/'completed' 표기는 stale함)
function mapStage(status: string | null | undefined): "ongoing" | "completed" {
  return status === "완료" ? "completed" : "ongoing";
}

/**
 * PMS(aso-wms)의 wms_projects 테이블 INSERT 시 Supabase Database Webhook이 호출하는 엔드포인트.
 * 1) record.client(회사명 텍스트)로 웹사이트 clients를 조회하고, 없으면 새로 생성한다.
 * 2) wms_project_id를 onConflict 대상으로 client_projects를 upsert한다(웹훅 재시도 대비).
 * 날짜 매핑: construction_date~end_date → 전시(construction_*), demolition_date → 철거 시작일만.
 * 설치(site_prep) 일정은 PMS에 대응 필드가 없어 비워두고 관리자가 어드민에서 채운다.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-wms-webhook-secret");
  if (!secret || secret !== process.env.WMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { type?: string; record?: WmsProjectRecord };
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
  const clientName = record.client?.trim();

  let clientId: string | null = null;
  if (clientName) {
    const { data: existing, error: findErr } = await admin
      .from("clients")
      .select("id")
      .eq("company_name", clientName)
      .maybeSingle();
    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });

    if (existing) {
      clientId = existing.id;
    } else {
      const { data: created, error: createErr } = await admin
        .from("clients")
        .insert({ company_name: clientName, contact_name: "", contact_email: "", contact_phone: "", address: "", note: "PMS 프로젝트 생성 시 자동 등록됨" })
        .select("id")
        .single();
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
      clientId = created.id;
    }
  }

  if (!clientId) {
    return NextResponse.json({ error: "record.client(고객사명)가 비어 있어 프로젝트를 생성할 수 없습니다." }, { status: 400 });
  }

  const noteParts = [
    record.exhibition ? `전시회: ${record.exhibition}` : null,
    record.organizer ? `주최사: ${record.organizer}` : null,
    record.exhibitor ? `참가사: ${record.exhibitor}` : null,
    record.manager ? `PMS 담당자: ${record.manager}` : null,
  ].filter(Boolean);

  const note = noteParts.length > 0 ? `${noteParts.join("\n")}\n\n(PMS에서 자동 생성됨)` : "(PMS에서 자동 생성됨)";
  const commonFields = {
    client_id: clientId,
    title: record.name,
    stage: mapStage(record.status),
    construction_start_date: record.construction_date ?? null,
    construction_end_date: record.end_date ?? null,
    teardown_start_date: record.demolition_date ?? null,
    note,
  };

  // upsert는 충돌 시 지정한 모든 컬럼을 덮어쓰므로, design_code를 포함시키면 웹훅 재시도마다
  // 무작위로 재생성되어 버린다. 그래서 존재 여부를 먼저 확인해 insert/update를 분리한다.
  const { data: existingProject, error: findProjectErr } = await admin
    .from("client_projects")
    .select("id")
    .eq("wms_project_id", record.id)
    .maybeSingle();
  if (findProjectErr) return NextResponse.json({ error: findProjectErr.message }, { status: 500 });

  if (existingProject) {
    const { error: updateErr } = await admin.from("client_projects").update(commonFields).eq("id", existingProject.id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  } else {
    const { error: insertErr } = await admin.from("client_projects").insert({
      ...commonFields,
      wms_project_id: record.id,
      design_code: generateNextClientProjectDesignCode(),
    });
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
