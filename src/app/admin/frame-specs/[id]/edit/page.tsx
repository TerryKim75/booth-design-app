import { notFound } from "next/navigation";
import { FrameSpecForm } from "@/app/admin/frame-specs/frame-spec-form";
import { updateExistingFrameSpec } from "@/app/admin/frame-specs/actions";
import { getFrameSpecById } from "@/lib/data/frame-specs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFrameSpecPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getFrameSpecById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">Frame Specification 수정 — {item.name}</h1>
      <FrameSpecForm action={updateExistingFrameSpec.bind(null, id)} initial={item} />
    </div>
  );
}
