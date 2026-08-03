/**
 * Supabase 프로젝트에 초기 샘플 데이터를 적재하는 스크립트.
 * 반드시 `npm run db:migrate` (또는 supabase 마이그레이션 적용) 이후에 실행한다.
 *
 * 실행: npm run db:seed
 * 필요 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { portfolioSeed } from "../src/lib/seed-data/portfolio";
import { boothDesignSeed } from "../src/lib/seed-data/booth-designs";
import { rentalSeed } from "../src/lib/seed-data/rental";
import { downloadSeed } from "../src/lib/seed-data/downloads";
import { inquirySeed } from "../src/lib/seed-data/inquiries";
import { siteSettingSeed } from "../src/lib/seed-data/site-settings";
import { userSeed } from "../src/lib/seed-data/users";
import { frameSpecSeed } from "../src/lib/seed-data/frame-specs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 설정되어야 합니다.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function chunkedInsert(table: string, rows: Record<string, unknown>[], chunkSize = 50) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw new Error(`[${table}] insert 실패: ${error.message}`);
    inserted += chunk.length;
  }
  console.log(`  ✓ ${table}: ${inserted}건 삽입`);
}

async function seedUsers() {
  console.log("→ 관리자/담당자 계정 생성");
  const ids: Record<string, string> = {};

  for (const u of userSeed) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const already = existing?.users.find((au) => au.email === u.email);

    let userId: string;
    if (already) {
      userId = already.id;
      console.log(`  · 이미 존재: ${u.email}`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.tempPassword,
        email_confirm: true,
      });
      if (error) throw new Error(`[auth.createUser] ${u.email}: ${error.message}`);
      userId = data.user.id;
      console.log(`  ✓ 생성됨: ${u.email} (임시 비밀번호: ${u.tempPassword})`);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: userId, name: u.name, email: u.email, role: u.role, status: u.status }, { onConflict: "id" });
    if (profileError) throw new Error(`[profiles] ${u.email}: ${profileError.message}`);

    ids[u.role] = userId;
  }

  return ids;
}

async function main() {
  console.log("ASO System 시드 데이터 적재를 시작합니다.\n");

  const userIds = await seedUsers();

  console.log("→ 사이트 설정");
  await chunkedInsert(
    "site_settings",
    siteSettingSeed.map((s) => ({ key: s.key, value: s.value }))
  );

  console.log("→ 포트폴리오");
  await chunkedInsert(
    "portfolios",
    portfolioSeed.map((p) => ({
      slug: p.slug,
      title: p.title,
      client: p.client,
      exhibition: p.exhibition,
      year: p.year,
      country: p.country,
      city: p.city,
      booth_width: p.boothWidth,
      booth_depth: p.boothDepth,
      booth_height: p.boothHeight,
      project_type: p.projectType,
      industry: p.industry,
      system_type: p.systemType,
      description: p.description,
      thumbnail: p.thumbnail,
      gallery: p.gallery,
      featured: p.featured,
      status: p.status,
      sort_order: p.sortOrder,
      created_by: userIds.admin,
    }))
  );

  console.log("→ 시스템 부스 디자인 (200개 이상)");
  await chunkedInsert(
    "booth_designs",
    boothDesignSeed.map((b) => ({
      design_code: b.designCode,
      slug: b.slug,
      title: b.title,
      width: b.width,
      depth: b.depth,
      area: b.area,
      height: b.height,
      booth_type: b.boothType,
      open_sides: b.openSides,
      frame_type: b.frameType,
      features: b.features,
      style_tags: b.styleTags,
      description: b.description,
      thumbnail: b.thumbnail,
      gallery: b.gallery,
      floor_plan: b.floorPlan,
      material_summary: b.materialSummary,
      featured: b.featured,
      status: b.status,
      sort_order: b.sortOrder,
      created_by: userIds.admin,
    }))
  );

  console.log("→ 비품");
  await chunkedInsert(
    "rental_items",
    rentalSeed.map((r) => ({
      product_code: r.productCode,
      slug: r.slug,
      name: r.name,
      category: r.category,
      width: r.width,
      depth: r.depth,
      height: r.height,
      color: r.color,
      material: r.material,
      description: r.description,
      images: r.images,
      stock_status: r.stockStatus,
      price_visible: r.priceVisible,
      rental_price: r.rentalPrice,
      featured: r.featured,
      status: r.status,
      sort_order: r.sortOrder,
    }))
  );

  console.log("→ 다운로드 자료");
  await chunkedInsert(
    "download_files",
    downloadSeed.map((d) => ({
      slug: d.slug,
      title: d.title,
      category: d.category,
      version: d.version,
      file_type: d.fileType,
      file_size: d.fileSize,
      file_url: d.fileUrl,
      thumbnail: d.thumbnail,
      description: d.description,
      access_level: d.accessLevel,
      status: d.status,
    }))
  );

  console.log("→ Frame Specification");
  await chunkedInsert(
    "frame_specs",
    frameSpecSeed.map((f) => ({
      name: f.name,
      description: f.description,
      specs: f.specs,
      image: f.image,
      application_image: f.applicationImage,
      status: f.status,
      sort_order: f.sortOrder,
    }))
  );

  console.log("→ 문의 샘플");
  await chunkedInsert(
    "inquiries",
    inquirySeed.map((i) => ({
      inquiry_number: i.inquiryNumber,
      company: i.company,
      contact_name: i.contactName,
      email: i.email,
      phone: i.phone,
      exhibition: i.exhibition,
      country: i.country,
      city: i.city,
      event_date: i.eventDate,
      booth_width: i.boothWidth,
      booth_depth: i.boothDepth,
      booth_height: i.boothHeight,
      budget: i.budget,
      requirements: i.requirements,
      status: i.status,
      assignee_id: i.assigneeId ? userIds.staff : null,
    }))
  );

  console.log("\n✅ 시드 데이터 적재가 완료되었습니다.");
  console.log(`   관리자 로그인: ${userSeed[0].email} / ${userSeed[0].tempPassword}`);
  console.log(`   담당자 로그인: ${userSeed[1].email} / ${userSeed[1].tempPassword}`);
  console.log("   ⚠ 최초 로그인 후 반드시 비밀번호를 변경하세요.");
}

main().catch((err) => {
  console.error("\n❌ 시드 적재 중 오류가 발생했습니다:", err.message ?? err);
  process.exit(1);
});
