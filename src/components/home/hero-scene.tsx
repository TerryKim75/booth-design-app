"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * 코드 기반 Hero 배경 애니메이션.
 *
 * 실제 3D 렌더링/영상 자산이 준비되면 아래 경로에 파일을 넣는 것만으로 이 애니메이션 대신
 * 영상이 재생된다 (video 엘리먼트가 우선 시도되며, 로드 실패 시 이 SVG 씬으로 자연 대체됨):
 *   - /public/assets/hero/aso-transform.webm
 *   - /public/assets/hero/aso-transform.mp4
 *   - /public/assets/hero/aso-transform-poster.webp
 *
 * 씬 자체는 알루미늄 프레임 모듈이 "조립 → 완성 → 분해 → 다른 배치로 재조립"되는 과정을
 * 표현한다. 동일한 모듈 세트(rect 12개)가 두 개의 서로 다른 부스 배치(A/B) 사이를 순환한다.
 */

interface Mod {
  x: number;
  y: number;
  w: number;
  h: number;
}

// 레이아웃 A: 3×3 인라인 부스 + 카운터 + 타워
const LAYOUT_A: Mod[] = [
  { x: 8, y: 62, w: 84, h: 3 }, // floor
  { x: 8, y: 20, w: 3, h: 45 },
  { x: 89, y: 20, w: 3, h: 45 },
  { x: 8, y: 20, w: 84, h: 3 }, // top rail
  { x: 20, y: 23, w: 3, h: 39 },
  { x: 45, y: 23, w: 3, h: 39 },
  { x: 70, y: 23, w: 3, h: 39 },
  { x: 14, y: 46, w: 20, h: 16 }, // counter block
  { x: 58, y: 30, w: 14, h: 32 }, // tower
  { x: 40, y: 30, w: 12, h: 10 }, // sign
  { x: 78, y: 40, w: 8, h: 22 },
  { x: 22, y: 30, w: 10, h: 8 },
];

// 레이아웃 B: 아일랜드 + 브리지 (동일 모듈, 다른 배치)
const LAYOUT_B: Mod[] = [
  { x: 5, y: 66, w: 90, h: 3 },
  { x: 30, y: 18, w: 3, h: 51 },
  { x: 67, y: 18, w: 3, h: 51 },
  { x: 30, y: 18, w: 40, h: 3 }, // bridge top
  { x: 5, y: 66, w: 3, h: -0 },
  { x: 12, y: 40, w: 3, h: 26 },
  { x: 85, y: 40, w: 3, h: 26 },
  { x: 40, y: 46, w: 20, h: 20 }, // island counter
  { x: 44, y: 22, w: 12, h: 24 }, // center tower
  { x: 8, y: 34, w: 14, h: 10 },
  { x: 78, y: 34, w: 14, h: 10 },
  { x: 15, y: 50, w: 12, h: 16 },
];

const CYCLE = { hold: 3400, transition: 700 };

export function HeroScene() {
  const [layout, setLayout] = useState<"A" | "B">("A");
  const [visible, setVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    async function cycle() {
      while (!cancelled) {
        await wait(CYCLE.hold);
        if (cancelled) return;
        setVisible(false);
        await wait(CYCLE.transition);
        if (cancelled) return;
        setLayout((prev) => (prev === "A" ? "B" : "A"));
        setVisible(true);
      }
    }
    cycle();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  const modules = layout === "A" ? LAYOUT_A : LAYOUT_B;

  return (
    <svg
      viewBox="0 0 100 80"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect x={0} y={0} width={100} height={80} fill="#0a0a0b" />
      <g opacity={0.5}>
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={80} stroke="#ffffff" strokeOpacity={0.04} strokeWidth={0.15} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="#ffffff" strokeOpacity={0.04} strokeWidth={0.15} />
        ))}
      </g>

      {modules.map((m, i) => (
        <motion.rect
          key={i}
          rx={0.3}
          fill="none"
          stroke="#bb86b7"
          strokeWidth={0.5}
          initial={false}
          animate={{
            x: m.x,
            y: m.y,
            width: m.w,
            height: Math.max(m.h, 0.4),
            opacity: visible ? 1 : 0,
            scale: visible ? 1 : 0.85,
          }}
          style={{ transformOrigin: `${m.x + m.w / 2}px ${m.y + m.h / 2}px` }}
          transition={{
            duration: reducedMotion ? 0 : 0.9,
            delay: reducedMotion ? 0 : i * 0.045,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </svg>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
