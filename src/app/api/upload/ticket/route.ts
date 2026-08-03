import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { authorizeUploadTarget, UploadAuthorizationError } from "@/lib/storage/client-project-upload";
import type { ClientProjectFileCategory } from "@/types/domain";

export const runtime = "nodejs";

/**
 * 대용량 파일(그래픽 원본 등)을 Vercel 서버를 거치지 않고 브라우저에서 Supabase
 * Storage로 직접 업로드하기 위한 서명 URL 발급 엔드포인트. 실질적인 권한 검증은
 * authorizeUploadTarget()에서 수행되며, 여기서는 파일 바이트를 전혀 다루지 않는다
 * (JSON 요청/응답만 처리하므로 Vercel의 요청 본문 크기 제한과 무관하다).
 */
export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { projectId?: string; category?: ClientProjectFileCategory; fileName?: string; fileSize?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청을 읽는 중 오류가 발생했습니다." }, { status: 400 });
  }

  if (!body.projectId || !body.category || !body.fileName || typeof body.fileSize !== "number") {
    return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
  }

  let authorized;
  try {
    authorized = await authorizeUploadTarget(profile, {
      projectId: body.projectId,
      category: body.category,
      fileName: body.fileName,
      fileSize: body.fileSize,
    });
  } catch (err) {
    if (err instanceof UploadAuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "업로드 권한을 확인하는 중 오류가 발생했습니다." }, { status: 500 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.storage.from(authorized.bucket).createSignedUploadUrl(authorized.path);
  if (error) {
    return NextResponse.json({ error: `업로드 URL 발급 실패: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    bucket: authorized.bucket,
    path: authorized.path,
    signedUrl: data.signedUrl,
    token: data.token,
  });
}
