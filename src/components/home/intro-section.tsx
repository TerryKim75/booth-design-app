"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Boxes, Recycle, Move3d, Feather, Timer, Sparkles } from "lucide-react";

const ADVANTAGES = [
  { icon: Boxes, label: "Modular", desc: "표준 모듈의 조합만으로 어떤 규모의 공간도 구성합니다." },
  { icon: Recycle, label: "Reusable", desc: "한 번 제작한 자재를 다음 프로젝트에서 다시 사용합니다." },
  { icon: Move3d, label: "Flexible", desc: "동일 자재로 인라인부터 아일랜드까지 자유롭게 변형됩니다." },
  { icon: Feather, label: "Lightweight", desc: "경량 알루미늄 프레임으로 운반·설치 부담을 줄였습니다." },
  { icon: Timer, label: "Fast Installation", desc: "표준화된 조인트 방식으로 설치 시간을 단축합니다." },
  { icon: Sparkles, label: "Premium Finish", desc: "정밀 가공된 마감으로 완성도 높은 표면을 구현합니다." },
];

export function IntroSection({ body }: { body: string }) {
  return (
    <section className="section-padding bg-white">
      <Container>
        <SectionHeading eyebrow="What is ASO System" title="하나의 시스템, 무한한 공간" description={body} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16 min-w-0">
          {ADVANTAGES.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="h-full min-w-0"
            >
              <Card className="h-full min-w-0 py-0">
                <CardContent className="p-6 md:p-8 min-w-0">
                  <a.icon className="text-aso-primary mb-4" size={26} strokeWidth={1.4} />
                  <p className="font-num font-bold text-lg text-aso-black mb-1.5">{a.label}</p>
                  <p className="text-sm text-aso-muted leading-relaxed">{a.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
