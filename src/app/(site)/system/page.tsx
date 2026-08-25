import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SafeImage } from "@/components/ui/safe-image";
import { ButtonLink } from "@/components/ui/button";
import { Layers, Repeat, PenTool, Wrench, CheckCircle2 } from "lucide-react";
import { listFrameSpecs } from "@/lib/data/frame-specs";

export const metadata: Metadata = {
  title: "시스템 소개",
  description: "ASO System(Aluminum Solution Organizer)의 철학, 프레임 규격, 조립 방식과 확장 가능성을 소개합니다.",
  alternates: { canonical: "/system" },
};

const PHILOSOPHY = [
  { icon: Layers, title: "Modular", desc: "표준화된 모듈의 조합만으로 어떤 규모의 공간도 구성합니다." },
  { icon: Repeat, title: "Reusable", desc: "한 번 제작한 자재를 폐기하지 않고 다음 프로젝트에 다시 사용합니다." },
  { icon: PenTool, title: "Designed to Change", desc: "설계 단계부터 재구성을 전제로 그래픽과 구조를 분리해 설계합니다." },
  { icon: Wrench, title: "Fast to Build", desc: "표준 조인트 방식으로 숙련도에 관계없이 균일한 조립 품질을 보장합니다." },
];

const PROCESS = [
  { step: "01", title: "설계", desc: "부스 규격과 브랜드 요구 요소를 반영하여 알루비전 전용 모듈 및 Hi-LED 타일 레이아웃을 정밀 설계하고 3D 목업을 제공합니다." },
  { step: "02", title: "설치", desc: "도구 없이(Tool-less) 결합되는 전용 조인트와 프레임 내 내부 배선 설계를 통해 시공 시간을 단축하고, SEG 패브릭·라이트박스를 결합해 프레임 노출 없는 매끄러운 공간을 완성합니다." },
  { step: "03", title: "해체", desc: "전시 종료 후 자재 손상 및 폐기물 발생 없이 고강도 알루미늄 프레임과 매체 모듈을 안전하게 전량 회수하여 분류·보관합니다." },
  { step: "04", title: "재구성", desc: "동일한 모듈 자재를 바탕으로 다음 전시회의 홀 크기, 관람 동선, 부스 형태에 맞춰 무한히 가변·재조립하여 친환경 지속 가능성과 ROI를 극대화합니다." },
];

const APPLICATIONS = [
  { title: "코너 & 벽체", desc: "2면 오픈 구조에서 벽체 그래픽과 코너 조인트로 시야를 유도합니다." },
  { title: "타워 & 캐노피", desc: "5m 이상의 고강성 구조로 원거리 시인성과 그늘막 기능을 동시에 제공합니다." },
  { title: "브리지", desc: "두 구조물을 상부에서 연결해 대형 아일랜드 부스의 스카이라인을 완성합니다." },
  { title: "창고 & 미팅룸", desc: "운영 물품 보관과 독립 상담이 가능한 도어형 모듈을 결합합니다." },
  { title: "카운터 & 진열대", desc: "안내, 상담, 제품 전시 목적에 맞춘 다양한 높이의 카운터 모듈을 제공합니다." },
  { title: "도어 & 액세서리", desc: "슬라이딩, 힌지 등 다양한 도어 방식과 마감 액세서리로 디테일을 완성합니다." },
];

export default async function SystemPage() {
  const frameSpecs = await listFrameSpecs();

  return (
    <div>
      <section className="pt-40 pb-16 md:pt-48 md:pb-20 bg-aso-offwhite">
        <Container>
          <p className="text-eyebrow text-aso-primary mb-4">System Introduction</p>
          <h1 className="text-display text-aso-black mb-6">
            <span className="text-aso-primary">A</span>luminum <span className="text-aso-primary">S</span>olution{" "}
            <span className="text-aso-primary">O</span>rganizer
          </h1>
          <p className="text-lg text-aso-charcoal-2/80 max-w-2xl leading-relaxed">
            ASO System은 정밀하게 설계된 알루미늄 프레임 모듈을 조합해 전시부스, 쇼룸, 브랜드 공간을 구성하는
            공간 솔루션입니다. SEG 를 통한 고급마감과 LED Module 의 조합으로 연출되는 영상을 통해 지금까지와는
            차원이 다른 새로운 전시 공간을 완성할 수 있습니다.
          </p>
        </Container>
      </section>

      <section className="section-padding bg-white">
        <Container>
          <SectionHeading eyebrow="Philosophy" title="시스템 철학" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {PHILOSOPHY.map((p) => (
              <div key={p.title} className="rounded-2xl border border-aso-line p-6 shadow-sm">
                <p.icon className="text-aso-primary mb-4" size={24} strokeWidth={1.4} />
                <p className="font-bold text-aso-black mb-2">{p.title}</p>
                <p className="text-sm text-aso-charcoal-2/70 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-aso-offwhite">
        <Container>
          <SectionHeading eyebrow="Frame Specification" title="55mm / 124mm 프레임 시스템" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {frameSpecs.map((f) => (
              <div key={f.id} className="group rounded-2xl bg-white border border-aso-line overflow-hidden shadow-sm">
                <div className="relative aspect-[16/10] overflow-hidden bg-white py-4">
                  <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                    <SafeImage src={f.applicationImage} alt={`${f.name} 적용 부스 사례`} fill className="object-contain" />
                  </div>
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <SafeImage src={f.image} alt={`${f.name} 프레임`} fill className="object-contain" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-num font-bold text-sm text-aso-black mb-1.5">{f.name}</h3>
                  <p className="text-[11px] text-aso-charcoal-2/70 leading-relaxed mb-2">{f.description}</p>
                  <ul className="space-y-1">
                    {f.specs.map((s) => (
                      <li key={s} className="flex items-center gap-1.5 text-[11px] font-num text-aso-charcoal-2">
                        <CheckCircle2 size={11} className="text-aso-primary shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-white">
        <Container>
          <SectionHeading
            eyebrow="Assembly & Graphic"
            title="조립·연결 방식과 그래픽 설치"
            description="모든 프레임은 동일한 조인트 커넥터로 연결되며, 그래픽은 프레임과 분리된 별도 패널로 제작되어 구조 교체 없이 디자인만 바꿀 수 있습니다. 포맥스, SEG, 월그래픽 등 소재별 규격은 다운로드 페이지의 그래픽 가이드라인을 참고하세요."
          />
        </Container>
      </section>

      <section className="section-padding bg-aso-offwhite">
        <Container>
          <SectionHeading eyebrow="Applications" title="구성 요소별 적용 사례" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {APPLICATIONS.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl bg-white p-6 border border-aso-line shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-aso-primary/30"
              >
                <h3 className="font-bold text-aso-black mb-2">{a.title}</h3>
                <p className="text-sm text-aso-charcoal-2/70 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-aso-black text-white">
        <Container>
          <SectionHeading
            dark
            eyebrow="Process"
            title="설계부터 모듈 재구성까지"
            description="프레임 형태의 모듈러 시스템으로 완성되는 고효율 부스 솔루션"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {PROCESS.map((p) => (
              <div key={p.step}>
                <p className="font-num text-3xl font-extrabold text-aso-primary-light mb-3">{p.step}</p>
                <p className="font-bold mb-1">{p.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-white text-center">
        <Container className="max-w-xl">
          <h2 className="text-subheading text-aso-black mb-4">기술자료가 더 필요하신가요?</h2>
          <p className="text-aso-charcoal-2/70 mb-8">
            프레임 규격표, 조립 매뉴얼, 그래픽 가이드라인을 다운로드 페이지에서 확인하세요.
          </p>
          <ButtonLink href="/downloads" variant="primary">
            기술자료 다운로드
          </ButtonLink>
        </Container>
      </section>
    </div>
  );
}
