import { BoothDesignForm } from "@/app/admin/booth-designs/booth-design-form";
import { saveNewBoothDesign } from "@/app/admin/booth-designs/actions";

export default function NewBoothDesignPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">시스템 부스 디자인 신규 등록</h1>
      <BoothDesignForm action={saveNewBoothDesign} />
    </div>
  );
}
