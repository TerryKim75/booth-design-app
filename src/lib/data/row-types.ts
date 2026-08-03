/**
 * Supabase 쿼리 결과 원시 row 타입. 매핑 함수(rowToX) 내부에서만 사용되며,
 * 매핑 결과는 항상 src/types/domain.ts의 엄격한 도메인 타입으로 변환된다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbRow = Record<string, any>;
