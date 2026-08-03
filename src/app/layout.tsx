import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.a-s-o.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ASO SYSTEM | Aluminum Solution Organizer",
    template: "%s | ASO SYSTEM",
  },
  description:
    "ASO System은 알루미늄 모듈 시스템으로 전시부스, 쇼룸, 브랜드 공간을 구성하는 공간 솔루션 기업입니다.",
  keywords: ["전시부스", "시스템부스", "알루미늄 모듈", "부스시공", "쇼룸", "ASO System"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "ASO SYSTEM",
    title: "ASO SYSTEM | Aluminum Solution Organizer",
    description: "알루미늄 모듈로 공간의 새로운 해답을 구성합니다.",
    images: [{ url: "/assets/og/aso-og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
};

/**
 * 루트 레이아웃은 html/body 셸만 담당한다. 공개 사이트 전용 Header/Footer는
 * (site) 라우트 그룹 레이아웃에서만 렌더링하고, /admin은 별도의 업무용 UI(AdminSidebar)를 사용한다
 * — 공개 헤더가 /admin 화면 위에 고정 오버레이로 겹쳐 콘텐츠를 가리는 문제를 방지하기 위함.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("h-full", "antialiased", inter.variable, "font-sans")}>
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ASO SYSTEM",
            alternateName: "Aluminum Solution Organizer",
            url: siteUrl,
            logo: `${siteUrl}/assets/brand/logo-full-dark.png`,
            description: "알루미늄 모듈 시스템으로 전시부스, 쇼룸, 브랜드 공간을 구성하는 공간 솔루션 기업",
          }}
        />
        {children}
      </body>
    </html>
  );
}
