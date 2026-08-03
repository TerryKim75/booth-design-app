export type OpenFaces = 1 | 2 | 3 | 4;

export interface WallConfig {
  back: boolean;
  left: boolean;
  right: boolean;
  front: boolean;
}

export function getWallConfig(openFaces: OpenFaces): WallConfig {
  switch (openFaces) {
    case 1: return { back: true,  left: true,  right: true,  front: false };
    case 2: return { back: true,  left: true,  right: false, front: false };
    case 3: return { back: true,  left: false, right: false, front: false };
    case 4: return { back: false, left: false, right: false, front: false };
  }
}

export interface BoothSize {
  id: string;
  width: number;
  depth: number;
  label: string;
  description: string;
}

export interface SizedElement {
  enabled: boolean;
  widthM: number;
  depthM: number;
  heightM: number;
}

export interface BoothElements {
  logoText: string;
  chairCount: number;
  tableCount: number;
  tvCount: number;
  hasReception: boolean;
  storage: SizedElement;
  meetingRoom: SizedElement;
  lightingType: 'basic' | 'led' | 'spotlight';
  graphicCoverage: 'none' | 'partial' | 'full';
}

export interface Pos {
  x: number; // meters from left edge
  y: number; // meters from back (top in plan)
}

export interface ElementPositions {
  tables: Pos[];
  chairs: Pos[];
  tvs: Pos[];
  reception: Pos;
  storage: Pos;
  meetingRoom: Pos;
}

export interface BoothConfig {
  size: BoothSize | null;
  openFaces: OpenFaces;
  elements: BoothElements;
  positions: ElementPositions;
}

// Standard element footprint sizes (meters)
export const ELEM_SIZE = {
  chair:     { w: 0.5, d: 0.5 },
  table:     { w: 0.9, d: 0.6 },
  tv:        { w: 0.8, d: 0.2 },
  reception: { w: 1.5, d: 0.6 },
};

export function getDefaultPositions(
  size: BoothSize,
  elements: BoothElements,
  existing?: ElementPositions,
): ElementPositions {
  const { width, depth } = size;

  const tables: Pos[] = existing ? [...existing.tables] : [];
  const spacing_t = width / (elements.tableCount + 1);
  for (let i = tables.length; i < elements.tableCount; i++) {
    tables.push({
      x: Math.max(0, Math.min(spacing_t * (i + 1) - ELEM_SIZE.table.w / 2, width - ELEM_SIZE.table.w)),
      y: Math.max(0, depth - ELEM_SIZE.table.d - 0.9),
    });
  }

  const chairs: Pos[] = existing ? [...existing.chairs] : [];
  const spacing_c = width / (elements.chairCount + 1);
  for (let i = chairs.length; i < elements.chairCount; i++) {
    chairs.push({
      x: Math.max(0, Math.min(spacing_c * (i + 1) - ELEM_SIZE.chair.w / 2, width - ELEM_SIZE.chair.w)),
      y: Math.max(0, depth - ELEM_SIZE.chair.d - 0.15),
    });
  }

  const tvs: Pos[] = existing ? [...existing.tvs] : [];
  const spacing_tv = width / (elements.tvCount + 1);
  for (let i = tvs.length; i < elements.tvCount; i++) {
    tvs.push({
      x: Math.max(0, spacing_tv * (i + 1) - ELEM_SIZE.tv.w / 2),
      y: 0.05,
    });
  }

  return {
    tables,
    chairs,
    tvs,
    reception: existing?.reception ?? {
      x: Math.max(0, width - ELEM_SIZE.reception.w - 0.1),
      y: 0.3,
    },
    storage: existing?.storage ?? {
      x: Math.max(0, width - elements.storage.widthM - 0.1),
      y: Math.max(0, depth - elements.storage.depthM - 0.1),
    },
    meetingRoom: existing?.meetingRoom ?? { x: 0.1, y: 0.1 },
  };
}

export const BOOTH_SIZES: BoothSize[] = [
  { id: '3x3', width: 3, depth: 3, label: '3 × 3m (9㎡)',   description: '소규모 전시에 적합한 기본 부스' },
  { id: '3x6', width: 6, depth: 3, label: '3 × 6m (18㎡)',  description: '직선형 확장 부스, 제품 라인업 전시' },
  { id: '6x6', width: 6, depth: 6, label: '6 × 6m (36㎡)',  description: '중형 부스, 미팅공간 구성 가능' },
  { id: '6x9', width: 9, depth: 6, label: '6 × 9m (54㎡)',  description: '중대형 부스, 체험·미팅존 분리 가능' },
  { id: '9x9', width: 9, depth: 9, label: '9 × 9m (81㎡)',  description: '대형 아일랜드 부스' },
];

export const DEFAULT_ELEMENTS: BoothElements = {
  logoText: '',
  chairCount: 2,
  tableCount: 1,
  tvCount: 0,
  hasReception: false,
  storage:     { enabled: false, widthM: 1.0, depthM: 1.0, heightM: 2.4 },
  meetingRoom: { enabled: false, widthM: 2.0, depthM: 2.0, heightM: 2.4 },
  lightingType: 'basic',
  graphicCoverage: 'partial',
};

export const EMPTY_POSITIONS: ElementPositions = {
  tables: [], chairs: [], tvs: [],
  reception: { x: 0, y: 0 },
  storage:   { x: 0, y: 0 },
  meetingRoom: { x: 0, y: 0 },
};

export interface QuoteRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  eventName: string;
  eventDate: string;
  boothConfig: BoothConfig;
  notes: string;
}
