import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClientProjectEquipmentItem, RentalCategory } from "@/types/domain";
import type { DbRow } from "@/lib/data/row-types";

function rowToItem(row: DbRow): ClientProjectEquipmentItem {
  return {
    id: row.id,
    projectId: row.project_id,
    rentalItemId: row.rental_item_id ?? null,
    name: row.name,
    category: row.category ?? null,
    qty: Number(row.qty),
    unitPrice: row.unit_price != null ? Number(row.unit_price) : null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
  };
}

/** RLS-scoped 클라이언트로 조회하므로 고객사 세션이면 자동으로 자기 프로젝트 행만 반환된다. */
export async function listEquipmentItems(projectId: string): Promise<ClientProjectEquipmentItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("client_project_equipment_items")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToItem);
}

export interface EquipmentSelectionLine {
  rentalItemId: string;
  name: string;
  category: RentalCategory;
  qty: number;
  unitPrice: number | null;
}

/**
 * 비품 선택 화면(/portal/projects/[id]/equipment)의 "등록완료" 저장 방식.
 * 매번 전체 선택 목록을 통째로 교체한다(기존 rental_order 행 삭제 후 재삽입) —
 * 수량 변경/삭제를 각각의 update/delete API로 다루지 않아도 되는 단순한 방식.
 */
export async function replaceEquipmentSelection(projectId: string, lines: EquipmentSelectionLine[]): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error: deleteError } = await supabase.from("client_project_equipment_items").delete().eq("project_id", projectId);
  if (deleteError) throw deleteError;

  if (lines.length === 0) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = lines.map((l) => ({
    project_id: projectId,
    rental_item_id: l.rentalItemId,
    name: l.name,
    category: l.category,
    qty: l.qty,
    unit_price: l.unitPrice,
    created_by: user?.id ?? null,
  }));
  const { error: insertError } = await supabase.from("client_project_equipment_items").insert(rows);
  if (insertError) throw insertError;
}
