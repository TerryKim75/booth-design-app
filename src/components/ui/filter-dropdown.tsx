"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 비품 임대 필터 바와 동일한 톤의 드롭다운 선택 버튼.
 * 제목 아래 가로 필터 바에서 카테고리별로 하나씩 배치해 사용한다.
 */
export function FilterDropdown({
  label,
  active,
  children,
  align = "left",
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
          active
            ? "bg-aso-primary text-white border-aso-primary"
            : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary"
        )}
      >
        {label}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full z-40 mt-2 w-max min-w-[220px] max-w-[min(90vw,320px)] rounded-2xl border border-aso-line bg-white p-4 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** 드롭다운 안에서 사용하는 단일 선택 옵션 리스트 (라디오 방식) */
export function SingleSelectList<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  labels?: Record<T, string>;
}) {
  return (
    <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={cn(
          "text-left text-sm rounded-lg px-3 py-2 transition-colors",
          !value ? "bg-aso-primary/10 text-aso-primary font-semibold" : "text-aso-charcoal-2 hover:bg-aso-offwhite"
        )}
      >
        전체
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "text-left text-sm rounded-lg px-3 py-2 transition-colors",
            value === opt ? "bg-aso-primary/10 text-aso-primary font-semibold" : "text-aso-charcoal-2 hover:bg-aso-offwhite"
          )}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

/** 드롭다운 안에서 사용하는 다중 선택 옵션 리스트 (체크박스 방식) — "필요 요소"처럼 여러 개를 동시에 골라야 하는 경우 전용 */
export function MultiSelectList<T extends string>({
  options,
  values,
  onToggle,
  labels,
}: {
  options: T[];
  values: string[];
  onToggle: (value: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
      {options.map((opt) => {
        const checked = values.includes(opt);
        return (
          <label
            key={opt}
            className={cn(
              "flex items-center gap-2 text-sm rounded-lg px-3 py-2 cursor-pointer transition-colors",
              checked ? "bg-aso-primary/10 text-aso-primary font-semibold" : "text-aso-charcoal-2 hover:bg-aso-offwhite"
            )}
          >
            <input type="checkbox" checked={checked} onChange={() => onToggle(opt)} className="w-4 h-4 accent-current" />
            {labels?.[opt] ?? opt}
          </label>
        );
      })}
    </div>
  );
}
