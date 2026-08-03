"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface PortalSignInResult {
  success: boolean;
  error?: string;
}

/**
 * 고객사 포털 전용 로그인. 관리자 로그인(signIn)과 반대 방향으로, role이 client가
 * 아닌 계정(admin/staff)이 여기로 로그인을 시도하면 거부하고 로그아웃시킨다.
 */
export async function portalSignIn(formData: FormData): Promise<PortalSignInResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase가 아직 연결되지 않았습니다." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "client") {
    await supabase.auth.signOut();
    return { success: false, error: "고객사 계정이 아닙니다. /login 에서 로그인해주세요." };
  }

  return { success: true };
}

export async function portalSignOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}
