"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/form-fields";
import { saveSettings, type FormState } from "@/app/admin/settings/actions";

export function SettingsForm({ settings }: { settings: { key: string; value: string }[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveSettings, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {settings.map((s) => (
        <div key={s.key} className="bg-white border border-aso-line p-4">
          <label htmlFor={s.key} className="block text-xs font-num text-aso-muted mb-1.5">{s.key}</label>
          {s.value.length > 60 ? (
            <textarea id={s.key} name={s.key} defaultValue={s.value} rows={3} className="input resize-y" />
          ) : (
            <input id={s.key} name={s.key} defaultValue={s.value} className="input" />
          )}
        </div>
      ))}

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-600">저장되었습니다.</p>}

      <SubmitButton label="전체 저장" />
    </form>
  );
}
