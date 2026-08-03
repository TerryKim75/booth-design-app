import { NewUserForm } from "@/app/admin/users/new/new-user-form";

export default function NewUserPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-2">계정 생성</h1>
      <p className="text-sm text-aso-charcoal-2/70 mb-8">
        생성된 계정 정보는 안전한 방법으로 담당자에게 직접 전달해주세요. 최초 로그인 후 비밀번호 변경을 권장합니다.
      </p>
      <NewUserForm />
    </div>
  );
}
