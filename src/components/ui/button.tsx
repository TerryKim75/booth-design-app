import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

/**
 * shadcn/ui 스타일(cva 기반 variant, --primary/--border 등 테마 토큰 사용)을 따르되,
 * 사이트 전역에서 이미 쓰이는 시맨틱 variant 이름(primary/accent/outline 등)은 유지한다.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-95 disabled:pointer-events-none disabled:opacity-40 min-h-11 px-6",
  {
    variants: {
      variant: {
        primary: "rounded-xl bg-aso-black text-white hover:bg-aso-primary",
        accent: "rounded-full bg-primary text-primary-foreground hover:bg-aso-primary-dark",
        secondary: "rounded-xl bg-secondary text-secondary-foreground hover:bg-aso-silver-light",
        outline: "rounded-xl border border-aso-black bg-transparent text-aso-black hover:border-primary hover:text-primary",
        outlineLight: "rounded-xl border border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10",
        ghost: "rounded-xl bg-transparent text-aso-black hover:bg-muted hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

interface CommonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

export function Button({
  variant,
  className,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export function ButtonLink({
  variant,
  className,
  href,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
