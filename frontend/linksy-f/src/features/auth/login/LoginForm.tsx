import type { ChangeEventHandler, FormEventHandler } from "react";
import { Mail } from "lucide-react";
import FormField from "../../../components/auth/FormField";
import PasswordField from "../register/PasswordField";
import type { LoginFieldErrors, LoginFields } from "./loginValidation";

interface LoginFormProps {
  errors: LoginFieldErrors;
  isSubmitting: boolean;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  values: LoginFields;
}

export default function LoginForm({
  errors,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  values,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField
        label="Email address"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={values.email}
        error={errors.email}
        onChange={onEmailChange}
        leading={<Mail className="h-4 w-4" />}
      />
      <PasswordField
        label="Password"
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={values.password}
        error={errors.password}
        onChange={onPasswordChange}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
