import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { requireStaffOrAdmin } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { CLIENT_PROJECT_PHOTOS_BUCKET } from "@/lib/storage/client-project-upload";

export const runtime = "nodejs";

/**
 * 시공 사진 업로드 — 그래픽 원본과 달리 촬영 사진은 압축 후 용량이 작아
 * 기존 /api/admin/upload-image와 동일하게 Vercel을 통해 한 번에 처리한다.
 * 스태프/관리자 전용(고객사는 시공 사진을 올리지 않는다).
 */
export async function POST(request: Request) {
  let profile;
  try {
    profile = await requireStaffOrAdmin();
  } catch {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "요청을 읽는 중 오류가 발생했습니다." }, { status: 400 });
  }

  const projectId = formData.get("projectId");
  const file = formData.get("file");

  if (typeof projectId !== "string" || !projectId) {
    return NextResponse.json({ error: "프로젝트 정보가 없습니다." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "파일 크기는 20MB 이하로 업로드해주세요." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: project, error: projectErr } = await admin
    .from("client_projects")
    .select("id, client_id")
    .eq("id", projectId)
    .maybeSingle();
  if (projectErr) {
    return NextResponse.json({ error: `프로젝트 조회 실패: ${projectErr.message}` }, { status: 500 });
  }
  if (!project) {
    return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
  }

  let outputBuffer: Buffer;
  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    // 작은 sharp 출력 버퍼가 Node의 공유 버퍼 풀에서 할당되어 이후 업로드 경로가
    // byteOffset/length 없이 ArrayBuffer를 그대로 읽으면 손상될 수 있다 — 독립 복사로 방지.
    outputBuffer = Buffer.from(resized);
  } catch (err) {
    return NextResponse.json(
      { error: `이미지 처리 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  const path = `${project.client_id}/${project.id}/${randomUUID()}.jpg`;
  const { error: uploadErr } = await admin.storage.from(CLIENT_PROJECT_PHOTOS_BUCKET).upload(path, outputBuffer, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (uploadErr) {
    return NextResponse.json({ error: `Storage 업로드 실패: ${uploadErr.message}` }, { status: 500 });
  }

  const { data: fileRow, error: insertErr } = await admin
    .from("client_project_files")
    .insert({
      project_id: project.id,
      category: "construction_photo",
      file_name: file.name,
      storage_bucket: CLIENT_PROJECT_PHOTOS_BUCKET,
      storage_path: path,
      mime_type: "image/jpeg",
      file_size_bytes: outputBuffer.byteLength,
      uploaded_by: profile.id,
      uploaded_by_role: profile.role,
    })
    .select("*")
    .single();
  if (insertErr) {
    return NextResponse.json({ error: `업로드 기록 실패: ${insertErr.message}` }, { status: 500 });
  }

  const { data: signed } = await admin.storage.from(CLIENT_PROJECT_PHOTOS_BUCKET).createSignedUrl(path, 60 * 10);

  return NextResponse.json({
    file: {
      id: fileRow.id,
      fileName: fileRow.file_name,
      fileSizeBytes: fileRow.file_size_bytes,
      signedUrl: signed?.signedUrl ?? null,
      createdAt: fileRow.created_at,
    },
  });
}
