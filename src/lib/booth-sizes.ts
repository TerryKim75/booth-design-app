export interface BoothSizePreset {
  width: number;
  depth: number;
}

export const BOOTH_SIZE_PRESETS: BoothSizePreset[] = [
  { width: 3, depth: 3 },
  { width: 3, depth: 6 },
  { width: 3, depth: 9 },
  { width: 6, depth: 6 },
  { width: 6, depth: 9 },
  { width: 9, depth: 9 },
  { width: 9, depth: 12 },
  { width: 9, depth: 15 },
  { width: 12, depth: 12 },
  { width: 12, depth: 15 },
  { width: 12, depth: 18 },
  { width: 15, depth: 15 },
];

export const BOOTH_SIZE_CUSTOM = "custom";

export function boothSizeOptionValue(preset: BoothSizePreset): string {
  return `${preset.width}x${preset.depth}`;
}

export function boothSizeOptionLabel(preset: BoothSizePreset): string {
  return `${preset.width}m x ${preset.depth}m`;
}

export function findBoothSizePreset(width?: number, depth?: number): BoothSizePreset | undefined {
  if (width == null || depth == null) return undefined;
  return BOOTH_SIZE_PRESETS.find((p) => p.width === width && p.depth === depth);
}
