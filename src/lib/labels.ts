import type {
  BoothFeature,
  BoothStyleTag,
  BoothType,
  DownloadCategory,
  FrameType,
  ProjectType,
  RentalCategory,
  InquiryStatus,
  StockStatus,
  ClientProjectStage,
  ClientProjectFileCategory,
} from "@/types/domain";

export const boothTypeLabel: Record<BoothType, string> = {
  inline: "인라인",
  corner: "코너형",
  peninsula: "페닌슐라",
  island: "아일랜드",
};

export const frameTypeLabel: Record<FrameType, string> = {
  "55mm": "55mm 프레임",
  "124mm": "124mm 프레임",
  mixed: "혼합 프레임",
};

export const boothFeatureLabel: Record<BoothFeature, string> = {
  storage: "창고",
  meeting_room: "미팅룸",
  semi_open_meeting_room: "반오픈미팅룸",
  standalone_display: "독립전시대",
  front_display: "전면전시대",
  showcase: "쇼케이스",
  shelf: "선반",
  video_wall: "비디오월",
  lighting_graphic: "조명그래픽",
};

export const boothStyleLabel: Record<BoothStyleTag, string> = {
  open: "오픈형",
  semi_closed: "반폐쇄형",
  closed: "폐쇄형",
  round_structure: "라운드구조",
  straight_structure: "직선구조",
};

export const projectTypeLabel: Record<ProjectType, string> = {
  exhibition_booth: "전시부스",
  showroom: "쇼룸",
  brand_space: "브랜드 공간",
  corporate_office: "오피스·사옥",
  retail_popup: "리테일·팝업",
  event_space: "행사·이벤트",
};

export const rentalCategoryLabel: Record<RentalCategory, string> = {
  chair: "의자",
  table: "테이블",
  sofa: "소파",
  counter: "카운터",
  display: "진열대",
  showcase: "쇼케이스",
  refrigerator: "냉장고",
  tv_monitor: "TV·모니터",
  lighting: "조명",
  kitchen: "주방·편의용품",
  accessories: "기타 액세서리",
};

export const stockStatusLabel: Record<StockStatus, string> = {
  in_stock: "대여 가능",
  low_stock: "재고 소량",
  out_of_stock: "대여 불가",
  on_order: "입고 예정",
};

export const downloadCategoryLabel: Record<DownloadCategory, string> = {
  "3d_source": "3D Source",
  cad_drawing: "CAD Drawing",
  design_manual: "System Design Manual",
  assembly_manual: "Assembly Manual",
  graphic_guideline: "Graphic Guideline",
  product_catalog: "Product Catalog",
  specification: "Specification",
  other: "Other",
};

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  new: "신규",
  reviewing: "확인 중",
  assigned: "담당자 배정",
  quoting: "견적 준비",
  replied: "회신 완료",
  on_hold: "보류",
  closed: "종료",
};

export const clientProjectStageLabel: Record<ClientProjectStage, string> = {
  ongoing: "진행중",
  completed: "완료",
};

export const clientProjectFileCategoryLabel: Record<ClientProjectFileCategory, string> = {
  graphic_source: "그래픽 업로드",
  final_design: "최종 디자인",
  final_drawing: "최종 도면",
  graphic_manual: "그래픽 매뉴얼",
  equipment_list: "비품리스트",
  construction_photo: "시공 사진",
};
