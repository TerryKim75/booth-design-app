export function getArrayParam(sp: URLSearchParams, key: string): string[] {
  const v = sp.get(key);
  return v ? v.split(",").filter(Boolean) : [];
}

export function getNumberParam(sp: URLSearchParams, key: string): number | undefined {
  const v = sp.get(key);
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/** searchParams 객체를 받아 갱신된 query string을 반환한다 (undefined/빈 배열 값은 제거) */
export function buildQueryString(
  base: URLSearchParams,
  updates: Record<string, string | string[] | number | undefined>
): string {
  const next = new URLSearchParams(base.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.set(key, value.join(","));
    } else {
      next.set(key, String(value));
    }
  }
  next.delete("page");
  return next.toString();
}
