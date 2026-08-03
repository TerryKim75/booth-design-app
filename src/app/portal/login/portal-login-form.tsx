"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { portalSignIn } from "@/app/portal/login/actions";
import { Button } from "@/components/ui/button";

export function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await portalSignIn(fd);
    setLoading(false);
    if (res.success) {
      router.push(searchParams.get("redirect") ?? "/portal");
      router.refresh();
    } else {
      setError(res.error ?? "로그인에 실패했습니다.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-[200px] space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm text-aso-charcoal-2 mb-1.5 text-center">
          이메일
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input text-center" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-aso-charcoal-2 mb-1.5 text-center">
          비밀번호
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input text-center" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" disabled={loading} className="w-full">
        {loading ? "로그인 중..." : "로그인"}
      </Button>
      <p className="text-xs text-aso-muted text-center">
        계정 정보는 담당자로부터 안내받은 이메일과 비밀번호를 사용해주세요.
      </p>
    </form>
  );
}
