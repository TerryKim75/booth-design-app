"use client";

import { useState } from "react";
import { boothFeatureLabel } from "@/lib/labels";
import type { BoothFeature, BoothFeatureEntry } from "@/types/domain";

const FEATURES: BoothFeature[] = [
  "storage",
  "meeting_room",
  "semi_open_meeting_room",
  "standalone_display",
  "front_display",
  "showcase",
  "shelf",
  "video_wall",
  "lighting_graphic",
];

/**
 * 부스 디자인의 "필수 요소" 체크리스트. 항목을 선택하면 수량/사이즈를 자유 텍스트로
 * 함께 기재할 수 있다. 선택 결과는 JSON 문자열로 hidden input(name)에 담겨 제출되고,
 * 서버 액션에서 zod로 파싱/검증한다.
 */
export function FeatureChecklistField({ name, defaultValue }: { name: string; defaultValue?: BoothFeatureEntry[] }) {
  const [notes, setNotes] = useState<Partial<Record<BoothFeature, string>>>(() => {
    const map: Partial<Record<BoothFeature, string>> = {};
    (defaultValue ?? []).forEach((e) => {
      map[e.feature] = e.note;
    });
    return map;
  });

  function toggle(feature: BoothFeature, checked: boolean) {
    setNotes((prev) => {
      const next = { ...prev };
      if (checked) next[feature] = next[feature] ?? "";
      else delete next[feature];
      return next;
    });
  }

  function setNote(feature: BoothFeature, note: string) {
    setNotes((prev) => ({ ...prev, [feature]: note }));
  }

  const serialized = JSON.stringify(
    FEATURES.filter((f) => notes[f] !== undefined).map((f) => ({ feature: f, note: notes[f] ?? "" }))
  );

  return (
    <div className="sm:col-span-2">
      <p className="text-xs text-aso-muted mb-2">필수 요소 (선택 시 수량/사이즈 기재 가능)</p>
      <input type="hidden" name={name} value={serialized} />
      <div className="space-y-2">
        {FEATURES.map((f) => {
          const checked = notes[f] !== undefined;
          return (
            <div
              key={f}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border px-3 py-2 transition-colors ${
                checked ? "border-aso-black bg-aso-offwhite" : "border-aso-line"
              }`}
            >
              <label className="flex items-center gap-2 text-sm sm:min-w-[140px] cursor-pointer">
                <input type="checkbox" checked={checked} onChange={(e) => toggle(f, e.target.checked)} className="w-4 h-4" />
                {boothFeatureLabel[f]}
              </label>
              {checked && (
                <input
                  type="text"
                  value={notes[f] ?? ""}
                  onChange={(e) => setNote(f, e.target.value)}
                  placeholder="수량 또는 사이즈 (예: 2개, 1.5m x 2m)"
                  className="input min-h-9 py-1 text-sm flex-1"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
