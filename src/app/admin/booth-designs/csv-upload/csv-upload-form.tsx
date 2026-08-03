"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/form-fields";
import { uploadBoothDesignCsv, type CsvUploadResult } from "@/app/admin/booth-designs/actions";

export function CsvUploadForm() {
  const [state, formAction] = useActionState<CsvUploadResult, FormData>(uploadBoothDesignCsv, { success: false });

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div>
        <label htmlFor="csvFile" className="block text-sm text-aso-charcoal-2 mb-1.5">
          CSV 파일
        </label>
        <input id="csvFile" name="csvFile" type="file" accept=".csv" required className="input" />
      </div>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p role="status" className="text-sm text-emerald-600">
          {state.createdCount}개의 디자인이 등록되었습니다.
        </p>
      )}
      {state.rowErrors && state.rowErrors.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3">
          <p className="font-semibold mb-1">일부 행이 건너뛰어졌습니다:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {state.rowErrors.slice(0, 10).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <SubmitButton label="업로드" />
    </form>
  );
}
