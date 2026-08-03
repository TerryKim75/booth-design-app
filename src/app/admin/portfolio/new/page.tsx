import { PortfolioForm } from "@/app/admin/portfolio/portfolio-form";
import { saveNewPortfolio } from "@/app/admin/portfolio/actions";

export default function NewPortfolioPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">포트폴리오 신규 등록</h1>
      <PortfolioForm action={saveNewPortfolio} />
    </div>
  );
}
