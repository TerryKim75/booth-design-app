import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export function Chip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center min-h-11 rounded-full px-4 text-sm font-semibold border transition-all active:scale-95",
        active
          ? "bg-aso-primary text-white border-aso-primary"
          : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary",
        className
      )}
      {...props}
    />
  );
}

export function RemovableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 min-h-9 rounded-full pl-3.5 pr-2.5 py-1 text-xs font-semibold bg-aso-offwhite border border-aso-line text-aso-charcoal-2 hover:border-aso-primary hover:text-aso-primary transition-colors"
    >
      {label}
      <X size={13} />
    </button>
  );
}
