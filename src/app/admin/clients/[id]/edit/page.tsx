import { notFound } from "next/navigation";
import { ClientForm } from "@/app/admin/clients/client-form";
import { updateExistingClient } from "@/app/admin/clients/actions";
import { getClientById } from "@/lib/data/clients";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">고객사 정보 수정 — {client.companyName}</h1>
      <ClientForm action={updateExistingClient.bind(null, id)} initial={client} />
    </div>
  );
}
