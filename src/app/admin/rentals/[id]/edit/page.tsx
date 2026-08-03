import { notFound } from "next/navigation";
import { RentalForm } from "@/app/admin/rentals/rental-form";
import { updateExistingRental } from "@/app/admin/rentals/actions";
import { getRentalItemById } from "@/lib/data/rentals";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRentalPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getRentalItemById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">비품 수정 — {item.name}</h1>
      <RentalForm action={updateExistingRental.bind(null, id)} initial={item} />
    </div>
  );
}
