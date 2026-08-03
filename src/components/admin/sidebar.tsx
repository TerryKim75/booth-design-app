"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(site)/login/actions";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Images, Boxes, Sofa, FileDown, Mail, Users, Settings, LogOut, ExternalLink, Ruler,
  Building2, HardHat, FolderKanban,
} from "lucide-react";
import type { UserRole } from "@/types/domain";

const NAV = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { href: "/admin/portfolio", label: "포트폴리오", icon: Images, roles: ["admin", "staff"] },
  { href: "/admin/booth-designs", label: "시스템 부스 디자인", icon: Boxes, roles: ["admin", "staff"] },
  { href: "/admin/frame-specs", label: "Frame Specification", icon: Ruler, roles: ["admin", "staff"] },
  { href: "/admin/rentals", label: "비품 임대", icon: Sofa, roles: ["admin", "staff"] },
  { href: "/admin/downloads", label: "다운로드 자료", icon: FileDown, roles: ["admin", "staff"] },
  { href: "/admin/inquiries", label: "문의 관리", icon: Mail, roles: ["admin", "staff"] },
  { href: "/admin/clients", label: "고객사 관리", icon: Building2, roles: ["admin", "staff"] },
  { href: "/admin/client-projects", label: "고객 프로젝트", icon: FolderKanban, roles: ["admin", "staff"] },
  { href: "/admin/construction-teams", label: "시공팀 관리", icon: HardHat, roles: ["admin", "staff"] },
  { href: "/admin/users", label: "사용자 관리", icon: Users, roles: ["admin"] },
  { href: "/admin/settings", label: "사이트 설정", icon: Settings, roles: ["admin"] },
] as const;

export function AdminSidebar({ role, name }: { role: UserRole; name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 shrink-0 bg-aso-black text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <p className="font-num font-extrabold text-lg">
          <span className="text-aso-primary-light">A</span>
          <span className="text-aso-primary-light">S</span>
          <span className="text-aso-primary-light">O</span> Admin
        </p>
        <p className="text-xs text-white/40 mt-1">{name} · {role === "admin" ? "관리자" : "담당자"}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="관리자 메뉴">
        {NAV.filter((n) => (n.roles as readonly string[]).includes(role)).map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white border-l-2 border-aso-primary" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-2 py-2.5 text-sm text-white/60 hover:text-white">
          <ExternalLink size={16} />
          공개 사이트 보기
        </Link>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
            router.refresh();
          }}
          className="flex items-center gap-3 px-2 py-2.5 text-sm text-white/60 hover:text-white w-full"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
