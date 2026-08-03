"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, FileIcon, Trash2 } from "lucide-react";
import type { ClientProjectFileCategory } from "@/types/domain";

export interface UploadedFileView {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  signedUrl: string | null;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

async function requestTicket(payload: { projectId: string; category: ClientProjectFileCategory; fileName: string; fileSize: number }) {
  const res = await fetch("/api/upload/ticket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `업로드 URL 발급 실패 (HTTP ${res.status})`);
  return json as { bucket: string; path: string; signedUrl: string; token: string };
}

async function completeUpload(payload: {
  projectId: string;
  category: ClientProjectFileCategory;
  bucket: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}) {
  const res = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `업로드 기록 실패 (HTTP ${res.status})`);
  return json.file;
}

/**
 * 대용량 파일을 Vercel 서버를 거치지 않고 브라우저에서 Supabase Storage로 직접
 * 업로드하는 공용 컴포넌트. 티켓 발급(/api/upload/ticket) → signed URL로 직접 PUT →
 * 업로드 완료 기록(/api/upload/complete) 3단계로 동작하며, 각 단계의 서버 쪽 권한
 * 검증은 src/lib/storage/client-project-upload.ts에서 수행된다.
 */
export function FileUploadField({
  projectId,
  category,
  label,
  accept,
  initialFiles,
  onDelete,
}: {
  projectId: string;
  category: ClientProjectFileCategory;
  label: string;
  accept?: string;
  initialFiles: UploadedFileView[];
  onDelete?: (id: string) => Promise<void>;
}) {
  const [files, setFiles] = useState<UploadedFileView[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const ticket = await requestTicket({ projectId, category, fileName: file.name, fileSize: file.size });
      const putRes = await fetch(ticket.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!putRes.ok) throw new Error(`파일 업로드 실패 (HTTP ${putRes.status})`);

      const recorded = await completeUpload({
        projectId,
        category,
        bucket: ticket.bucket,
        path: ticket.path,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "",
      });
      setFiles((prev) => [{ id: recorded.id, fileName: recorded.fileName, fileSizeBytes: recorded.fileSizeBytes, signedUrl: recorded.signedUrl ?? null, createdAt: recorded.createdAt }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <p className="text-xs text-aso-muted mb-2">{label}</p>

      {files.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-sm border border-aso-line px-3 py-2 bg-white">
              <FileIcon size={14} className="text-aso-muted shrink-0" />
              {f.signedUrl ? (
                <a href={f.signedUrl} target="_blank" rel="noreferrer" className="truncate hover:underline flex-1">
                  {f.fileName}
                </a>
              ) : (
                <span className="truncate flex-1">{f.fileName}</span>
              )}
              <span className="text-xs text-aso-muted shrink-0">{formatBytes(f.fileSizeBytes)}</span>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(f.id)}
                  disabled={deletingId === f.id}
                  className="text-aso-muted hover:text-red-600 shrink-0"
                  aria-label="파일 삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <label className="inline-flex items-center gap-2 text-xs font-semibold border border-aso-line px-3 py-2 cursor-pointer hover:border-aso-black transition-colors">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "업로드 중..." : "파일 업로드"}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
