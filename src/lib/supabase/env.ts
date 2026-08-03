export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Supabase 프로젝트가 아직 연결되지 않은 로컬 개발 환경에서도
 * 공개 페이지를 확인할 수 있도록, 미설정 시 시드 데이터 기반 로컬 모드로 동작한다.
 * 운영 배포 전 반드시 실제 Supabase 프로젝트 키를 .env(.local)에 설정해야 한다.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
