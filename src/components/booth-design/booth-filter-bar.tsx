"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterDropdown, SingleSelectList, MultiSelectList } from "@/components/ui/filter-dropdown";
import { getArrayParam, getNumberParam, toggleInArray, buildQueryString } from "@/lib/query-params";
import { boothTypeLabel, frameTypeLabel, boothFeatureLabel, boothStyleLabel } from "@/lib/labels";
import type { BoothFeature, BoothStyleTag, BoothType, FrameType } from "@/types/domain";

const BOOTH_TYPES: BoothType[] = ["inline", "corner", "peninsula", "island"];
const OPEN_SIDES = ["1", "2", "3", "4"];
const FRAME_TYPES: FrameType[] = ["55mm", "124mm", "mixed"];
const FEATURES: BoothFeature[] = [
  "storage", "meeting_room", "semi_open_meeting_room", "standalone_display",
  "front_display", "showcase", "shelf", "video_wall", "lighting_graphic",
];
const STYLES: BoothStyleTag[] = ["open", "semi_closed", "closed", "round_structure", "straight_structure"];

const openSidesLabels: Record<string, string> = { "1": "1면", "2": "2면", "3": "3면", "4": "4면" };

/**
 * 비품 임대 필터 바와 동일한 레이아웃: 타이틀 아래 가로 드롭다운 버튼 행.
 * "필요 요소"만 다중 선택(체크박스)이고, 나머지 카테고리는 단일 선택(라디오형) 드롭다운이다.
 * 부스 규격(가로/세로/면적/높이)은 숫자 범위이므로 하나의 드롭다운 안에 범위 입력을 모아둔다.
 */
export function BoothFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const boothType = getArrayParam(searchParams, "boothType")[0] as BoothType | undefined;
  const openSides = getArrayParam(searchParams, "openSides")[0];
  const frameType = getArrayParam(searchParams, "frameType")[0] as FrameType | undefined;
  const features = getArrayParam(searchParams, "features");
  const styleTags = getArrayParam(searchParams, "styleTags")[0] as BoothStyleTag | undefined;

  const width = getNumberParam(searchParams, "widthMin");
  const depth = getNumberParam(searchParams, "depthMin");

  const hasSize = width != null || depth != null;

  function setSingle(key: string, value: string | undefined) {
    router.push(`${pathname}?${buildQueryString(searchParams, { [key]: value ? [value] : [] })}`, { scroll: false });
  }

  function setSize(minKey: string, maxKey: string, value: string) {
    router.push(`${pathname}?${buildQueryString(searchParams, { [minKey]: value, [maxKey]: value })}`, { scroll: false });
  }

  function toggleFeature(value: BoothFeature) {
    router.push(`${pathname}?${buildQueryString(searchParams, { features: toggleInArray(features, value) })}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="부스 사이즈" active={hasSize}>
        <div className="flex items-end gap-2">
          <SizeField label="가로 (m)" value={width} onChange={(v) => setSize("widthMin", "widthMax", v)} />
          <span className="text-aso-muted pb-2">×</span>
          <SizeField label="세로 (m)" value={depth} onChange={(v) => setSize("depthMin", "depthMax", v)} />
        </div>
      </FilterDropdown>

      <FilterDropdown label="부스 유형" active={Boolean(boothType)}>
        <SingleSelectList options={BOOTH_TYPES} value={boothType} onChange={(v) => setSingle("boothType", v)} labels={boothTypeLabel} />
      </FilterDropdown>

      <FilterDropdown label="오픈 면 수" active={Boolean(openSides)}>
        <SingleSelectList options={OPEN_SIDES} value={openSides} onChange={(v) => setSingle("openSides", v)} labels={openSidesLabels} />
      </FilterDropdown>

      <FilterDropdown label="프레임 타입" active={Boolean(frameType)}>
        <SingleSelectList options={FRAME_TYPES} value={frameType} onChange={(v) => setSingle("frameType", v)} labels={frameTypeLabel} />
      </FilterDropdown>

      <FilterDropdown label={`필요 요소${features.length ? ` (${features.length})` : ""}`} active={features.length > 0}>
        <MultiSelectList options={FEATURES} values={features} onToggle={toggleFeature} labels={boothFeatureLabel} />
      </FilterDropdown>

      <FilterDropdown label="디자인 스타일" active={Boolean(styleTags)}>
        <SingleSelectList options={STYLES} value={styleTags} onChange={(v) => setSingle("styleTags", v)} labels={boothStyleLabel} />
      </FilterDropdown>
    </div>
  );
}

function SizeField({
  label, value, onChange,
}: {
  label: string; value?: number; onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-aso-muted mb-1.5">{label}</p>
      <input
        type="number"
        inputMode="decimal"
        placeholder="0"
        defaultValue={value ?? ""}
        onBlur={(e) => onChange(e.target.value)}
        className="input min-h-9 w-24 px-2 py-1 text-sm"
        aria-label={label}
      />
    </div>
  );
}
