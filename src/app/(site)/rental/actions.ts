"use server";

import { createInquiry } from "@/lib/data/inquiries";
import { rentalCategoryLabel } from "@/lib/labels";
import type { RentalCategory } from "@/types/domain";

export interface RentalCartLine {
  name: string;
  category: RentalCategory;
  qty: number;
  price: number | null;
}

export interface RentalRequestContact {
  name: string;
  company: string;
  email: string;
  phone: string;
  event: string;
  notes: string;
}

export interface RentalRequestResult {
  success: boolean;
  inquiryNumber?: string;
  error?: string;
}

/**
 * 비품 임대 장바구니 요청 — 별도 이메일 발송 시스템 대신 기존 문의(Inquiry) 파이프라인에 태워
 * /admin/inquiries에서 담당자가 바로 확인·배정할 수 있도록 한다.
 */
export async function submitRentalRequest(
  contact: RentalRequestContact,
  cart: RentalCartLine[]
): Promise<RentalRequestResult> {
  if (!contact.name || !contact.email) {
    return { success: false, error: "이름과 이메일은 필수입니다." };
  }
  if (!cart.length) {
    return { success: false, error: "장바구니가 비어 있습니다." };
  }

  const hasPrice = cart.every((i) => i.price != null);
  const total = cart.reduce((sum, i) => sum + (i.price ?? 0) * i.qty, 0);

  const lines = cart.map((i) => {
    const priceText = i.price != null ? `${i.price.toLocaleString("ko-KR")}원 × ${i.qty} = ${(i.price * i.qty).toLocaleString("ko-KR")}원` : "가격 문의";
    return `- ${i.name} (${rentalCategoryLabel[i.category]}) · 수량 ${i.qty} · ${priceText}`;
  });

  const requirements = [
    "[비품 임대 장바구니 요청]",
    ...lines,
    hasPrice ? `합계(1회 기준): ${total.toLocaleString("ko-KR")}원` : "",
    contact.notes ? `\n추가 요청사항: ${contact.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const inquiry = await createInquiry({
      company: contact.company || contact.name,
      contactName: contact.name,
      email: contact.email,
      phone: contact.phone || "-",
      exhibition: contact.event || undefined,
      requirements,
      attachments: [],
    });
    return { success: true, inquiryNumber: inquiry.inquiryNumber };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "요청 접수 중 오류가 발생했습니다." };
  }
}
