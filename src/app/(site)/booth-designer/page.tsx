import type { Metadata } from "next";
import Builder from "@/components/booth-designer/Builder";

export const metadata: Metadata = {
  title: "부스 디자인 자동화",
  description: "부스 크기와 구성을 선택하면 즉시 견적을 받아볼 수 있는 부스 디자인 자동화 도구입니다.",
  alternates: { canonical: "/booth-designer" },
};

export default function BoothDesignerPage() {
  return (
    <div className="pt-16 lg:pt-20">
      <Builder />
    </div>
  );
}
