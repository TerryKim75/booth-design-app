import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";

/**
 * Service Role 클라이언트 — RLS를 우회하는 관리 권한 클라이언트다.
 * 반드시 서버 전용 코드(Route Handler, Server Action, scripts/*)에서만 사용하고
 * 클라이언트 번들에 절대 노출하지 않는다.
 */
export function createAdminSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 및 NEXT_PUBLIC_SUPABASE_URL이 설정되어야 관리자 클라이언트를 사용할 수 있습니다."
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
