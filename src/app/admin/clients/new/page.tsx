import { ClientForm } from "@/app/admin/clients/client-form";
import { saveNewClient } from "@/app/admin/clients/actions";

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">고객사 신규 등록</h1>
      <ClientForm action={saveNewClient} />
    </div>
  );
}
