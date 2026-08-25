import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { requireStaffOrAdmin } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ADMIN_IMAGE_BUCKETS } from "@/lib/storage/upload-image";

export const runtime = "nodejs";

/**
 * 관리자 이미지 업로드용 Route Handler.
 * Server Action 대신 일반 POST 엔드포인트로 구현 — Vercel에서 바이너리 파일을 담은
 * multipart/form-data를 다루기에 더 안정적이고 예측 가능한 경로다.
 */
export async function POST(request: Request) {
  try {
    await requireStaffOrAdmin();
  } catch {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "요청을 읽는 중 오류가 발생했습니다." }, { status: 400 });
  }

  const bucket = formData.get("bucket");
  const file = formData.get("file");

  if (typeof bucket !== "string" || !(ADMIN_IMAGE_BUCKETS as readonly string[]).includes(bucket)) {
    return NextResponse.json({ error: "잘못된 업로드 대상입니다." }, { status: 400 });
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

  let outputBuffer: Buffer;
  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      // JPEG은 알파 채널을 지원하지 않아 투명 PNG를 그대로 변환하면 sharp가 기본값인
      // 검정색으로 배경을 채운다. 흰 배경으로 명시적으로 깔아준다.
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 82 })
      .toBuffer();
    // sharp의 작은 출력 버퍼는 Node의 공유 버퍼 풀(Buffer.poolSize)에서 할당되는 경우가 있어,
    // 이후 라이브러리가 .buffer(ArrayBuffer)를 byteOffset/length 없이 그대로 읽으면 풀에 함께
    // 있던 다른 데이터까지 섞여 손상된다. 업로드 전에 독립된 메모리로 명시적으로 복사한다.
    outputBuffer = Buffer.from(resized);
  } catch (err) {
    return NextResponse.json(
      { error: `이미지 처리 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ url: `data:image/jpeg;base64,${outputBuffer.toString("base64")}` });
  }

  const path = `${randomUUID()}.jpg`;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from(bucket).upload(path, outputBuffer, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: `Storage 업로드 실패: ${error.message}` }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
