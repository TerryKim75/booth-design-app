import "server-only";
import { randomUUID } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClientProjectFileCategory, UserRole } from "@/types/domain";
import type { SessionProfile } from "@/lib/auth";

export const CLIENT_PROJECT_FILES_BUCKET = "client-project-files";
export const CLIENT_PROJECT_PHOTOS_BUCKET = "client-project-photos";

const UPLOADABLE_CATEGORIES: ClientProjectFileCategory[] = [
  "graphic_source", "final_design", "final_drawing", "graphic_manual", "equipment_list",
];
const CLIENT_UPLOADABLE_CATEGORIES: ClientProjectFileCategory[] = ["graphic_source", "equipment_list"];

const CATEGORY_RULES: Record<Exclude<ClientProjectFileCategory, "construction_photo">, { maxSizeBytes: number; allowedExtensions: string[] }> = {
  graphic_source: {
    maxSizeBytes: 100 * 1024 * 1024,
    allowedExtensions: ["ai", "psd", "indd", "eps", "pdf", "zip", "dwg", "skp", "svg", "tif", "tiff", "jpg", "jpeg", "png", "cdr"],
  },
  final_design: {
    maxSizeBytes: 100 * 1024 * 1024,
    allowedExtensions: ["pdf", "ai", "jpg", "jpeg", "png", "zip"],
  },
  final_drawing: {
    maxSizeBytes: 100 * 1024 * 1024,
    allowedExtensions: ["pdf", "dwg", "skp", "ai", "zip"],
  },
  graphic_manual: {
    maxSizeBytes: 100 * 1024 * 1024,
    allowedExtensions: ["pdf", "ppt", "pptx", "doc", "docx", "zip"],
  },
  equipment_list: {
    maxSizeBytes: 20 * 1024 * 1024,
    allowedExtensions: ["pdf", "xls", "xlsx", "csv", "doc", "docx", "zip"],
  },
};

const BLOCKED_EXTENSIONS = ["exe", "bat", "cmd", "sh", "com", "msi", "js", "vbs", "ps1", "scr", "jar", "app", "dll", "apk"];

export class UploadAuthorizationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface UploadTarget {
  projectId: string;
  category: ClientProjectFileCategory;
  fileName: string;
  fileSize: number;
}

export interface AuthorizedUpload {
  bucket: string;
  path: string;
  clientId: string;
  uploadedByRole: UserRole;
}

/**
 * project_id가 호출자(스태프/관리자는 전체, 고객사는 자기 client_id) 소유인지
 * RLS-scoped 클라이언트로 확인하고(남의 projectId면 이미 여기서 0건), 카테고리별
 * 업로드 권한(고객사는 graphic_source만) + 확장자/용량을 검증한다.
 * 티켓 발급(authorizeUploadTarget)과 업로드 완료 기록(verifyProjectAccessForCategory)
 * 양쪽에서 재사용해 이중으로 권한을 확인한다.
 */
export async function verifyProjectAccessForCategory(
  profile: SessionProfile,
  projectId: string,
  category: ClientProjectFileCategory,
  fileName: string,
  fileSize: number
): Promise<{ clientId: string }> {
  if (!UPLOADABLE_CATEGORIES.includes(category)) {
    throw new UploadAuthorizationError("업로드할 수 없는 파일 카테고리입니다.");
  }
  if (profile.role === "client" && !CLIENT_UPLOADABLE_CATEGORIES.includes(category)) {
    throw new UploadAuthorizationError("고객사 계정은 그래픽 원본 파일과 비품리스트만 업로드할 수 있습니다.", 403);
  }

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    throw new UploadAuthorizationError(`실행 파일 형식(.${ext})은 업로드할 수 없습니다.`);
  }
  const rules = CATEGORY_RULES[category as Exclude<ClientProjectFileCategory, "construction_photo">];
  if (!rules.allowedExtensions.includes(ext)) {
    throw new UploadAuthorizationError(`허용되지 않는 파일 형식입니다: .${ext}`);
  }
  if (fileSize > rules.maxSizeBytes) {
    throw new UploadAuthorizationError(`파일 용량이 제한(${Math.round(rules.maxSizeBytes / 1024 / 1024)}MB)을 초과했습니다.`);
  }

  const supabase = await createServerSupabaseClient();
  const { data: project, error } = await supabase
    .from("client_projects")
    .select("id, client_id")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  if (!project) {
    throw new UploadAuthorizationError("프로젝트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
  }

  return { clientId: project.client_id };
}

export async function authorizeUploadTarget(profile: SessionProfile, target: UploadTarget): Promise<AuthorizedUpload> {
  const { clientId } = await verifyProjectAccessForCategory(profile, target.projectId, target.category, target.fileName, target.fileSize);

  const safeName = `${randomUUID()}-${target.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const path = `${clientId}/${target.projectId}/${target.category}/${safeName}`;

  return { bucket: CLIENT_PROJECT_FILES_BUCKET, path, clientId, uploadedByRole: profile.role };
}
