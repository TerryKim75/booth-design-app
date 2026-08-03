"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X, ChevronLeft, ChevronRight, Search, ShoppingCart,
  Plus, Minus, Trash2, Send, CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeroBand } from "@/components/ui/page-hero-band";
import { rentalCategoryLabel, stockStatusLabel } from "@/lib/labels";
import { submitRentalRequest, type RentalCartLine } from "@/app/(site)/rental/actions";
import type { RentalItem, RentalCategory } from "@/types/domain";

const CATEGORY_ORDER: RentalCategory[] = [
  "chair", "table", "sofa", "counter", "display", "showcase",
  "refrigerator", "tv_monitor", "lighting", "kitchen", "accessories",
];

type CartEntry = { id: string; qty: number };
type ContactForm = { name: string; company: string; email: string; phone: string; event: string; notes: string };

function specRows(item: RentalItem): { key: string; value: string }[] {
  const rows = [
    { key: "규격", value: `${item.width}×${item.depth}×${item.height}mm` },
    { key: "색상", value: item.color },
    { key: "소재", value: item.material },
  ];
  return rows.filter((r) => r.value);
}

function priceLabel(item: RentalItem): string {
  if (!item.priceVisible || item.rentalPrice == null) return "가격 문의";
  return `${item.rentalPrice.toLocaleString("ko-KR")}원`;
}

// ── 검색 입력 ────────────────────────────────────────────────────────────
function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full border transition-colors ${value ? "border-aso-primary bg-aso-primary" : "border-aso-line bg-white hover:border-aso-primary"}`} style={{ padding: "9px 16px" }}>
      <Search size={14} className={value ? "text-white" : "text-aso-muted"} />
      <input
        type="text"
        placeholder="제품 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`outline-none bg-transparent text-sm w-28 ${value ? "text-white placeholder-white/60" : "text-aso-charcoal-2 placeholder-aso-muted"}`}
        aria-label="비품 검색"
      />
      {value && (
        <button onClick={() => onChange("")} className="text-white/70 hover:text-white" aria-label="검색어 지우기">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ── 수량 선택 모달 (그리드 카드에서 바로 담기) ────────────────────────────────
function QtyPickerModal({ item, onConfirm, onClose }: { item: RentalItem; onConfirm: (qty: number) => void; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="font-bold text-aso-black text-base mb-1">{item.name}</p>
            <p className="text-aso-primary font-bold text-sm">{priceLabel(item)}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-full border border-aso-line text-aso-muted hover:border-aso-primary hover:text-aso-primary" aria-label="수량 감소">
              <Minus size={13} />
            </button>
            <span className="text-xl font-bold text-aso-black w-6 text-center font-num">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-aso-line text-aso-muted hover:border-aso-primary hover:text-aso-primary" aria-label="수량 증가">
              <Plus size={13} />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-aso-line text-sm font-semibold text-aso-muted hover:bg-aso-offwhite min-h-11">취소</button>
          <button onClick={() => { onConfirm(qty); onClose(); }} className="flex-1 rounded-xl bg-aso-primary text-white text-sm font-semibold hover:bg-aso-primary-dark min-h-11">담기</button>
        </div>
      </div>
    </div>
  );
}

// ── 제품 상세 모달 ────────────────────────────────────────────────────────
function ItemDetailModal({ item, qty, onAdd, onQtyChange, onClose }: {
  item: RentalItem; qty: number; onAdd: (qty: number) => void; onQtyChange: (q: number) => void; onClose: () => void;
}) {
  const images = item.images.length > 0 ? item.images : [""];
  const [imgIdx, setImgIdx] = useState(0);
  const [localQty, setLocalQty] = useState(() => (qty > 0 ? qty : 1));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setImgIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setImgIdx((i) => (i + 1) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, images.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="md:w-[48%] bg-aso-offwhite shrink-0 flex flex-col">
          <div className="relative aspect-square bg-white overflow-hidden">
            {images[imgIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[imgIdx]} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-aso-silver text-sm">이미지 없음</div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="이전 이미지">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="다음 이미지">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col p-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-semibold rounded-full border border-aso-line text-aso-muted px-3 py-1.5">
              {rentalCategoryLabel[item.category]}
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-aso-muted hover:bg-aso-offwhite" aria-label="닫기">
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-aso-black mb-3">{item.name}</h2>
          {item.description && <p className="text-sm text-aso-muted leading-relaxed mb-5">{item.description}</p>}

          <div className="mb-5">
            <p className="text-xs font-semibold text-aso-muted uppercase tracking-wider mb-2">Specifications</p>
            <div className="border border-aso-line">
              {specRows(item).map((spec, i) => (
                <div key={spec.key} className={`flex justify-between px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-aso-offwhite"}`}>
                  <span className="text-aso-muted">{spec.key}</span>
                  <span className="font-semibold text-aso-charcoal-2 font-num">{spec.value}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-2.5 text-sm bg-white">
                <span className="text-aso-muted">대여 가능 상태</span>
                <span className="font-semibold text-aso-charcoal-2">{stockStatusLabel[item.stockStatus]}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-aso-line">
            <div className="mb-5">
              <p className="text-xs text-aso-muted mb-1">대여 가격</p>
              <p className="text-2xl font-bold text-aso-primary font-num">
                {priceLabel(item)}
                {item.priceVisible && item.rentalPrice != null && <span className="text-sm font-medium text-aso-muted ml-1">/ 회당</span>}
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-xs font-semibold text-aso-muted w-14">수량</p>
              <div className="flex items-center gap-4 border border-aso-line px-4 py-2.5">
                <button
                  onClick={() => { const next = Math.max(1, localQty - 1); setLocalQty(next); if (qty > 0) onQtyChange(next); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-aso-line text-aso-muted hover:border-aso-primary hover:text-aso-primary"
                  aria-label="수량 감소"
                >
                  <Minus size={13} />
                </button>
                <span className="text-lg font-bold text-aso-black w-6 text-center font-num">{localQty}</span>
                <button
                  onClick={() => { const next = localQty + 1; setLocalQty(next); if (qty > 0) onQtyChange(next); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-aso-line text-aso-muted hover:border-aso-primary hover:text-aso-primary"
                  aria-label="수량 증가"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {qty === 0 ? (
              <button onClick={() => onAdd(localQty)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-aso-primary text-white font-semibold hover:bg-aso-primary-dark min-h-12 text-sm">
                <ShoppingCart size={16} />
                장바구니에 담기
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-aso-primary/10 text-aso-primary text-sm font-semibold min-h-12">
                <ShoppingCart size={15} />
                장바구니에 {qty}개 담김
              </div>
            )}

            <Link href={`/rental/${item.slug}`} className="block text-center text-xs text-aso-muted hover:text-aso-primary mt-4 underline underline-offset-2">
              전용 상세 페이지 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 비품 카드 ────────────────────────────────────────────────────────────
function RentalCatalogCard({ item, qty, onAdd, onQtyChange, onClick }: {
  item: RentalItem; qty: number; onAdd: (qty: number) => void; onQtyChange: (q: number) => void; onClick: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <>
      {showPicker && <QtyPickerModal item={item} onConfirm={(q) => onAdd(q)} onClose={() => setShowPicker(false)} />}
      <div className={`group bg-white rounded-2xl border overflow-hidden transition-colors flex flex-col ${qty > 0 ? "border-aso-primary" : "border-aso-line hover:border-aso-black"}`}>
        <button onClick={onClick} className="relative aspect-square bg-aso-offwhite overflow-hidden w-full text-left">
          {item.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.images[0]} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-aso-silver text-xs">이미지 없음</div>
          )}
          <span className="absolute top-2 left-2 text-[9px] font-semibold rounded-full border border-aso-line text-aso-charcoal-2 bg-white/90 px-1.5 py-0.5">
            {rentalCategoryLabel[item.category]}
          </span>
          {qty > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center bg-aso-primary text-white text-[9px] font-bold">{qty}</span>
          )}
        </button>

        <div className="flex flex-col flex-1 p-2.5">
          <button onClick={onClick} className="text-left mb-1.5">
            <h3 className="font-semibold text-aso-black text-xs leading-snug group-hover:text-aso-primary transition-colors line-clamp-2">{item.name}</h3>
          </button>
          <p className="font-num text-[10px] text-aso-muted mb-2">{item.width}×{item.depth}×{item.height}mm · {item.color}</p>

          <div className="mt-auto">
            <p className="text-aso-primary font-bold text-xs mb-2 font-num">
              {priceLabel(item)}
              {item.priceVisible && item.rentalPrice != null && <span className="text-[10px] font-medium text-aso-muted ml-1">/ 회당</span>}
            </p>

            {qty === 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowPicker(true); }}
                className="w-full flex items-center justify-center gap-1 rounded-full border border-aso-primary text-aso-primary text-[10px] font-semibold hover:bg-aso-primary hover:text-white min-h-8"
              >
                <Plus size={11} />
                담기
              </button>
            ) : (
              <div className="flex items-center justify-between rounded-full border border-aso-primary/30 bg-aso-primary/5 px-2 py-1">
                <button onClick={() => onQtyChange(qty - 1)} className="w-5 h-5 flex items-center justify-center rounded-full text-aso-primary hover:bg-aso-primary/10" aria-label="수량 감소">
                  <Minus size={11} />
                </button>
                <span className="text-xs font-bold text-aso-primary font-num">{qty}</span>
                <button onClick={() => onQtyChange(qty + 1)} className="w-5 h-5 flex items-center justify-center rounded-full text-aso-primary hover:bg-aso-primary/10" aria-label="수량 증가">
                  <Plus size={11} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── 장바구니 패널 ────────────────────────────────────────────────────────
function CartPanel({ items, cart, setCart, onClose }: {
  items: RentalItem[]; cart: CartEntry[]; setCart: React.Dispatch<React.SetStateAction<CartEntry[]>>; onClose: () => void;
}) {
  const [step, setStep] = useState<"cart" | "form" | "success">("cart");
  const [form, setForm] = useState<ContactForm>({ name: "", company: "", email: "", phone: "", event: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [inquiryNumber, setInquiryNumber] = useState("");

  const cartItems = cart
    .map((c) => { const item = items.find((i) => i.id === c.id); return item ? { ...item, qty: c.qty } : null; })
    .filter(Boolean) as (RentalItem & { qty: number })[];

  const allPriced = cartItems.every((i) => i.priceVisible && i.rentalPrice != null);
  const total = cartItems.reduce((sum, ci) => sum + (ci.rentalPrice ?? 0) * ci.qty, 0);

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((c) => c.id !== id));
    else setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const setF = (k: keyof ContactForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError("이름과 이메일은 필수입니다."); return; }
    setSubmitting(true);
    setError("");
    const lines: RentalCartLine[] = cartItems.map((i) => ({
      name: i.name, category: i.category, qty: i.qty, price: i.priceVisible ? i.rentalPrice : null,
    }));
    const res = await submitRentalRequest(form, lines);
    setSubmitting(false);
    if (res.success) {
      setInquiryNumber(res.inquiryNumber ?? "");
      setStep("success");
      setCart([]);
    } else {
      setError(res.error ?? "요청 접수에 실패했습니다.");
    }
  };

  const inputCls = "w-full rounded-xl border border-aso-line text-sm focus:outline-none focus:border-aso-primary px-3 py-2.5";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full md:max-w-[440px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-aso-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-aso-primary" />
            <h2 className="font-bold text-aso-black">장바구니</h2>
            {step === "form" && (
              <button onClick={() => { setStep("cart"); setError(""); }} className="ml-1 text-xs text-aso-primary hover:underline">← 뒤로</button>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-aso-muted hover:bg-aso-offwhite" aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <CheckCircle2 size={52} className="text-aso-primary mb-4" />
            <h3 className="font-bold text-xl text-aso-black mb-2">요청이 접수되었습니다</h3>
            <p className="text-sm text-aso-muted leading-relaxed max-w-[260px]">
              문의번호 <strong className="font-num text-aso-black">{inquiryNumber}</strong>로 접수되었습니다. 담당자가 확인 후 회신드립니다.
            </p>
            <button onClick={onClose} className="mt-8 px-6 py-2.5 rounded-xl border border-aso-line text-sm text-aso-charcoal-2 hover:bg-aso-offwhite">닫기</button>
          </div>
        )}

        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingCart size={36} className="text-aso-line mb-3" />
                  <p className="text-aso-muted text-sm">장바구니가 비어 있습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((ci) => (
                    <div key={ci.id} className="flex gap-3 items-center rounded-xl border border-aso-line p-3">
                      <div className="w-16 h-16 rounded-xl bg-aso-offwhite overflow-hidden shrink-0">
                        {ci.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ci.images[0]} alt={ci.name} loading="lazy" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-aso-black line-clamp-1">{ci.name}</p>
                        <p className="text-xs text-aso-muted mt-0.5 font-num">{priceLabel(ci)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(ci.id, ci.qty - 1)} className="w-6 h-6 flex items-center justify-center rounded-full border border-aso-line text-aso-muted hover:border-aso-primary hover:text-aso-primary" aria-label="수량 감소">
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-bold text-aso-black w-5 text-center font-num">{ci.qty}</span>
                          <button onClick={() => updateQty(ci.id, ci.qty + 1)} className="w-6 h-6 flex items-center justify-center rounded-full border border-aso-line text-aso-muted hover:border-aso-primary hover:text-aso-primary" aria-label="수량 증가">
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {ci.priceVisible && ci.rentalPrice != null && (
                          <p className="text-sm font-bold text-aso-primary font-num">{(ci.rentalPrice * ci.qty).toLocaleString("ko-KR")}원</p>
                        )}
                        <button onClick={() => updateQty(ci.id, 0)} className="text-aso-silver hover:text-red-500" aria-label="삭제">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-aso-line px-5 py-4">
                {allPriced && (
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-aso-black">합계</span>
                    <span className="text-lg font-bold text-aso-black font-num">
                      {total.toLocaleString("ko-KR")}원<span className="text-xs text-aso-muted font-normal ml-1">/ 회당</span>
                    </span>
                  </div>
                )}
                <button onClick={() => setStep("form")} className="w-full rounded-xl bg-aso-primary text-white font-semibold hover:bg-aso-primary-dark text-sm flex items-center justify-center gap-2 min-h-12">
                  <Send size={15} />
                  임대 요청하기
                </button>
              </div>
            )}
          </>
        )}

        {step === "form" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-xl bg-aso-offwhite mb-5 p-4">
                <p className="text-xs font-semibold text-aso-muted uppercase tracking-wide mb-3">주문 요약</p>
                <div className="space-y-1.5">
                  {cartItems.map((ci) => (
                    <div key={ci.id} className="flex justify-between text-sm">
                      <span className="text-aso-charcoal-2 truncate mr-2">{ci.name} <span className="text-aso-muted">×{ci.qty}</span></span>
                      <span className="font-semibold text-aso-black shrink-0 font-num">
                        {ci.priceVisible && ci.rentalPrice != null ? `${(ci.rentalPrice * ci.qty).toLocaleString("ko-KR")}원` : "문의"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm font-bold text-aso-black mb-4">담당자 정보</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-aso-charcoal-2 mb-1">이름 <span className="text-red-500">*</span></label>
                    <input value={form.name} onChange={(e) => setF("name", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-aso-charcoal-2 mb-1">회사명</label>
                    <input value={form.company} onChange={(e) => setF("company", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-aso-charcoal-2 mb-1">이메일 <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => setF("email", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-aso-charcoal-2 mb-1">전화번호</label>
                    <input type="tel" value={form.phone} onChange={(e) => setF("phone", e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-aso-charcoal-2 mb-1">전시회/행사 정보</label>
                  <textarea value={form.event} onChange={(e) => setF("event", e.target.value)} rows={3} placeholder="전시회명, 장소, 일정, 대여 기간 등" className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-aso-charcoal-2 mb-1">추가 요청사항</label>
                  <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                </div>
                {error && <p className="text-red-600 text-xs rounded-xl bg-red-50 px-4 py-3">{error}</p>}
              </div>
            </div>

            <div className="border-t border-aso-line px-5 py-4">
              <button onClick={handleSubmit} disabled={submitting} className="w-full rounded-xl bg-aso-primary text-white font-semibold hover:bg-aso-primary-dark disabled:opacity-60 text-sm flex items-center justify-center gap-2 min-h-12">
                {submitting ? "전송 중..." : (<><Send size={15} />요청 보내기</>)}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────
export function RentalClient({ initialItems }: { initialItems: RentalItem[] }) {
  const [activeCategory, setActiveCategory] = useState<RentalCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const getQty = (id: string) => cart.find((c) => c.id === id)?.qty ?? 0;

  const addToCart = (id: string, qty = 1) =>
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c));
      return [...prev, { id, qty }];
    });

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((c) => c.id !== id));
    else setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const filtered = useMemo(() => {
    let result = activeCategory === "all" ? initialItems : initialItems.filter((i) => i.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return result;
  }, [initialItems, activeCategory, searchQuery]);

  return (
    <>
      {cartOpen && <CartPanel items={initialItems} cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} />}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          qty={getQty(selectedItem.id)}
          onAdd={(qty) => addToCart(selectedItem.id, qty)}
          onQtyChange={(qty) => setQty(selectedItem.id, qty)}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <PageHeroBand eyebrow="Equipment Rental" title="비품 임대" description="가구 · 카운터 · 진열대 · 가전 · 조명 · 액세서리" />

      <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-aso-line">
        <Container>
          <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-sm font-semibold rounded-full border px-4 py-2 transition-colors ${activeCategory === "all" ? "bg-aso-primary text-white border-aso-primary" : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary"}`}
            >
              전체
            </button>
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-semibold rounded-full border px-4 py-2 transition-colors ${activeCategory === cat ? "bg-aso-primary text-white border-aso-primary" : "bg-white text-aso-charcoal-2 border-aso-line hover:border-aso-primary hover:text-aso-primary"}`}
              >
                {rentalCategoryLabel[cat]}
              </button>
            ))}
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            {(activeCategory !== "all" || searchQuery) && (
              <button onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} className="flex items-center gap-1 text-xs text-aso-muted hover:text-aso-primary font-medium ml-1">
                <X size={12} />
                초기화
              </button>
            )}
          </div>
        </Container>
      </div>

      <Container className="pt-10 pb-28">
        <p className="text-sm text-aso-muted mb-6">{filtered.length}개 제품</p>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-aso-muted">
            <p className="text-sm mb-4">조건에 맞는 제품이 없습니다.</p>
            <button onClick={() => { setActiveCategory("all"); setSearchQuery(""); }} className="text-aso-primary text-sm font-semibold hover:underline">
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 min-w-0">
            {filtered.map((item) => (
              <RentalCatalogCard
                key={item.id}
                item={item}
                qty={getQty(item.id)}
                onAdd={(qty) => addToCart(item.id, qty)}
                onQtyChange={(qty) => setQty(item.id, qty)}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </Container>

      <button
        onClick={() => setCartOpen(true)}
        className={`fixed z-40 flex items-center gap-2 rounded-full bg-aso-primary text-white font-semibold shadow-xl hover:bg-aso-primary-dark transition-all duration-300 px-5 py-3 ${cartCount > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        style={{ bottom: "24px", right: "24px" }}
      >
        <ShoppingCart size={18} />
        <span className="text-sm">{cartCount}개</span>
      </button>
    </>
  );
}
