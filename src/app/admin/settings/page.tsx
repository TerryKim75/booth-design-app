import { requireAdmin } from "@/lib/auth";
import { getAllSettings } from "@/lib/data/settings";
import { siteSettingSeed } from "@/lib/seed-data/site-settings";
import { SettingsForm } from "@/app/admin/settings/settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const stored = await getAllSettings();
  const storedKeys = new Set(stored.map((s) => s.key));

  const merged = [
    ...stored,
    ...siteSettingSeed.filter((s) => !storedKeys.has(s.key)),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-aso-black mb-2">사이트 설정</h1>
      <p className="text-sm text-aso-charcoal-2/70 mb-8">
        메인 랜딩페이지의 헤드라인, 카피, 회사 정보 등 공개 사이트에 노출되는 문구를 수정합니다.
      </p>
      <SettingsForm settings={merged} />
    </div>
  );
}
