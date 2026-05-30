-- =========================================
-- Booth Design App - Initial Setup Migration
-- Supabase SQL Editor에 붙여넣고 실행하세요
-- =========================================

-- 1. 견적 요청 테이블
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- 고객 정보
  company_name    text NOT NULL,
  contact_name    text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  event_name      text,
  event_date      date,
  notes           text,

  -- 부스 크기
  booth_size_id   text NOT NULL,
  booth_size_label text NOT NULL,
  booth_width     numeric NOT NULL,
  booth_depth     numeric NOT NULL,

  -- 구성 요소
  logo_text       text,
  chair_count     integer NOT NULL DEFAULT 0,
  table_count     integer NOT NULL DEFAULT 0,
  tv_count        integer NOT NULL DEFAULT 0,
  has_reception   boolean NOT NULL DEFAULT false,
  has_storage_room boolean NOT NULL DEFAULT false,
  lighting_type   text NOT NULL DEFAULT 'basic',
  graphic_coverage text NOT NULL DEFAULT 'none',

  -- 상태 관리
  status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'quoted', 'confirmed', 'cancelled'))
);

-- 2. RLS (Row Level Security) 설정
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- anon 사용자: INSERT만 허용 (고객이 견적 요청 제출)
CREATE POLICY "allow_anon_insert" ON public.quote_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- authenticated 사용자 (관리자): 모든 작업 허용
CREATE POLICY "allow_authenticated_all" ON public.quote_requests
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. 스토리지 버킷
-- 부스 에셋 (렌더 이미지, 기본 도면 등)
INSERT INTO storage.buckets (id, name, public)
VALUES ('booth-assets', 'booth-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 견적 첨부파일 (로고, 참고 이미지 등)
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 4. 스토리지 RLS 정책
-- booth-assets: 누구나 읽기 가능 (public)
CREATE POLICY "public_read_booth_assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'booth-assets');

-- booth-assets: authenticated만 업로드
CREATE POLICY "auth_upload_booth_assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'booth-assets');

-- quote-attachments: anon 업로드 허용 (고객 로고 업로드)
CREATE POLICY "anon_upload_quote_attachments" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'quote-attachments');

-- quote-attachments: authenticated만 읽기 (관리자)
CREATE POLICY "auth_read_quote_attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'quote-attachments');

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON public.quote_requests (email);

-- 완료 확인
SELECT 'Setup complete! Tables and buckets created.' AS result;
