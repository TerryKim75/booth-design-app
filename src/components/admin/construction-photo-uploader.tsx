"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Trash2 } from "lucide-react";
import type { UploadedFileView } from "@/components/shared/file-upload-field";

export function ConstructionPhotoUploader({
  projectId,
  initialPhotos,
  onDelete,
}: {
  projectId: string;
  initialPhotos: UploadedFileView[];
  onDelete?: (id: string) => Promise<void>;
}) {
  const [photos, setPhotos] = useState<UploadedFileView[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-client-photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `업로드 실패 (HTTP ${res.status})`);
      setPhotos((prev) => [json.file, ...prev]);
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
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <p className="text-xs text-aso-muted mb-2">시공 사진</p>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square bg-aso-offwhite border border-aso-line overflow-hidden group">
              {p.signedUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.signedUrl} alt={p.fileName} className="w-full h-full object-cover" />
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="사진 삭제"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-xs font-semibold border border-aso-line px-3 py-2 cursor-pointer hover:border-aso-black transition-colors">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "업로드 중..." : "사진 추가"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
