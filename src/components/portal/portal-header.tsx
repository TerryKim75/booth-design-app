"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { portalSignOut } from "@/app/portal/login/actions";

export function PortalHeader({ companyName }: { companyName: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-aso-black text-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/portal" className="font-num font-extrabold text-lg">
          <span className="text-aso-primary-light">A</span>
          <span className="text-aso-primary-light">S</span>
          <span className="text-aso-primary-light">O</span> Client Portal
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">{companyName}</span>
          <button
            onClick={async () => {
              await portalSignOut();
              router.push("/portal/login");
              router.refresh();
            }}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
