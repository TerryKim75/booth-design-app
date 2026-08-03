import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

export const metadata: Metadata = {
  title: "프로젝트 문의",
  description: "ASO System에 전시부스·쇼룸·브랜드 공간 프로젝트를 문의하세요.",
  alternates: { canonical: "/inquiry" },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InquiryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const boothDesignId = str(sp.boothDesignId);
  const boothDesignCode = str(sp.boothDesignCode);
  const boothWidth = str(sp.boothWidth);
  const boothDepth = str(sp.boothDepth);
  const boothHeight = str(sp.boothHeight);
  const rentalItem = str(sp.rentalItem);
  const refTitle = str(sp.title);

  let requirementsPrefix = "";
  if (rentalItem) requirementsPrefix = `[문의에 추가된 비품: ${rentalItem}]\n`;
  if (refTitle) requirementsPrefix += `[참고 프로젝트: ${refTitle}]\n`;

  return (
    <div className="pt-32 md:pt-36 pb-24">
      <Container className="max-w-3xl">
        <div className="mb-12">
          <p className="text-eyebrow text-aso-primary mb-3">Inquiry</p>
          <h1 className="text-heading text-aso-black mb-4">프로젝트 문의</h1>
          <p className="text-aso-charcoal-2/70">
            프로젝트 개요를 남겨주시면 담당자가 확인 후 빠르게 회신드립니다.
            {boothDesignCode && (
              <>
                {" "}
                선택하신 디자인 <strong className="font-num text-aso-black">{boothDesignCode}</strong> 정보가 자동
                입력되었습니다.
              </>
            )}
          </p>
        </div>

        <InquiryForm
          prefill={{
            boothDesignId,
            boothDesignCode,
            boothWidth: boothWidth ? Number(boothWidth) : undefined,
            boothDepth: boothDepth ? Number(boothDepth) : undefined,
            boothHeight: boothHeight ? Number(boothHeight) : undefined,
            requirementsPrefix: requirementsPrefix || undefined,
          }}
        />
      </Container>
    </div>
  );
}
