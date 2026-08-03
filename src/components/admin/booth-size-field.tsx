"use client";

import { useState } from "react";
import {
  BOOTH_SIZE_PRESETS, BOOTH_SIZE_CUSTOM, boothSizeOptionValue, boothSizeOptionLabel, findBoothSizePreset,
} from "@/lib/booth-sizes";

export function BoothSizeField({
  defaultWidth, defaultDepth,
}: { defaultWidth?: number; defaultDepth?: number }) {
  const [mode, setMode] = useState<string>(() => {
    if (defaultWidth != null && defaultDepth != null) {
      const preset = findBoothSizePreset(defaultWidth, defaultDepth);
      return preset ? boothSizeOptionValue(preset) : BOOTH_SIZE_CUSTOM;
    }
    return "";
  });

  const isCustom = mode === BOOTH_SIZE_CUSTOM;
  const [presetWidth, presetDepth] = isCustom || !mode ? [undefined, undefined] : mode.split("x");

  return (
    <div className="sm:col-span-2">
      <label htmlFor="boothSize" className="block text-xs text-aso-muted mb-1">
        부스 사이즈 <span className="text-aso-primary">*</span>
      </label>
      <select id="boothSize" value={mode} onChange={(e) => setMode(e.target.value)} className="input">
        <option value="" disabled>
          선택해주세요
        </option>
        {BOOTH_SIZE_PRESETS.map((p) => (
          <option key={boothSizeOptionValue(p)} value={boothSizeOptionValue(p)}>
            {boothSizeOptionLabel(p)}
          </option>
        ))}
        <option value={BOOTH_SIZE_CUSTOM}>부스사이즈 기재</option>
      </select>

      {isCustom ? (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label htmlFor="width" className="block text-xs text-aso-muted mb-1">
              가로 (m)
            </label>
            <input id="width" name="width" type="number" step="0.1" defaultValue={defaultWidth} required className="input" />
          </div>
          <div>
            <label htmlFor="depth" className="block text-xs text-aso-muted mb-1">
              세로 (m)
            </label>
            <input id="depth" name="depth" type="number" step="0.1" defaultValue={defaultDepth} required className="input" />
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="width" value={presetWidth ?? ""} />
          <input type="hidden" name="depth" value={presetDepth ?? ""} />
        </>
      )}
    </div>
  );
}
