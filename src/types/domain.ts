// ─────────────────────────────────────────
// ASO System 도메인 타입 정의
// Supabase 테이블 구조와 1:1로 대응된다. (supabase/migrations/0001_init.sql 참고)
// ─────────────────────────────────────────

export type UserRole = "admin" | "staff" | "client";
export type UserStatus = "active" | "suspended";

export interface AsoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContentStatus = "draft" | "published" | "unpublished";

export type ProjectType =
  | "exhibition_booth"
  | "showroom"
  | "brand_space"
  | "corporate_office"
  | "retail_popup"
  | "event_space";

export type SystemType = "55mm" | "124mm" | "mixed";

export interface Portfolio {
  id: string;
  slug: string;
  title: string;
  client: string;
  exhibition: string;
  year: number;
  country: string;
  city: string;
  boothWidth: number;
  boothDepth: number;
  boothHeight: number;
  projectType: ProjectType;
  industry: string;
  systemType: SystemType;
  description: string;
  thumbnail: string;
  gallery: string[];
  featured: boolean;
  status: ContentStatus;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BoothType = "inline" | "corner" | "peninsula" | "island";
export type OpenSides = 1 | 2 | 3 | 4;
export type FrameType = "55mm" | "124mm" | "mixed";

export type BoothFeature =
  | "storage"
  | "meeting_room"
  | "semi_open_meeting_room"
  | "standalone_display"
  | "front_display"
  | "showcase"
  | "shelf"
  | "video_wall"
  | "lighting_graphic";

export interface BoothFeatureEntry {
  feature: BoothFeature;
  /** 수량 또는 사이즈 (예: "2개", "1.5m x 2m") — 선택 사항 */
  note: string;
}

export type BoothStyleTag = "open" | "semi_closed" | "closed" | "round_structure" | "straight_structure";

export interface BoothDesign {
  id: string;
  designCode: string;
  slug: string;
  title: string;
  width: number;
  depth: number;
  area: number;
  height: number;
  boothType: BoothType;
  openSides: OpenSides;
  frameType: FrameType;
  features: BoothFeatureEntry[];
  styleTags: BoothStyleTag[];
  description: string;
  thumbnail: string;
  gallery: string[];
  floorPlan: string | null;
  materialSummary: string;
  featured: boolean;
  status: ContentStatus;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FrameSpec {
  id: string;
  name: string;
  description: string;
  specs: string[];
  /** 프레임 자체(하드웨어) 이미지 — 카드 호버 시 표시 */
  image: string;
  /** 이 프레임이 적용된 부스 사진 — 카드 기본 표시 이미지 */
  applicationImage: string;
  status: ContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type RentalCategory =
  | "chair"
  | "table"
  | "sofa"
  | "counter"
  | "display"
  | "showcase"
  | "refrigerator"
  | "tv_monitor"
  | "lighting"
  | "kitchen"
  | "accessories";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "on_order";

export interface RentalItem {
  id: string;
  productCode: string;
  slug: string;
  name: string;
  category: RentalCategory;
  width: number;
  depth: number;
  height: number;
  color: string;
  material: string;
  description: string;
  images: string[];
  stockStatus: StockStatus;
  priceVisible: boolean;
  rentalPrice: number | null;
  featured: boolean;
  status: ContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type DownloadCategory =
  | "3d_source"
  | "cad_drawing"
  | "design_manual"
  | "assembly_manual"
  | "graphic_guideline"
  | "product_catalog"
  | "specification"
  | "other";

export type FileFormat = "PDF" | "SKP" | "DWG" | "3DS" | "OBJ" | "FBX" | "MAX" | "ZIP" | "AI" | "JPG" | "PNG";

export type AccessLevel = "public" | "member" | "staff";

export interface DownloadFile {
  id: string;
  slug: string;
  title: string;
  category: DownloadCategory;
  version: string;
  fileType: FileFormat;
  fileSize: string;
  fileUrl: string;
  thumbnail: string;
  description: string;
  accessLevel: AccessLevel;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus =
  | "new"
  | "reviewing"
  | "assigned"
  | "quoting"
  | "replied"
  | "on_hold"
  | "closed";

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  exhibition: string | null;
  country: string | null;
  city: string | null;
  eventDate: string | null;
  boothWidth: number | null;
  boothDepth: number | null;
  boothHeight: number | null;
  budget: string | null;
  boothDesignId: string | null;
  requirements: string;
  attachments: string[];
  status: InquiryStatus;
  assigneeId: string | null;
  internalNotes: InquiryNote[];
  createdAt: string;
  updatedAt: string;
}

export interface InquiryNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export type BoothQuoteStatus = "pending" | "reviewing" | "quoted" | "confirmed" | "cancelled";

/** 부스 디자인 자동화 도구(마법사)에서 접수된 견적 요청. */
export interface BoothQuote {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  eventName: string | null;
  eventDate: string | null;
  notes: string | null;
  boothSizeId: string;
  boothSizeLabel: string;
  boothWidth: number;
  boothDepth: number;
  openFaces: number;
  logoText: string | null;
  chairCount: number;
  tableCount: number;
  tvCount: number;
  hasReception: boolean;
  hasStorageRoom: boolean;
  hasMeetingRoom: boolean;
  lightingType: string;
  graphicCoverage: string;
  status: BoothQuoteStatus;
  createdAt: string;
}

// ─────────────────────────────────────────
// 고객사 포털
// ─────────────────────────────────────────

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  note: string;
  status: UserStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConstructionTeam {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  note: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ClientProjectStage = "ongoing" | "completed";

export interface ClientProject {
  id: string;
  designCode: string;
  clientId: string;
  title: string;
  stage: ClientProjectStage;
  constructionTeamId: string | null;
  sitePrepStartDate: string | null;
  sitePrepEndDate: string | null;
  constructionStartDate: string | null;
  constructionEndDate: string | null;
  teardownStartDate: string | null;
  teardownEndDate: string | null;
  note: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ClientProjectFileCategory =
  | "graphic_source"
  | "final_design"
  | "final_drawing"
  | "graphic_manual"
  | "equipment_list"
  | "construction_photo";

export interface ClientProjectFile {
  id: string;
  projectId: string;
  category: ClientProjectFileCategory;
  fileName: string;
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy: string | null;
  uploadedByRole: UserRole;
  createdAt: string;
}

export interface ClientProjectEquipmentItem {
  id: string;
  projectId: string;
  rentalItemId: string | null;
  name: string;
  category: RentalCategory | null;
  qty: number;
  unitPrice: number | null;
  createdBy: string | null;
  createdAt: string;
}
