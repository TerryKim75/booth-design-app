import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ClientProjectFile, ClientProjectFileCategory } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToFile(row: DbRow): ClientProjectFile {
  return {
    id: row.id,
    projectId: row.project_id,
    category: row.category,
    fileName: row.file_name,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    uploadedBy: row.uploaded_by ?? null,
    uploadedByRole: row.uploaded_by_role,
    createdAt: row.created_at,
  };
}

export interface ClientProjectFileWithUrl extends ClientProjectFile {
  signedUrl: string | null;
}

/** RLS-scoped 클라이언트로 조회하므로 고객사 세션이면 자동으로 자기 프로젝트 파일만 반환된다. */
export async function listClientProjectFilesWithUrls(projectId: string): Promise<ClientProjectFileWithUrl[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("client_project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const files = (data ?? []).map(rowToFile);
  return Promise.all(
    files.map(async (f) => {
      const { data: signed } = await supabase.storage.from(f.storageBucket).createSignedUrl(f.storagePath, 60 * 10);
      return { ...f, signedUrl: signed?.signedUrl ?? null };
    })
  );
}

export function groupFilesByCategory(files: ClientProjectFileWithUrl[]): Record<ClientProjectFileCategory, ClientProjectFileWithUrl[]> {
  const grouped: Record<ClientProjectFileCategory, ClientProjectFileWithUrl[]> = {
    graphic_source: [],
    final_design: [],
    final_drawing: [],
    graphic_manual: [],
    equipment_list: [],
    construction_photo: [],
  };
  for (const f of files) grouped[f.category].push(f);
  return grouped;
}

/** 삭제는 admin 전용 — Storage 객체와 DB row를 함께 제거한다. */
export async function deleteClientProjectFile(id: string): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { data: file, error: fetchErr } = await admin
    .from("client_project_files")
    .select("storage_bucket, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!file) return;

  await admin.storage.from(file.storage_bucket).remove([file.storage_path]);
  const { error } = await admin.from("client_project_files").delete().eq("id", id);
  if (error) throw error;
}
