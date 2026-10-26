import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leading?: ReactNode;
}

export default function FormField({ label, error, leading, id, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className={`flex items-center gap-3 rounded-xl border bg-white px-3.5 transition focus-within:ring-4 ${error ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100" : "border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100"}`}>
        {leading && <span className="shrink-0 text-slate-400" aria-hidden="true">{leading}</span>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...inputProps}
        />
      </div>
      {error && <p id={`${inputId}-error`} className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
