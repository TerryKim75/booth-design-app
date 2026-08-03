"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, ShieldCheck, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const NAV_ITEMS = [
  { label: "시스템 소개", href: "/system" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "시스템 부스 디자인", href: "/booth-design" },
  { label: "디자인 자동화", href: "/booth-designer" },
  { label: "비품 임대", href: "/rental" },
  { label: "다운로드", href: "/downloads" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const solid = scrolled || !isHome || open;

  return (
    <>
      <a href="#main-content" className="skip-link">
        본문 바로가기
      </a>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-md",
          solid ? "bg-white/80 border-b border-aso-line shadow-[0_1px_0_0_rgba(0,0,0,0.02)]" : "bg-black/10"
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center h-11 shrink-0" aria-label="ASO SYSTEM 홈으로 이동">
              <LogoMark solid={solid} />
            </Link>

            <nav className="hidden lg:flex items-center h-11 gap-8" aria-label="주요 메뉴">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center h-11 text-sm font-semibold tracking-wide transition-colors",
                    solid ? "text-aso-black hover:text-aso-primary" : "text-white hover:text-aso-primary-light"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center h-11 gap-2">
              <ButtonLink href="/inquiry" variant="accent" className="h-11 min-h-11 text-sm">
                프로젝트 문의
              </ButtonLink>
              <Link
                href="/portal/login"
                className={cn(
                  "inline-flex items-center h-9 gap-1 rounded-lg border text-xs font-semibold px-2.5 transition-all active:scale-95",
                  solid
                    ? "border-aso-line text-aso-charcoal-2 hover:border-aso-primary hover:text-aso-primary"
                    : "border-white/30 text-white/90 hover:border-white hover:text-white"
                )}
              >
                <Building2 size={14} />
                고객사
              </Link>
              <Link
                href={loggedIn ? "/admin" : "/login"}
                className={cn(
                  "inline-flex items-center h-9 gap-1 rounded-lg border text-xs font-semibold px-2.5 transition-all active:scale-95",
                  solid
                    ? "border-aso-line text-aso-charcoal-2 hover:border-aso-primary hover:text-aso-primary"
                    : "border-white/30 text-white/90 hover:border-white hover:text-white"
                )}
              >
                {loggedIn ? <ShieldCheck size={14} /> : <LogIn size={14} />}
                관리자
              </Link>
            </div>

            <button
              className={cn("lg:hidden inline-flex items-center justify-center h-11 w-11", solid ? "text-aso-black" : "text-white")}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={open}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </Container>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[75vw] max-w-[300px] bg-white shadow-2xl transition-transform duration-300 lg:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        <div className="flex items-center justify-between p-5 border-b border-aso-line">
          <Image src="/assets/brand/logo-full-dark.png" alt="ASO SYSTEM" width={765} height={251} className="h-7 w-auto" />
          <button className="p-2 min-h-11 min-w-11" onClick={() => setOpen(false)} aria-label="메뉴 닫기">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="모바일 주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center min-h-12 rounded-xl px-3 text-base font-semibold text-aso-black hover:bg-aso-offwhite hover:text-aso-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-aso-line space-y-2">
          <ButtonLink href="/inquiry" variant="accent" className="w-full" onClick={() => setOpen(false)}>
            프로젝트 문의
          </ButtonLink>
          <ButtonLink href="/portal/login" variant="outline" className="w-full" onClick={() => setOpen(false)}>
            고객사 로그인
          </ButtonLink>
          <ButtonLink href={loggedIn ? "/admin" : "/login"} variant="outline" className="w-full" onClick={() => setOpen(false)}>
            {loggedIn ? "관리자 화면" : "관리자 로그인"}
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

function LogoMark({ solid }: { solid: boolean }) {
  return (
    <Image
      src={solid ? "/assets/brand/logo-full-dark.png" : "/assets/brand/logo-full-light.png"}
      alt="ASO SYSTEM"
      width={765}
      height={251}
      priority
      className="h-8 lg:h-9 w-auto"
    />
  );
}
