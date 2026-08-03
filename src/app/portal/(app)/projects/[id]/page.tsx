import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { getClientProjectById } from "@/lib/data/client-projects";
import { listClientProjectFilesWithUrls, groupFilesByCategory } from "@/lib/data/client-project-files";
import { listEquipmentItems } from "@/lib/data/client-project-equipment";
import { clientProjectStageLabel } from "@/lib/labels";
import { ScheduleTimeline } from "@/components/portal/schedule-timeline";
import { ProjectFileList } from "@/components/portal/project-file-list";
import { ConstructionPhotoGallery } from "@/components/portal/construction-photo-gallery";
import { FileUploadField } from "@/components/shared/file-upload-field";
import { EquipmentItemsTable } from "@/components/shared/equipment-items-table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalProjectDetailPage({ params }: PageProps) {
  await requireClient();
  const { id } = await params;

  // RLS(client_read_own_projects)가 이미 소유권을 걸러주므로, 남의 프로젝트 id면
  // 여기서 project가 null이 되어 그대로 404 처리된다 — 별도 소유권 재검증은 불필요하다.
  const project = await getClientProjectById(id);
  if (!project) notFound();

  const [files, equipmentItems] = await Promise.all([
    listClientProjectFilesWithUrls(id),
    listEquipmentItems(id),
  ]);
  const grouped = groupFilesByCategory(files);

  return (
    <div className="max-w-3xl">
      <Link href="/portal" className="inline-flex items-center gap-1 text-sm text-aso-muted hover:text-aso-black mb-6">
        <ChevronLeft size={16} />
        프로젝트 목록
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-aso-black">{project.title}</h1>
        <span className="text-sm font-semibold text-aso-primary">{clientProjectStageLabel[project.stage]}</span>
      </div>
      <p className="font-num text-sm text-aso-muted mb-8">{project.designCode}</p>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">시공 일정</h2>
        <ScheduleTimeline project={project} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">그래픽 업로드</h2>
        <FileUploadField
          projectId={id}
          category="graphic_source"
          label="원본 그래픽 파일을 업로드해주세요."
          accept=".ai,.psd,.indd,.eps,.pdf,.zip,.dwg,.skp,.svg,.tif,.tiff,.jpg,.jpeg,.png,.cdr"
          initialFiles={grouped.graphic_source}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">최종 디자인</h2>
        <ProjectFileList label="관리자가 업로드한 최종 디자인 파일입니다." files={grouped.final_design} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">최종 도면</h2>
        <ProjectFileList label="관리자가 업로드한 최종 도면 파일입니다." files={grouped.final_drawing} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">그래픽 매뉴얼</h2>
        <ProjectFileList label="관리자가 업로드한 그래픽 매뉴얼입니다." files={grouped.graphic_manual} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">비품리스트</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-aso-muted">비품임대에서 선택해 등록완료한 항목입니다.</p>
              <Link
                href={`/portal/projects/${id}/equipment`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-aso-primary hover:underline shrink-0"
              >
                비품 선택하기
                <ChevronRight size={13} />
              </Link>
            </div>
            <EquipmentItemsTable items={equipmentItems} />
          </div>
          <FileUploadField
            projectId={id}
            category="equipment_list"
            label="또는 비품리스트 파일을 직접 업로드해주세요."
            accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.zip"
            initialFiles={grouped.equipment_list}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-aso-black mb-3">시공 사진</h2>
        <ConstructionPhotoGallery photos={grouped.construction_photo} />
      </section>

      {project.note && (
        <section className="mb-10">
          <h2 className="text-sm font-bold text-aso-black mb-3">메모</h2>
          <p className="text-sm text-aso-charcoal-2/80 whitespace-pre-line bg-white border border-aso-line p-4">{project.note}</p>
        </section>
      )}
    </div>
  );
}
