import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * 업로드 보안 정책
 * - 확장자 화이트리스트만 허용 (실행 파일 업로드 원천 차단)
 * - MIME 타입도 함께 검증 (확장자 위조 방어)
 * - 파일당 최대 용량 제한
 */
export const INQUIRY_ATTACHMENT_RULES = {
  maxSizeBytes: 25 * 1024 * 1024, // 25MB
  allowedExtensions: ["pdf", "jpg", "jpeg", "png", "zip", "dwg", "skp"],
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream", // DWG/SKP는 브라우저가 정확한 MIME을 못 붙이는 경우가 많아 확장자 검증과 병행
  ],
};

const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "sh", "com", "msi", "js", "vbs", "ps1", "scr", "jar", "app", "dll", "apk",
];

export class UploadValidationError extends Error {}

export function validateUploadFile(
  file: File,
  rules: { maxSizeBytes: number; allowedExtensions: string[]; allowedMimeTypes: string[] }
) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (BLOCKED_EXTENSIONS.includes(ext)) {
    throw new UploadValidationError(`실행 파일 형식(.${ext})은 업로드할 수 없습니다.`);
  }
  if (!rules.allowedExtensions.includes(ext)) {
    throw new UploadValidationError(`허용되지 않는 파일 형식입니다: .${ext}`);
  }
  if (file.size > rules.maxSizeBytes) {
    throw new UploadValidationError(`파일 용량이 제한(${Math.round(rules.maxSizeBytes / 1024 / 1024)}MB)을 초과했습니다.`);
  }
  if (file.type && !rules.allowedMimeTypes.includes(file.type)) {
    // DWG/SKP처럼 브라우저가 빈 MIME("")을 주는 경우는 확장자 검증으로 대체 허용
    if (file.type !== "") {
      throw new UploadValidationError(`허용되지 않는 파일 형식입니다: ${file.type}`);
    }
  }
}

function safeFileName(original: string) {
  const ext = original.split(".").pop()?.toLowerCase() ?? "bin";
  return `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
}

/** 문의 첨부파일 저장 — Supabase Storage(inquiry-attachments) 또는 로컬 /public/uploads 폴백 */
export async function saveInquiryAttachment(file: File): Promise<string> {
  validateUploadFile(file, INQUIRY_ATTACHMENT_RULES);
  const fileName = safeFileName(file.name);

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from("inquiry-attachments")
      .upload(fileName, buffer, { contentType: file.type || "application/octet-stream" });
    if (error) throw error;
    return fileName; // 비공개 버킷: 관리자 화면에서 서명 URL로 조회
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "inquiry-attachments");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/inquiry-attachments/${fileName}`;
}
