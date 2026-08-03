"use client";

import { RowActions } from "@/components/admin/row-actions";
import { setPortfolioStatus, setPortfolioFeatured, duplicateExistingPortfolio, removePortfolio } from "@/app/admin/portfolio/actions";
import type { ContentStatus } from "@/types/domain";

export function PortfolioRowActions({ id, status, featured }: { id: string; status: ContentStatus; featured: boolean }) {
  return (
    <RowActions
      editHref={`/admin/portfolio/${id}/edit`}
      status={status}
      featured={featured}
      onStatusChange={(s) => setPortfolioStatus(id, s)}
      onToggleFeatured={(v) => setPortfolioFeatured(id, v)}
      onDuplicate={() => duplicateExistingPortfolio(id)}
      onDelete={() => removePortfolio(id)}
    />
  );
}
