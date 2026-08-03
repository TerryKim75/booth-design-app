import type { ClientProjectFileWithUrl } from "@/lib/data/client-project-files";

export function ConstructionPhotoGallery({ photos }: { photos: ClientProjectFileWithUrl[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-aso-charcoal-2/50 border border-dashed border-aso-line px-3 py-4 text-center">등록된 시공 사진이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((p) => (
        <a
          key={p.id}
          href={p.signedUrl ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="block aspect-square bg-aso-offwhite border border-aso-line overflow-hidden"
        >
          {p.signedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.signedUrl} alt={p.fileName} className="w-full h-full object-cover" />
          )}
        </a>
      ))}
    </div>
  );
}
