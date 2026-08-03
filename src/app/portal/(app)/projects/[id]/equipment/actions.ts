"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth";
import { getClientProjectById } from "@/lib/data/client-projects";
import { replaceEquipmentSelection, type EquipmentSelectionLine } from "@/lib/data/client-project-equipment";

export interface SaveEquipmentResult {
  success: boolean;
  error?: string;
}

export async function saveEquipmentSelection(projectId: string, lines: EquipmentSelectionLine[]): Promise<SaveEquipmentResult> {
  await requireClient();

  // RLS(client_read_own_projects)가 이미 소유권을 걸러주므로, 남의 projectId면 project가 null이 된다.
  const project = await getClientProjectById(projectId);
  if (!project) return { success: false, error: "프로젝트를 찾을 수 없거나 접근 권한이 없습니다." };

  try {
    await replaceEquipmentSelection(projectId, lines);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "저장 중 오류가 발생했습니다." };
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/equipment`);
  return { success: true };
}
