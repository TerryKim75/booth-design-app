/**
 * 관리자 이미지 업로드를 허용하는 Supabase Storage 버킷 목록.
 * 실제 업로드 처리는 /api/admin/upload-image Route Handler에서 수행한다
 * (Server Action 대신 일반 POST 엔드포인트 — Vercel에서 바이너리 파일이 담긴
 * multipart/form-data를 다루기에 더 안정적이고 예측 가능하다).
 */
export const ADMIN_IMAGE_BUCKETS = [
  "portfolio-images",
  "booth-design-images",
  "rental-images",
  "downloads",
] as const;

export type AdminImageBucket = (typeof ADMIN_IMAGE_BUCKETS)[number];
