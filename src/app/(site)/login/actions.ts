"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface SignInResult {
  success: boolean;
  error?: string;
}

/**
 * 공개 회원가입은 제공하지 않는다. 계정은 관리자가 scripts/create-user.ts로만 생성하며,
 * 이 액션은 이미 존재하는 계정의 이메일/비밀번호 검증만 수행한다.
 */
export async function signIn(formData: FormData): Promise<SignInResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase가 아직 연결되지 않았습니다. 로컬 개발 환경에서는 /admin에 바로 접근할 수 있습니다.",
    };
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

  if (profile?.role === "client") {
    await supabase.auth.signOut();
    return { success: false, error: "고객사 계정입니다. /portal/login 에서 로그인해주세요." };
  }

  return { success: true };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}
