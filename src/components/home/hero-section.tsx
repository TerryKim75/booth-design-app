"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { HeroScene } from "@/components/home/hero-scene";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  tagline: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.15 * i, ease: "easeOut" as const },
  }),
};

export function HeroSection({ headline, subheadline, tagline }: HeroSectionProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden bg-aso-black">
      <div className="absolute inset-0">
        {!videoFailed && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/hero/aso-transform.mp4"
            poster="/assets/hero/aso-transform-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
          >
            <source src="/assets/hero/aso-transform.webm" type="video/webm" />
          </video>
        )}
        {videoFailed && <HeroScene />}
        <div className="absolute inset-0 bg-gradient-to-t from-aso-black via-aso-black/45 to-aso-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-aso-black/40 via-transparent to-aso-black/10" />
      </div>

      <Container className="relative z-10 pb-24 pt-40 md:pb-32">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="flex items-center gap-2 mb-6">
          <span className="w-8 h-px bg-aso-primary" />
          <span className="text-eyebrow text-aso-primary-light">Aluminum Space System</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="text-display text-white mb-6"
        >
          {renderEmphasized(headline)}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="text-white/75 text-lg md:text-xl font-light max-w-xl mb-10"
        >
          {subheadline}
          <br />
          <span className="text-white/50 text-base">{tagline}</span>
        </motion.p>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="flex flex-wrap gap-3">
          <ButtonLink href="/system" variant="accent">
            시스템 알아보기
          </ButtonLink>
          <ButtonLink href="/booth-design" variant="outlineLight">
            부스 디자인 찾기
          </ButtonLink>
          <ButtonLink href="/inquiry" variant="outlineLight">
            프로젝트 문의
          </ButtonLink>
        </motion.div>
      </Container>
    </section>
  );
}

// 헤드라인의 첫 단어(브랜드명 "ASO")만 글자별로 강조 색상을 적용하고, 나머지는 그대로 렌더링한다.
function renderEmphasized(text: string) {
  const [firstWord, ...rest] = text.split(" ");
  return (
    <>
      {firstWord.split("").map((char, i) => (
        <span key={i} className="text-aso-primary-light">
          {char}
        </span>
      ))}
      {rest.length > 0 && <> {rest.join(" ")}</>}
    </>
  );
}
