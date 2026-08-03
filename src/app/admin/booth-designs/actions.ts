"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffOrAdmin, requireAdmin } from "@/lib/auth";
import { formatActionError } from "@/lib/form-error";
import { boothDesignFormSchema } from "@/lib/validations/booth-design";
import { boothDesignCsvRowSchema } from "@/lib/validations/booth-design-csv";
import { csvToObjects } from "@/lib/csv";
import {
  createBoothDesign,
  updateBoothDesign,
  deleteBoothDesign,
  duplicateBoothDesign,
  bulkCreateBoothDesigns,
  type BoothDesignInput,
} from "@/lib/data/booth-designs";
import type { ContentStatus } from "@/types/domain";

export interface FormState {
  error?: string;
}

function parseInput(formData: FormData, actorId: string): BoothDesignInput {
  const raw = {
    ...Object.fromEntries(formData.entries()),
    styleTags: formData.getAll("styleTags"),
  };
  const parsed = boothDesignFormSchema.parse(raw);
  return {
    ...parsed,
    styleTags: parsed.styleTags as BoothDesignInput["styleTags"],
    openSides: parsed.openSides as BoothDesignInput["openSides"],
    area: Math.round(parsed.width * parsed.depth * 100) / 100,
    gallery: parsed.gallery ? parsed.gallery.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    floorPlan: parsed.floorPlan || null,
    featured: Boolean(parsed.featured),
    createdBy: actorId,
  };
}

export async function saveNewBoothDesign(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData, profile.id);
    if (profile.role === "staff") input.status = "draft";
    await createBoothDesign(input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/booth-designs");
  revalidatePath("/booth-design");
  redirect("/admin/booth-designs");
}

export async function updateExistingBoothDesign(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await requireStaffOrAdmin();
  try {
    const input = parseInput(formData, profile.id);
    if (profile.role === "staff") input.status = "draft";
    await updateBoothDesign(id, input);
  } catch (err) {
    return { error: formatActionError(err, "저장 중 오류가 발생했습니다.") };
  }
  revalidatePath("/admin/booth-designs");
  revalidatePath("/booth-design");
  redirect("/admin/booth-designs");
}

export async function removeBoothDesign(id: string) {
  await requireAdmin();
  await deleteBoothDesign(id);
  revalidatePath("/admin/booth-designs");
  revalidatePath("/booth-design");
}

export async function duplicateExistingBoothDesign(id: string) {
  await requireStaffOrAdmin();
  await duplicateBoothDesign(id);
  revalidatePath("/admin/booth-designs");
}

export async function setBoothDesignStatus(id: string, status: ContentStatus) {
  await requireStaffOrAdmin();
  await updateBoothDesign(id, { status });
  revalidatePath("/admin/booth-designs");
  revalidatePath("/booth-design");
}

export async function setBoothDesignFeatured(id: string, featured: boolean) {
  await requireStaffOrAdmin();
  await updateBoothDesign(id, { featured });
  revalidatePath("/admin/booth-designs");
  revalidatePath("/");
}

export interface CsvUploadResult {
  success: boolean;
  createdCount?: number;
  error?: string;
  rowErrors?: string[];
}

export async function uploadBoothDesignCsv(_prev: CsvUploadResult, formData: FormData): Promise<CsvUploadResult> {
  const profile = await requireStaffOrAdmin();
  const file = formData.get("csvFile");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "CSV 파일을 선택해주세요." };
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { success: false, error: "CSV 파일만 업로드할 수 있습니다." };
  }

  const text = await file.text();
  const rows = csvToObjects(text);
  if (rows.length === 0) {
    return { success: false, error: "CSV에 유효한 데이터 행이 없습니다." };
  }
  if (rows.length > 500) {
    return { success: false, error: "한 번에 최대 500행까지 업로드할 수 있습니다." };
  }

  const inputs: BoothDesignInput[] = [];
  const rowErrors: string[] = [];

  rows.forEach((row, i) => {
    const parsed = boothDesignCsvRowSchema.safeParse(row);
    if (!parsed.success) {
      rowErrors.push(`${i + 2}행: ${parsed.error.issues.map((iss) => iss.message).join(", ")}`);
      return;
    }
    const v = parsed.data;
    inputs.push({
      designCode: v.designCode,
      slug: v.designCode.toLowerCase(),
      title: v.title,
      width: v.width,
      depth: v.depth,
      area: Math.round(v.width * v.depth * 100) / 100,
      height: v.height,
      boothType: v.boothType,
      openSides: v.openSides as 1 | 2 | 3 | 4,
      frameType: v.frameType,
      features: v.features.map((feature) => ({ feature, note: "" })),
      styleTags: v.styleTags as BoothDesignInput["styleTags"],
      description: v.description,
      thumbnail: v.thumbnail,
      gallery: v.thumbnail ? [v.thumbnail] : [],
      floorPlan: null,
      materialSummary: v.materialSummary,
      featured: v.featured,
      status: profile.role === "staff" ? "draft" : v.status,
      sortOrder: 0,
      createdBy: profile.id,
    });
  });

  if (inputs.length === 0) {
    return { success: false, error: "모든 행이 검증에 실패했습니다.", rowErrors };
  }

  const createdCount = await bulkCreateBoothDesigns(inputs);
  revalidatePath("/admin/booth-designs");
  revalidatePath("/booth-design");

  return { success: true, createdCount, rowErrors: rowErrors.length ? rowErrors : undefined };
}
