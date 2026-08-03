"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

/**
 * 실제 자산(포트폴리오/부스/비품 사진 등)이 아직 없는 상태에서도 레이아웃이 깨지지 않도록
 * next/image 로드에 실패하면 절제된 톤의 플레이스홀더로 자연스럽게 전환된다 (깨진 이미지
 * 아이콘이 그대로 노출되지 않음). 로딩 중에는 펄스 스켈레톤을 보여주다가 로드 완료 시
 * 페이드인한다. src 경로에 실제 파일을 넣으면 그대로 교체된다 (README > 이미지 교체 방법 참고).
 */
export function SafeImage({ className, alt, ...props }: ImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (status === "error" || !props.src) {
    return (
      <div
        className={cn(
          "frame-grid-bg flex items-center justify-center bg-aso-offwhite text-aso-muted",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon size={28} strokeWidth={1.2} />
      </div>
    );
  }

  return (
    <>
      {status === "loading" && props.fill && (
        <div className={cn("absolute inset-0 animate-pulse bg-aso-line/50", className)} aria-hidden="true" />
      )}
      <Image
        className={cn(className, "transition-opacity duration-500", status === "loading" ? "opacity-0" : "opacity-100")}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...props}
      />
    </>
  );
}
