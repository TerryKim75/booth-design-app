"use client";

import { FileUploadField } from "@/components/shared/file-upload-field";
import { ConstructionPhotoUploader } from "@/components/admin/construction-photo-uploader";
import { removeProjectFile } from "@/app/admin/client-projects/actions";
import type { ClientProjectFileWithUrl } from "@/lib/data/client-project-files";

export function ClientProjectFilesPanel({
  projectId,
  filesByCategory,
}: {
  projectId: string;
  filesByCategory: {
    graphic_source: ClientProjectFileWithUrl[];
    final_design: ClientProjectFileWithUrl[];
    final_drawing: ClientProjectFileWithUrl[];
    graphic_manual: ClientProjectFileWithUrl[];
    equipment_list: ClientProjectFileWithUrl[];
    construction_photo: ClientProjectFileWithUrl[];
  };
}) {
  const onDelete = (fileId: string) => removeProjectFile(projectId, fileId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <FileUploadField
        projectId={projectId}
        category="graphic_source"
        label="그래픽 업로드 (원본, 고객사도 업로드 가능)"
        accept=".ai,.psd,.indd,.eps,.pdf,.zip,.dwg,.skp,.svg,.tif,.tiff,.jpg,.jpeg,.png,.cdr"
        initialFiles={filesByCategory.graphic_source}
        onDelete={onDelete}
      />
      <FileUploadField
        projectId={projectId}
        category="final_design"
        label="최종 디자인"
        accept=".pdf,.ai,.jpg,.jpeg,.png,.zip"
        initialFiles={filesByCategory.final_design}
        onDelete={onDelete}
      />
      <FileUploadField
        projectId={projectId}
        category="final_drawing"
        label="최종 도면"
        accept=".pdf,.dwg,.skp,.ai,.zip"
        initialFiles={filesByCategory.final_drawing}
        onDelete={onDelete}
      />
      <FileUploadField
        projectId={projectId}
        category="graphic_manual"
        label="그래픽 매뉴얼"
        accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
        initialFiles={filesByCategory.graphic_manual}
        onDelete={onDelete}
      />
      <FileUploadField
        projectId={projectId}
        category="equipment_list"
        label="비품리스트 (직접 업로드, 고객사도 업로드 가능)"
        accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.zip"
        initialFiles={filesByCategory.equipment_list}
        onDelete={onDelete}
      />
      <ConstructionPhotoUploader projectId={projectId} initialPhotos={filesByCategory.construction_photo} onDelete={onDelete} />
    </div>
  );
}
