import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeroBand } from "@/components/ui/page-hero-band";
import { SafeImage } from "@/components/ui/safe-image";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryTabs } from "@/components/downloads/category-tabs";
import { listDownloadFiles, canAccessDownload } from "@/lib/data/downloads";
import { getSessionProfile } from "@/lib/auth";
import { downloadCategoryLabel } from "@/lib/labels";
import { Lock, FileDown } from "lucide-react";
import type { DownloadCategory } from "@/types/domain";

export const metadata: Metadata = {
  title: "다운로드",
  description: "3D 소스, CAD 도면, 디자인 매뉴얼, 그래픽 가이드라인 등 ASO System 기술자료를 다운로드하세요.",
  alternates: { canonical: "/downloads" },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DownloadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? (sp.category as DownloadCategory) : undefined;

  const [{ items }, viewer] = await Promise.all([
    listDownloadFiles({ category: category ? [category] : undefined, pageSize: 200 }),
    getSessionProfile(),
  ]);

  return (
    <div className="pb-24">
      <PageHeroBand
        eyebrow="Downloads"
        title="다운로드"
        description="3D 소스, CAD 도면, 매뉴얼 등 기술자료를 카테고리별로 확인하세요."
      />
      <Container className="pt-10">
        <CategoryTabs />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 min-w-0">
          {items.map((f) => {
            const accessible = canAccessDownload(f.accessLevel, viewer);
            return (
              <Card key={f.id} className="min-w-0 flex flex-col py-0 gap-0">
                <div className="relative aspect-[4/3] bg-aso-offwhite shrink-0">
                  <SafeImage src={f.thumbnail} alt={f.title} fill className="object-cover" />
                </div>
                <CardContent className="p-3 min-w-0 flex-1 flex flex-col">
                  <p className="text-[10px] font-semibold tracking-wide text-aso-muted mb-1 truncate">{downloadCategoryLabel[f.category]}</p>
                  <h3 className="font-bold text-aso-black text-xs leading-snug mb-1.5 line-clamp-2">{f.title}</h3>
                  <p className="text-[11px] text-aso-charcoal-2/70 leading-relaxed mb-2 line-clamp-2">{f.description}</p>
                  <p className="font-num text-[10px] text-aso-muted mb-2.5 truncate">
                    {f.fileType} · {f.fileSize} · {f.version} · {new Date(f.updatedAt).toLocaleDateString("ko-KR")}
                  </p>
                  <div className="mt-auto">
                    {accessible ? (
                      <a
                        href={f.fileUrl}
                        download
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-aso-primary hover:underline min-h-8"
                      >
                        <FileDown size={13} className="shrink-0" /> 다운로드
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-aso-muted min-h-8">
                        <Lock size={12} className="shrink-0" />
                        <span className="truncate">{f.accessLevel === "member" ? "로그인 후 다운로드 가능" : "담당자·관리자 전용"}</span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
