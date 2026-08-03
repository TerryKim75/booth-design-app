import "server-only";
import { portfolioSeed } from "@/lib/seed-data/portfolio";
import { boothDesignSeed } from "@/lib/seed-data/booth-designs";
import { rentalSeed } from "@/lib/seed-data/rental";
import { downloadSeed } from "@/lib/seed-data/downloads";
import { inquirySeed } from "@/lib/seed-data/inquiries";
import { siteSettingSeed } from "@/lib/seed-data/site-settings";
import { userSeed } from "@/lib/seed-data/users";
import { frameSpecSeed } from "@/lib/seed-data/frame-specs";
import type {
  Portfolio,
  BoothDesign,
  RentalItem,
  DownloadFile,
  Inquiry,
  SiteSetting,
  AsoUser,
  FrameSpec,
  Client,
  ConstructionTeam,
  ClientProject,
  ClientProjectFile,
  BoothQuote,
} from "@/types/domain";

/**
 * Supabase 프로젝트가 연결되지 않은 로컬 개발/데모 환경을 위한 인메모리 스토어.
 * 서버 프로세스 메모리에만 존재하며 재시작 시 시드 데이터로 초기화된다.
 * 실제 운영에서는 이 파일이 전혀 사용되지 않고 Supabase가 단일 소스가 된다.
 */

function withMeta<T>(rows: Omit<T, "id" | "createdAt" | "updatedAt">[], idPrefix: string): T[] {
  const now = new Date().toISOString();
  return rows.map((row, i) => ({
    ...row,
    id: `${idPrefix}-${i + 1}`,
    createdAt: now,
    updatedAt: now,
  })) as T[];
}

type Store = {
  portfolios: Portfolio[];
  boothDesigns: BoothDesign[];
  rentalItems: RentalItem[];
  downloadFiles: DownloadFile[];
  inquiries: Inquiry[];
  siteSettings: SiteSetting[];
  users: AsoUser[];
  frameSpecs: FrameSpec[];
  clients: Client[];
  constructionTeams: ConstructionTeam[];
  clientProjects: ClientProject[];
  clientProjectFiles: ClientProjectFile[];
  boothQuotes: BoothQuote[];
};

const globalForStore = globalThis as unknown as { __asoLocalStore?: Store };

function buildStore(): Store {
  const now = new Date().toISOString();
  return {
    portfolios: withMeta<Portfolio>(
      portfolioSeed.map((p) => ({ ...p, createdBy: "seed-admin" })),
      "portfolio"
    ),
    boothDesigns: withMeta<BoothDesign>(
      boothDesignSeed.map((b) => ({ ...b, createdBy: "seed-admin" })),
      "booth"
    ),
    rentalItems: withMeta<RentalItem>(rentalSeed, "rental"),
    downloadFiles: withMeta<DownloadFile>(downloadSeed, "download"),
    inquiries: inquirySeed.map((inq, i) => ({
      ...inq,
      id: `inquiry-${i + 1}`,
      internalNotes: inq.internalNotes.map((n, ni) => ({
        ...n,
        id: `inquiry-${i + 1}-note-${ni + 1}`,
        createdAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    })),
    siteSettings: siteSettingSeed.map((s, i) => ({ ...s, id: `setting-${i + 1}`, updatedAt: now })),
    frameSpecs: withMeta<FrameSpec>(frameSpecSeed, "framespec"),
    users: userSeed.map((u, i) => ({
      id: i === 0 ? "seed-admin" : "seed-staff",
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      clientId: null,
      createdAt: now,
      updatedAt: now,
    })),
    clients: [],
    constructionTeams: [],
    clientProjects: [],
    clientProjectFiles: [],
    boothQuotes: [],
  };
}

export function getLocalStore(): Store {
  if (!globalForStore.__asoLocalStore) {
    globalForStore.__asoLocalStore = buildStore();
  }
  return globalForStore.__asoLocalStore;
}

export function resetLocalStore(): void {
  globalForStore.__asoLocalStore = buildStore();
}
