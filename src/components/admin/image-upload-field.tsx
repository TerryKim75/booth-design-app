"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import type { AdminImageBucket } from "@/lib/storage/upload-image";
import { compressImageForUpload } from "@/lib/image-compress";

async function uploadAdminImage(fd: FormData): Promise<{ url: string } | { error: string }> {
  const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
  let payload: { url?: string; error?: string } = {};
  try {
    payload = await res.json();
  } catch {
    return { error: `업로드 실패 (HTTP ${res.status})` };
  }
  if (!res.ok || !payload.url) {
    return { error: payload.error ?? `업로드 실패 (HTTP ${res.status})` };
  }
  return { url: payload.url };
}

/**
 * 경로 직접 입력 대신 실제 파일을 첨부해 업로드하는 이미지 필드.
 * 선택한 원본 이미지는 서버에서 웹에 적합한 크기로 자동 리사이즈된 뒤 Supabase Storage에 저장되고,
 * 결과 URL은 hidden input(name)에 담겨 기존 폼 제출/검증 로직을 그대로 재사용한다.
 */
export function ImageUploadField({
  name,
  label,
  bucket,
  defaultValue,
  multiple,
  full,
}: {
  name: string;
  label: string;
  bucket: AdminImageBucket;
  defaultValue?: string;
  multiple?: boolean;
  full?: boolean;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue ? defaultValue.split("\n").filter(Boolean) : []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const value = multiple ? urls.join("\n") : (urls[0] ?? "");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    const uploaded: string[] = [];
    try {
      for (const rawFile of Array.from(files)) {
        const file = await compressImageForUpload(rawFile);
        const fd = new FormData();
        fd.set("bucket", bucket);
        fd.set("file", file);
        const res = await uploadAdminImage(fd);
        if ("error" in res) {
          setError(res.error);
          continue;
        }
        uploaded.push(res.url);
      }
      setUrls((prev) => (multiple ? [...prev, ...uploaded] : uploaded.slice(-1)));
    } catch (err) {
      setError(`업로드 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs text-aso-muted mb-1">{label}</label>
      <input type="hidden" name={name} value={value} />

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {urls.map((u, i) => (
            <div key={`${u}-${i}`} className="relative w-20 h-20 border border-aso-line rounded-lg overflow-hidden bg-aso-offwhite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white"
                aria-label="이미지 제거"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-xs font-semibold border border-aso-line rounded-lg px-3 py-2 cursor-pointer hover:border-aso-black transition-colors">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "업로드 중..." : multiple ? "이미지 추가" : urls.length > 0 ? "이미지 교체" : "이미지 선택"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
