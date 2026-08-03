import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "개인정보처리방침", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const s = await getSettings(["company.name", "company.email", "company.phone"]);

  return (
    <div className="pt-36 pb-24">
      <Container className="max-w-3xl prose-sm">
        <h1 className="text-heading text-aso-black mb-8">개인정보처리방침</h1>
        <div className="space-y-6 text-sm leading-relaxed text-aso-charcoal-2/85">
          <p>
            {s["company.name"]}(이하 &ldquo;회사&rdquo;)는 프로젝트 문의 및 서비스 제공을 위해 아래와 같이 개인정보를
            수집·이용합니다.
          </p>
          <section>
            <h2 className="font-bold text-aso-black mb-2">1. 수집하는 개인정보 항목</h2>
            <p>회사명, 담당자명, 이메일, 전화번호, 문의 내용 및 첨부파일</p>
          </section>
          <section>
            <h2 className="font-bold text-aso-black mb-2">2. 개인정보의 수집 및 이용 목적</h2>
            <p>프로젝트 문의 응대, 견적 및 계약 진행, 서비스 관련 안내</p>
          </section>
          <section>
            <h2 className="font-bold text-aso-black mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <p>문의 처리 완료 후 관련 법령이 정한 기간 동안 보관 후 파기합니다.</p>
          </section>
          <section>
            <h2 className="font-bold text-aso-black mb-2">4. 문의처</h2>
            <p>{s["company.email"]} · {s["company.phone"]}</p>
          </section>
        </div>
      </Container>
    </div>
  );
}
