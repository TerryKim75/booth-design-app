import { RentalForm } from "@/app/admin/rentals/rental-form";
import { saveNewRental } from "@/app/admin/rentals/actions";

export default function NewRentalPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">비품 신규 등록</h1>
      <RentalForm action={saveNewRental} />
    </div>
  );
}
