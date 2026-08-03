# ASO System Website

**Aluminum Solution Organizer** — 알루미늄 모듈 시스템 기반 전시부스/쇼룸/브랜드 공간 솔루션 기업 ASO System의 공식 웹사이트 및 관리자 CMS.

- 공개 홈페이지: 시스템 소개, 포트폴리오, 200개 이상 시스템 부스 디자인 검색, 비품 임대, 다운로드, 프로젝트 문의
- 관리자 CMS: 역할 기반(관리자/담당자) 콘텐츠 관리, CSV 대량 등록, 문의 처리
- 기술 스택: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase (Postgres/Auth/Storage) · React Hook Form · Zod · TanStack Table

---

## 1. 빠른 시작 (로컬 데모 모드)

Supabase 없이도 즉시 전체 사이트를 확인할 수 있습니다. 시드 데이터가 메모리에 자동 적재되고,
`/admin`은 가상의 관리자 세션으로 바로 접근됩니다 (서버 재시작 시 데이터 초기화).

```bash
npm install
npm run dev
```

<http://localhost:3000> 접속 → 공개 사이트 확인
<http://localhost:3000/admin> 접속 → 관리자 CMS 바로 확인 (로그인 불필요, 데모 전용)

> 실제 운영을 위해서는 아래 2번부터 진행해 Supabase를 연결해야 합니다. Supabase가 연결되면
> 이 로컬 데모 모드(가상 로그인, 인메모리 저장)는 자동으로 비활성화되고 실제 인증/DB가 사용됩니다.

---

## 2. Supabase 프로젝트 연결 (운영 환경)

### 2-1. 프로젝트 생성 및 환경변수

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 Settings → API 에서 URL / anon key / service_role key를 확인합니다.
3. `.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 서버 전용, 절대 클라이언트에 노출 금지
NEXT_PUBLIC_SITE_URL=https://www.a-s-o.co.kr
```

### 2-2. 데이터베이스 Migration 적용

`supabase/migrations/`에 두 개의 SQL 파일이 있습니다 (스키마+RLS, Storage 버킷+정책).

**옵션 A — Supabase CLI 사용 (권장)**

```bash
npm install -g supabase
supabase link --project-ref <your-project-ref>
supabase db push
```

**옵션 B — psql로 직접 적용**

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_storage.sql
```

`DATABASE_URL`은 Supabase Settings → Database → Connection string에서 확인합니다.

### 2-3. Seed 데이터 적재

Migration 적용 후 실행합니다. 관리자 1명 + 담당자 1명 계정, 포트폴리오 8건, 시스템 부스 디자인 216건
(200개 이상 검색 테스트용), 비품 20건, 다운로드 자료 8건, 문의 샘플 5건이 생성됩니다.

```bash
npm run db:seed
```

실행 후 출력되는 관리자/담당자 임시 비밀번호로 로그인하세요 (`src/lib/seed-data/users.ts` 참고).
**최초 로그인 후 반드시 비밀번호를 변경하세요.**

### 2-4. 관리자/담당자 계정 추가 생성

공개 회원가입은 제공하지 않습니다. 계정은 관리자만 생성할 수 있으며, 방법은 두 가지입니다.

**CLI로 생성:**

```bash
npm run create-user -- --name "홍길동" --email new-staff@a-s-o.co.kr --password "TempPass123!" --role staff
```

**관리자 화면에서 생성:** 로그인 후 `/admin/users` → "계정 생성"

---

## 3. 개발 명령어

```bash
npm install              # 패키지 설치
npm run dev               # 개발 서버 (http://localhost:3000)
npm run typecheck          # TypeScript 타입 검사
npm run lint               # ESLint 검사
npm run build              # Production 빌드
npm run start              # Production 서버 실행 (build 이후)
npm run db:seed            # Supabase에 시드 데이터 적재
npm run create-user -- --name .. --email .. --password .. --role admin|staff
```

---

## 4. 배포 방법 (Vercel 기준)

1. GitHub 저장소에 push 합니다.
2. [vercel.com](https://vercel.com)에서 새 프로젝트로 이 저장소를 Import 합니다.
3. Vercel 프로젝트 설정 → Environment Variables에 `.env.local`과 동일한 4개 값을 등록합니다.
   - `SUPABASE_SERVICE_ROLE_KEY`는 반드시 서버 전용으로만 사용되며 클라이언트에 노출되지 않습니다.
4. Deploy를 실행합니다. 이후 커밋 push마다 자동 배포됩니다.
5. 배포 후 최초 1회, 로컬 또는 CI에서 `npm run db:seed`를 실행해 Supabase에 데이터를 적재합니다
   (`.env.local`이 배포 대상 Supabase 프로젝트를 가리키고 있어야 합니다).

다른 Node.js 호스팅(자체 서버, Docker 등)도 `npm run build && npm run start`로 동일하게 동작합니다.

---

## 5. 이미지 및 Hero 영상 교체 방법

### 로고

- `public/logo.png` — 헤더/푸터 로고 (현재 텍스트 로고마크로 대체되어 있어, 실제 로고 이미지 준비 시
  `src/components/layout/header.tsx`의 `LogoMark` 컴포넌트를 `<Image src="/logo.png" ... />`로 교체하세요.)

### Hero 배경 (조립·분해·재구성 애니메이션)

현재는 실제 영상 없이 SVG/Framer Motion 기반 코드 애니메이션(`src/components/home/hero-scene.tsx`)이
"동일 모듈이 다른 배치로 조립/분해/재구성"되는 컨셉을 표현하고 있습니다. 실제 3D 렌더링 영상이 준비되면
아래 경로에 파일만 넣으면 자동으로 영상이 우선 재생됩니다 (영상 로드 실패 시 코드 애니메이션으로 자연 대체):

```
public/assets/hero/aso-transform.webm
public/assets/hero/aso-transform.mp4
public/assets/hero/aso-transform-poster.webp   # 저사양/모션 감소 환경용 정지 이미지
```

### 포트폴리오 / 부스 디자인 / 비품 / 다운로드 썸네일

모든 콘텐츠는 실제 이미지가 없을 때 절제된 플레이스홀더(`SafeImage` 컴포넌트)로 자동 대체되어
레이아웃이 깨지지 않습니다. 실제 이미지를 다음 위치에 두면 자동으로 교체됩니다.

- `public/assets/placeholder/portfolio/...`
- `public/assets/placeholder/booth-design/...`
- `public/assets/placeholder/rental/...`
- `public/assets/placeholder/downloads/...`

또는 각 관리자 화면(`/admin/portfolio`, `/admin/booth-designs` 등)에서 이미지 경로/URL을 직접 수정할 수
있습니다. Supabase Storage를 이미지 저장소로 사용하려면 업로드 후 반환되는 public URL을 각 필드에
입력하세요 (버킷: `portfolio-images`, `booth-design-images`, `rental-images`, `downloads`).

---

## 6. 데이터 백업 방법

Supabase 프로젝트는 Postgres이므로 표준 `pg_dump`로 백업/복원할 수 있습니다.

```bash
# 백업
pg_dump "$DATABASE_URL" -F c -f aso-backup-$(date +%Y%m%d).dump

# 복원 (새 프로젝트 또는 재해복구 시)
pg_restore -d "$DATABASE_URL" --clean --if-exists aso-backup-20260101.dump
```

Storage(이미지·파일) 백업은 Supabase 대시보드 → Storage에서 버킷별로 다운로드하거나,
`supabase storage` CLI 명령으로 동기화할 수 있습니다. Supabase Pro 플랜 이상에서는
Point-in-Time Recovery(PITR)를 활성화해 특정 시점으로 자동 복구할 수도 있습니다.

---

## 7. 프로젝트 구조

```
src/
  app/                    # 라우트 (App Router)
    (public pages)        # /, /system, /portfolio, /booth-design, /rental, /downloads, /inquiry, /login
    admin/                # 관리자 CMS (역할 기반 가드: src/lib/auth.ts)
  components/             # UI 컴포넌트 (홈 섹션, 도메인별 카드/필터, 관리자 폼 등)
  lib/
    data/                 # 데이터 액세스 레이어 (Supabase ↔ 로컬 데모 모드 자동 분기)
    seed-data/            # 한국어 샘플 콘텐츠 (시드 스크립트와 로컬 데모 모드가 공유)
    supabase/             # Supabase client(browser/server/admin)
    validations/          # Zod 스키마
  types/domain.ts         # 도메인 타입 (섹션 15 데이터 모델과 1:1 대응)
  proxy.ts                # /admin 라우트 가드 (Next.js 16: middleware → proxy로 개명됨)
supabase/
  migrations/             # DB 스키마 + RLS + Storage 정책
scripts/
  seed.ts                 # Supabase 시드 스크립트
  create-user.ts          # 관리자/담당자 계정 생성 CLI
public/samples/
  booth-design-sample.csv # 부스 디자인 CSV 일괄 등록 샘플
```

## 8. 권한 모델 요약

- 공개 회원가입 없음 — 계정은 관리자만 생성 (`/admin/users` 또는 `scripts/create-user.ts`)
- 역할: `admin`(전체 권한) / `staff`(담당 콘텐츠 등록·수정, 사용자·설정 관리 불가)
- 담당자가 등록/수정한 콘텐츠는 자동으로 Draft 상태 → 관리자 승인(게시 전환) 후 공개
- 모든 권한 검증은 서버(Server Component/Server Action)에서 재확인되며, 클라이언트가 role을 조작할 수 없음
- Supabase RLS로 DB 레벨에서도 이중 방어 (`supabase/migrations/0001_init.sql` 참고)

## 9. 알려진 제한사항 / 다음 단계

- 로고, 실제 포트폴리오/부스/비품 사진, Hero 3D 영상은 플레이스홀더 상태입니다 (교체 방법: 5번 참고).
- 관리자 신규 문의 알림(이메일/슬랙 등)은 연동 지점만 마련되어 있습니다 (`src/app/inquiry/actions.ts`의 TODO 참고).
- 영문 사이트는 아직 없으나, 콘텐츠 구조(도메인 타입/데이터 레이어)가 한국어 텍스트와 분리되어 있어
  다국어 확장 시 라우트 그룹(`/en/...`) 추가와 번역 테이블만 붙이면 됩니다.
