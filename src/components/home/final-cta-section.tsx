import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export function FinalCtaSection({ headline }: { headline: string }) {
  return (
    <section className="bg-aso-black text-white pt-20 pb-16 md:pt-24 md:pb-20 frame-grid-bg-dark">
      <Container className="text-center max-w-2xl">
        <h2 className="text-heading text-white mb-8">{headline}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/inquiry" variant="accent">
            프로젝트 문의
          </ButtonLink>
          <ButtonLink href="/booth-design" variant="outlineLight">
            시스템 부스 디자인 찾기
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
