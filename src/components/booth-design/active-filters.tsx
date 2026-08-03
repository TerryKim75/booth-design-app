"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RemovableChip } from "@/components/ui/chip";
import { getArrayParam, getNumberParam, toggleInArray, buildQueryString } from "@/lib/query-params";
import { boothTypeLabel, frameTypeLabel, boothFeatureLabel, boothStyleLabel } from "@/lib/labels";
import type { BoothFeature, BoothStyleTag, BoothType, FrameType } from "@/types/domain";

const RANGE_FIELDS: { min: string; max: string; unit: string; label: string }[] = [
  { min: "widthMin", max: "widthMax", unit: "m", label: "가로" },
  { min: "depthMin", max: "depthMax", unit: "m", label: "세로" },
  { min: "areaMin", max: "areaMax", unit: "㎡", label: "면적" },
  { min: "heightMin", max: "heightMax", unit: "m", label: "높이" },
];

export function ActiveFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const boothType = getArrayParam(searchParams, "boothType") as BoothType[];
  const openSides = getArrayParam(searchParams, "openSides");
  const frameType = getArrayParam(searchParams, "frameType") as FrameType[];
  const features = getArrayParam(searchParams, "features") as BoothFeature[];
  const styleTags = getArrayParam(searchParams, "styleTags") as BoothStyleTag[];
  const sort = searchParams.get("sort") ?? "latest";

  function push(qs: string) {
    router.push(`${pathname}?${qs}`, { scroll: false });
  }

  function clearSingle(key: string) {
    push(buildQueryString(searchParams, { [key]: [] }));
  }

  function removeFeature(value: string) {
    push(buildQueryString(searchParams, { features: toggleInArray(features, value) }));
  }

  function removeRange(min: string, max: string) {
    push(buildQueryString(searchParams, { [min]: undefined, [max]: undefined }));
  }

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  boothType.forEach((v) => chips.push({ key: `bt-${v}`, label: boothTypeLabel[v], onRemove: () => clearSingle("boothType") }));
  openSides.forEach((v) => chips.push({ key: `os-${v}`, label: `${v}면 오픈`, onRemove: () => clearSingle("openSides") }));
  frameType.forEach((v) => chips.push({ key: `ft-${v}`, label: frameTypeLabel[v], onRemove: () => clearSingle("frameType") }));
  features.forEach((v) => chips.push({ key: `f-${v}`, label: boothFeatureLabel[v], onRemove: () => removeFeature(v) }));
  styleTags.forEach((v) => chips.push({ key: `s-${v}`, label: boothStyleLabel[v], onRemove: () => clearSingle("styleTags") }));

  RANGE_FIELDS.forEach(({ min, max, unit, label }) => {
    const minVal = getNumberParam(searchParams, min);
    const maxVal = getNumberParam(searchParams, max);
    if (minVal != null || maxVal != null) {
      chips.push({
        key: `${min}-${max}`,
        label: minVal != null && minVal === maxVal ? `${label} ${minVal}${unit}` : `${label} ${minVal ?? 0}~${maxVal ?? "∞"}${unit}`,
        onRemove: () => removeRange(min, max),
      });
    }
  });

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-aso-charcoal-2/70">
          총 <strong className="text-aso-black font-num">{total.toLocaleString("ko-KR")}</strong>개의 시스템 부스 디자인
        </p>
        <label className="text-xs text-aso-muted flex items-center gap-2">
          정렬
          <select
            value={sort}
            onChange={(e) => push(buildQueryString(searchParams, { sort: e.target.value }))}
            className="input min-h-9 px-2 py-1 text-sm w-auto"
          >
            <option value="latest">최신순</option>
            <option value="featured">추천순</option>
            <option value="area">면적순</option>
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <RemovableChip key={c.key} label={c.label} onRemove={c.onRemove} />
          ))}
          <button onClick={() => router.push(pathname)} className="text-xs font-semibold text-aso-primary hover:underline min-h-9 px-2">
            전체 초기화
          </button>
        </div>
      )}
    </div>
  );
}
