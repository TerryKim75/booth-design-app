"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label = "저장" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="bg-aso-primary text-white text-sm font-semibold px-6 min-h-11 disabled:opacity-50">
      {pending ? "저장 중..." : label}
    </button>
  );
}

export function Section({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-aso-line p-5">
      <legend className="text-sm font-bold text-aso-black px-2">{legend}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">{children}</div>
    </fieldset>
  );
}

export function TextField({
  name, label, type = "text", step, defaultValue, required, full,
}: { name: string; label: string; type?: string; step?: string; defaultValue?: string | number; required?: boolean; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="block text-xs text-aso-muted mb-1">{label} {required && <span className="text-aso-primary">*</span>}</label>
      <input id={name} name={name} type={type} step={step} required={required} defaultValue={defaultValue} className="input" />
    </div>
  );
}

export function TextArea({
  name, label, defaultValue, rows = 4, full,
}: { name: string; label: string; defaultValue?: string; rows?: number; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="block text-xs text-aso-muted mb-1">{label}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className="input resize-y" />
    </div>
  );
}

export function SelectField({
  name, label, defaultValue, options, labels, freeSolo,
}: { name: string; label: string; defaultValue?: string; options: string[]; labels?: Record<string, string>; freeSolo?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs text-aso-muted mb-1">{label}</label>
      {freeSolo ? (
        <input id={name} name={name} list={`${name}-options`} defaultValue={defaultValue} className="input" />
      ) : (
        <select id={name} name={name} defaultValue={defaultValue} className="input">
          {options.map((o) => (
            <option key={o} value={o}>
              {labels?.[o] ?? o}
            </option>
          ))}
        </select>
      )}
      {freeSolo && (
        <datalist id={`${name}-options`}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      )}
    </div>
  );
}

export function CheckboxGroup({
  name, label, options, labels, defaultValue = [],
}: { name: string; label: string; options: string[]; labels?: Record<string, string>; defaultValue?: string[] }) {
  return (
    <div className="sm:col-span-2">
      <p className="text-xs text-aso-muted mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="inline-flex items-center gap-1.5 text-xs border border-aso-line px-2.5 py-1.5 has-[:checked]:border-aso-black has-[:checked]:bg-aso-offwhite">
            <input type="checkbox" name={name} value={o} defaultChecked={defaultValue.includes(o)} className="w-3.5 h-3.5" />
            {labels?.[o] ?? o}
          </label>
        ))}
      </div>
    </div>
  );
}
