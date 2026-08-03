import { notFound } from "next/navigation";
import { BoothDesignForm } from "@/app/admin/booth-designs/booth-design-form";
import { updateExistingBoothDesign } from "@/app/admin/booth-designs/actions";
import { getBoothDesignById } from "@/lib/data/booth-designs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBoothDesignPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getBoothDesignById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">부스 디자인 수정 — {item.designCode}</h1>
      <BoothDesignForm action={updateExistingBoothDesign.bind(null, id)} initial={item} />
    </div>
  );
}
