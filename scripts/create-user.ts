/**
 * 관리자/담당자 계정을 생성하는 CLI 스크립트. 공개 회원가입이 없으므로 계정 생성은 이 스크립트
 * (또는 /admin/users 화면)를 통해서만 가능하다.
 *
 * 실행:
 *   npm run create-user -- --name "홍길동" --email staff2@a-s-o.co.kr --password "TempPass123!" --role staff
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      result[key] = value;
      i++;
    }
  }
  return result;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 설정되어야 합니다.");
    process.exit(1);
  }

  const { name, email, password, role } = parseArgs();

  if (!name || !email || !password || !role) {
    console.log(
      "사용법: npm run create-user -- --name \"이름\" --email you@example.com --password \"임시비밀번호\" --role admin|staff"
    );
    process.exit(1);
  }

  if (role !== "admin" && role !== "staff") {
    console.error("role은 admin 또는 staff여야 합니다.");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("비밀번호는 10자 이상이어야 합니다.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("계정 생성 실패:", error.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: data.user.id, name, email, role, status: "active" }, { onConflict: "id" });
  if (profileError) {
    console.error("profile 생성 실패:", profileError.message);
    process.exit(1);
  }

  console.log(`✅ 계정이 생성되었습니다: ${email} (${role})`);
}

main();
