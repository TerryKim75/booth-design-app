import { FileIcon } from "lucide-react";
import type { ClientProjectFileWithUrl } from "@/lib/data/client-project-files";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function ProjectFileList({ label, files }: { label: string; files: ClientProjectFileWithUrl[] }) {
  return (
    <div>
      <p className="text-xs text-aso-muted mb-2">{label}</p>
      {files.length === 0 ? (
        <p className="text-sm text-aso-charcoal-2/50 border border-dashed border-aso-line px-3 py-4 text-center">등록된 파일이 없습니다.</p>
      ) : (
        <ul className="space-y-1.5">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
