import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { PortalLoginForm } from "@/app/portal/login/portal-login-form";

export const metadata: Metadata = {
  title: "고객사 로그인",
  robots: { index: false },
  alternates: { canonical: "/portal/login" },
};

export default function PortalLoginPage() {
  return (
    <div className="pt-32 pb-24 min-h-[70vh] flex items-center">
      <Container className="max-w-sm">
        <p className="text-eyebrow text-aso-primary mb-3 text-center">ASO SYSTEM</p>
        <h1 className="text-subheading text-aso-black mb-8 text-center">고객사 로그인</h1>
        <Suspense fallback={null}>
          <PortalLoginForm />
        </Suspense>
      </Container>
    </div>
  );
}
