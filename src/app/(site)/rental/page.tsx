import type { Metadata } from "next";
import { listRentalItems } from "@/lib/data/rentals";
import { RentalClient } from "@/app/(site)/rental/rental-client";

export const metadata: Metadata = {
  title: "비품 임대",
  description: "전시부스 운영에 필요한 의자, 테이블, 카운터, 쇼케이스 등 비품을 카테고리별로 확인하고 장바구니로 임대를 요청하세요.",
  alternates: { canonical: "/rental" },
};

export default async function RentalPage() {
  const { items } = await listRentalItems({ pageSize: 500, sort: "featured" });
  return <RentalClient initialItems={items} />;
}
