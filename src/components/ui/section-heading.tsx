import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto" : "text-left", "max-w-3xl", className)}>
      {eyebrow && (
        <div className={cn("flex items-center gap-2 mb-4", align === "center" && "justify-center")}>
          <span className={cn("w-8 h-px", dark ? "bg-aso-primary-light" : "bg-aso-primary")} />
          <span className={cn("text-eyebrow", dark ? "text-aso-primary-light" : "text-aso-primary")}>{eyebrow}</span>
        </div>
      )}
      <h2 className={cn("text-heading", dark ? "text-white" : "text-aso-black")}>{title}</h2>
      {description && (
        <p className={cn("mt-4 text-base md:text-lg leading-relaxed", dark ? "text-white/70" : "text-aso-charcoal-2/80")}>
          {description}
        </p>
      )}
    </div>
  );
}
