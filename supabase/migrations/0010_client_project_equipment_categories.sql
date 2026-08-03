-- ─────────────────────────────────────────────────────────────
-- client_project_files 카테고리 확장: 최종 도면(final_drawing), 비품리스트 직접 업로드(equipment_list)
-- ALTER TYPE ... ADD VALUE는 같은 트랜잭션 내에서 그 값을 바로 참조할 수 없으므로
-- 별도 마이그레이션 파일로 분리한다 (사용은 0011에서).
-- ─────────────────────────────────────────────────────────────

alter type client_project_file_category add value if not exists 'final_drawing';
alter type client_project_file_category add value if not exists 'equipment_list';
