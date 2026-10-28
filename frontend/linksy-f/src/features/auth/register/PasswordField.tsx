import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import FormField from "../../../components/auth/FormField";

interface PasswordFieldProps {
  label: string;
  name: "password" | "confirmPassword";
  placeholder: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordField({
  label,
  name,
  placeholder,
  value,
  error,
  onChange,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField
      label={label}
      name={name}
      type={isVisible ? "text" : "password"}
      placeholder={placeholder}
      autoComplete="new-password"
      required
      value={value}
      error={error}
      onChange={onChange}
      leading={<LockKeyhole className="h-4 w-4" />}
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Eye aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      }
    />
  );
}
