import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AsoUser } from "@/types/domain";

export type SessionProfile = AsoUser;

/**
 * 현재 로그인한 사용자의 프로필(role 포함)을 서버에서 조회한다.
 * 클라이언트가 role을 임의로 전달할 수 없도록, 항상 DB(profiles 테이블)에서 재조회한다.
 * Supabase가 연결되지 않은 로컬 모드에서는 공개 사이트를 "비로그인 방문자" 기준으로 렌더링한다
 * (다운로드 공개범위 등 접근 제어 UI를 그대로 확인할 수 있도록).
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, role, status, client_id, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active") return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    clientId: profile.client_id,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

const LOCAL_PREVIEW_ADMIN: SessionProfile = {
  id: "seed-admin",
  name: "김대표 (로컬 미리보기)",
  email: "info@gencos.co.kr",
  role: "admin",
  status: "active",
  clientId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * /admin 이하 서버 컴포넌트에서 호출 — 세션이 없거나 admin/staff가 아니면 리다이렉트.
 * role을 명시적으로 화이트리스트 검사한다("client가 아니면 통과"가 아니라
 * "staff 또는 admin이어야만 통과") — 향후 role이 추가되어도 안전하게 막히도록.
 * Supabase가 아직 연결되지 않은 로컬 개발 환경에서는 관리자 CMS 화면을 검토할 수 있도록
 * 가상의 관리자 세션으로 자동 통과시킨다. 실제 배포(Supabase 연결) 시에는 이 우회가 전혀
 * 동작하지 않고 정상적인 로그인이 항상 요구된다.
 */
export async function requireStaffOrAdmin(): Promise<SessionProfile> {
  if (!isSupabaseConfigured()) return LOCAL_PREVIEW_ADMIN;
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (profile.role === "client") redirect("/portal");
  if (profile.role !== "staff" && profile.role !== "admin") redirect("/login");
  return profile;
}

/** admin 전용 화면(사용자 관리, 사이트 설정 등)에서 호출 */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireStaffOrAdmin();
  if (profile.role !== "admin") redirect("/admin");
  return profile;
}

/**
 * /portal 이하 고객사 포털 서버 컴포넌트에서 호출.
 * client role이 아니면 관리자 쪽으로, client_id가 없는(잘못 구성된) 계정은
 * 로그인 화면으로 되돌린다. 로컬 미리보기 우회는 제공하지 않는다 — 포털은
 * 항상 실제 Supabase 연결이 있는 배포 환경에서만 의미가 있다.
 */
export async function requireClient(): Promise<SessionProfile & { clientId: string }> {
  if (!isSupabaseConfigured()) redirect("/portal/login");
  const profile = await getSessionProfile();
  if (!profile) redirect("/portal/login");
  if (profile.role !== "client") redirect("/admin");
  if (!profile.clientId) redirect("/portal/login");
  return { ...profile, clientId: profile.clientId };
}
