export interface BoothSize {
  id: string;
  width: number;  // meters
  depth: number;  // meters
  label: string;
  description: string;
  walls: WallConfig;
}

export interface WallConfig {
  back: boolean;
  left: boolean;
  right: boolean;
  front: boolean;
}

export interface BoothElements {
  logoText: string;
  chairCount: number;
  tableCount: number;
  tvCount: number;
  hasReception: boolean;
  hasStorageRoom: boolean;
  lightingType: 'basic' | 'led' | 'spotlight';
  graphicCoverage: 'none' | 'partial' | 'full';
}

export interface BoothConfig {
  size: BoothSize | null;
  elements: BoothElements;
}

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

export const BOOTH_SIZES: BoothSize[] = [
  {
    id: '3x3',
    width: 3,
    depth: 3,
    label: '3 × 3m (9㎡)',
    description: '소규모 전시에 적합한 기본 부스',
    walls: { back: true, left: true, right: true, front: false },
  },
  {
    id: '3x6',
    width: 6,
    depth: 3,
    label: '3 × 6m (18㎡)',
    description: '직선형 확장 부스, 제품 라인업 전시에 적합',
    walls: { back: true, left: true, right: true, front: false },
  },
  {
    id: '6x6',
    width: 6,
    depth: 6,
    label: '6 × 6m (36㎡)',
    description: '중형 부스, 별도 미팅공간 구성 가능',
    walls: { back: true, left: true, right: true, front: false },
  },
  {
    id: '6x9',
    width: 9,
    depth: 6,
    label: '6 × 9m (54㎡)',
    description: '중대형 부스, 체험존과 미팅존 분리 가능',
    walls: { back: true, left: true, right: true, front: false },
  },
  {
    id: '9x9',
    width: 9,
    depth: 9,
    label: '9 × 9m (81㎡)',
    description: '대형 아일랜드 부스, 4면 개방형 구성',
    walls: { back: false, left: false, right: false, front: false },
  },
];

export const DEFAULT_ELEMENTS: BoothElements = {
  logoText: '',
  chairCount: 2,
  tableCount: 1,
  tvCount: 0,
  hasReception: false,
  hasStorageRoom: false,
  lightingType: 'basic',
  graphicCoverage: 'partial',
};
