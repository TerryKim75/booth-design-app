import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/app/(site)/login/login-form";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="pt-32 pb-24 min-h-[70vh] flex items-center">
      <Container className="max-w-sm">
        <p className="text-eyebrow text-aso-primary mb-3 text-center">ASO SYSTEM</p>
        <h1 className="text-subheading text-aso-black mb-8 text-center">관리자 로그인</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Container>
    </div>
  );
}
