import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Next.js 16 파일 컨벤션: middleware.ts → proxy.ts로 이름이 변경되었다.
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md 참고)
 * /admin 이하 경로는 세션이 없으면 /login으로 리다이렉트한다. 세부 역할(RBAC) 검증은
 * 각 서버 컴포넌트에서 profiles 테이블을 조회해 재확인한다 (src/lib/auth.ts).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/portal") && path !== "/portal/login" && !user) {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
