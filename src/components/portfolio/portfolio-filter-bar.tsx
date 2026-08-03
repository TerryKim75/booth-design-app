"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown, SingleSelectList } from "@/components/ui/filter-dropdown";
import { getArrayParam, buildQueryString } from "@/lib/query-params";
import { projectTypeLabel } from "@/lib/labels";
import type { ProjectType } from "@/types/domain";

export interface PortfolioFacetOptions {
  years: number[];
  countries: string[];
  industries: string[];
  projectTypes: ProjectType[];
}

/** 비품 임대 필터 바와 동일한 레이아웃: 타이틀 아래 가로 드롭다운 버튼 행(전부 단일 선택). */
export function PortfolioFilterBar({ facets }: { facets: PortfolioFacetOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const year = getArrayParam(searchParams, "year")[0];
  const country = getArrayParam(searchParams, "country")[0];
  const industry = getArrayParam(searchParams, "industry")[0];
  const projectType = getArrayParam(searchParams, "projectType")[0] as ProjectType | undefined;
  const sort = searchParams.get("sort") ?? "latest";

  const hasFilters = Boolean(year || country || industry || projectType);

  function setSingle(key: string, value: string | undefined) {
    router.push(`${pathname}?${buildQueryString(searchParams, { [key]: value ? [value] : [] })}`, { scroll: false });
  }

  function setSort(value: string) {
    router.push(`${pathname}?${buildQueryString(searchParams, { sort: value })}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="연도" active={Boolean(year)}>
        <SingleSelectList options={facets.years.map(String)} value={year} onChange={(v) => setSingle("year", v)} />
      </FilterDropdown>

      <FilterDropdown label="국가" active={Boolean(country)}>
        <SingleSelectList options={facets.countries} value={country} onChange={(v) => setSingle("country", v)} />
      </FilterDropdown>

      <FilterDropdown label="산업 분야" active={Boolean(industry)}>
        <SingleSelectList options={facets.industries} value={industry} onChange={(v) => setSingle("industry", v)} />
      </FilterDropdown>

      <FilterDropdown label="프로젝트 유형" active={Boolean(projectType)}>
        <SingleSelectList options={facets.projectTypes} value={projectType} onChange={(v) => setSingle("projectType", v)} labels={projectTypeLabel} />
      </FilterDropdown>

      <div className="ml-auto flex items-center gap-3">
        {hasFilters && (
          <button onClick={() => router.push(pathname)} className="text-xs font-semibold text-aso-primary hover:underline min-h-11">
            전체 초기화
          </button>
        )}
        <label className="text-xs text-aso-muted flex items-center gap-2">
          정렬
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input min-h-9 px-2 py-1 text-sm w-auto"
          >
            <option value="latest">최신순</option>
            <option value="featured">추천순</option>
            <option value="size">규모순</option>
          </select>
        </label>
      </div>
    </div>
  );
}
