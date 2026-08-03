import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";

const FOOTER_LINKS = [
  { label: "시스템 소개", href: "/system" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "시스템 부스 디자인", href: "/booth-design" },
  { label: "비품 임대", href: "/rental" },
  { label: "다운로드", href: "/downloads" },
  { label: "프로젝트 문의", href: "/inquiry" },
];

export async function Footer() {
  const s = await getSettings([
    "company.name",
    "company.address",
    "company.address.factory",
    "company.phone",
    "company.email",
  ]);

  return (
    <footer className="bg-aso-black text-white/70 border-t border-white/10 pt-14 pb-10 md:pt-16 md:pb-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div>
            <Image src="/assets/brand/logo-full-light.png" alt="ASO SYSTEM" width={765} height={251} className="h-8 w-auto mb-4" />
            <p className="text-sm leading-relaxed max-w-xs">
              알루미늄 모듈 시스템으로 전시부스, 쇼룸, 브랜드 공간을 구성하는 공간 솔루션 기업입니다.
            </p>
          </div>

          <nav aria-label="푸터 메뉴">
            <p className="text-eyebrow text-white/40 mb-4">MENU</p>
            <ul className="grid grid-cols-2 gap-y-3 text-sm">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm space-y-1.5">
            <p className="text-eyebrow text-white/40 mb-4">CONTACT</p>
            <p className="text-white/90 font-semibold">{s["company.name"]}</p>
            <p>본사 {s["company.address"]}</p>
            <p>공장 {s["company.address.factory"]}</p>
            <p>대표전화 {s["company.phone"]}</p>
            <p>{s["company.email"]}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 text-xs text-white/40">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-white/70">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-white/70">이용약관</Link>
          </div>
          <p>© {new Date().getFullYear()} {s["company.name"]}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
