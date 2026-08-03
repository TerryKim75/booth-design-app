import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { getClientProjectById } from "@/lib/data/client-projects";
import { listEquipmentItems } from "@/lib/data/client-project-equipment";
import { listRentalItems } from "@/lib/data/rentals";
import { EquipmentPicker } from "@/components/portal/equipment-picker";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalProjectEquipmentPage({ params }: PageProps) {
  await requireClient();
  const { id } = await params;

  const project = await getClientProjectById(id);
  if (!project) notFound();

  const [{ items: rentalItems }, existingItems] = await Promise.all([
    listRentalItems({ pageSize: 500, sort: "featured" }),
    listEquipmentItems(id),
  ]);

  return (
    <div>
      <Link href={`/portal/projects/${id}`} className="inline-flex items-center gap-1 text-sm text-aso-muted hover:text-aso-black mb-6">
        <ChevronLeft size={16} />
        {project.title}
      </Link>

      <h1 className="text-2xl font-bold text-aso-black mb-1">비품 선택</h1>
      <p className="text-sm text-aso-muted mb-8">
        비품임대 카탈로그에서 이 프로젝트에 필요한 비품을 선택하세요. 등록완료 시 프로젝트의 비품리스트에 자동으로 반영됩니다.
      </p>

      <EquipmentPicker projectId={id} rentalItems={rentalItems} initialItems={existingItems} />
    </div>
  );
}
