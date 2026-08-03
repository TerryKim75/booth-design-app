import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "이용약관", alternates: { canonical: "/terms" } };

export default async function TermsPage() {
  const s = await getSettings(["company.name"]);

  return (
    <div className="pt-36 pb-24">
      <Container className="max-w-3xl">
        <h1 className="text-heading text-aso-black mb-8">이용약관</h1>
        <div className="space-y-6 text-sm leading-relaxed text-aso-charcoal-2/85">
          <section>
            <h2 className="font-bold text-aso-black mb-2">제1조 (목적)</h2>
            <p>
              본 약관은 {s["company.name"]}(이하 &ldquo;회사&rdquo;)가 제공하는 웹사이트 서비스 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>
          <section>
            <h2 className="font-bold text-aso-black mb-2">제2조 (서비스의 내용)</h2>
            <p>회사는 시스템 부스 디자인 소개, 포트폴리오 열람, 비품 임대 안내, 프로젝트 문의 접수 등의 서비스를 제공합니다.</p>
          </section>
          <section>
            <h2 className="font-bold text-aso-black mb-2">제3조 (게시물의 저작권)</h2>
            <p>사이트에 게시된 모든 콘텐츠(이미지, 텍스트, 디자인)의 저작권은 회사에 귀속됩니다.</p>
          </section>
        </div>
      </Container>
    </div>
  );
}
