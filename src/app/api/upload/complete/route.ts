import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyProjectAccessForCategory, CLIENT_PROJECT_FILES_BUCKET } from "@/lib/storage/client-project-upload";
import { UploadAuthorizationError } from "@/lib/storage/client-project-upload";
import type { ClientProjectFileCategory } from "@/types/domain";

export const runtime = "nodejs";

interface CompleteBody {
  projectId?: string;
  category?: ClientProjectFileCategory;
  bucket?: string;
  path?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * signed URL로 Storage에 직접 업로드가 끝난 뒤 client_project_files row를 기록한다.
 * 티켓 발급 시점의 권한 검증을 여기서도 한번 더 수행하고(defense in depth),
 * 실제 insert는 RLS-scoped 클라이언트로 수행해 0008 마이그레이션의 RLS 정책이
 * 한 번 더 최종 방어선 역할을 하도록 한다.
 */
export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: CompleteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청을 읽는 중 오류가 발생했습니다." }, { status: 400 });
  }

  if (!body.projectId || !body.category || !body.bucket || !body.path || !body.fileName || typeof body.fileSize !== "number") {
    return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
  }
  if (body.bucket !== CLIENT_PROJECT_FILES_BUCKET) {
    return NextResponse.json({ error: "잘못된 업로드 대상입니다." }, { status: 400 });
  }

  let clientId: string;
  try {
    const result = await verifyProjectAccessForCategory(profile, body.projectId, body.category, body.fileName, body.fileSize);
    clientId = result.clientId;
  } catch (err) {
    if (err instanceof UploadAuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "업로드 권한을 확인하는 중 오류가 발생했습니다." }, { status: 500 });
  }

  if (!body.path.startsWith(`${clientId}/${body.projectId}/${body.category}/`)) {
    return NextResponse.json({ error: "업로드 경로가 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("client_project_files")
    .insert({
      project_id: body.projectId,
      category: body.category,
      file_name: body.fileName,
      storage_bucket: body.bucket,
      storage_path: body.path,
      mime_type: body.mimeType ?? "",
      file_size_bytes: body.fileSize,
      uploaded_by: profile.id,
      uploaded_by_role: profile.role,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: `업로드 기록 실패: ${error.message}` }, { status: 500 });
  }

  const { data: signed } = await supabase.storage.from(body.bucket).createSignedUrl(body.path, 60 * 10);

  return NextResponse.json({
    file: {
      id: data.id,
      signedUrl: signed?.signedUrl ?? null,
      projectId: data.project_id,
      category: data.category,
      fileName: data.file_name,
      storageBucket: data.storage_bucket,
      storagePath: data.storage_path,
      mimeType: data.mime_type,
      fileSizeBytes: data.file_size_bytes,
      uploadedBy: data.uploaded_by,
      uploadedByRole: data.uploaded_by_role,
      createdAt: data.created_at,
    },
  });
}
