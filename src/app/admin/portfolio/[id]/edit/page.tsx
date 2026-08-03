import { notFound } from "next/navigation";
import { PortfolioForm } from "@/app/admin/portfolio/portfolio-form";
import { updateExistingPortfolio } from "@/app/admin/portfolio/actions";
import { getPortfolioById } from "@/lib/data/portfolio";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getPortfolioById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-8">포트폴리오 수정 — {item.title}</h1>
      <PortfolioForm action={updateExistingPortfolio.bind(null, id)} initial={item} />
    </div>
  );
}
