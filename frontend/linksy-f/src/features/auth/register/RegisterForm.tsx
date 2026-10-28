import { Mail, UserRound } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import FormField from "../../../components/auth/FormField";
import PasswordField from "./PasswordField";
import type {
  AvatarUploadStatus,
  RegisterFieldErrors,
  RegisterFields,
} from "./registerTypes";
import AvatarUploadField from "./AvatarUploadField";

interface RegisterFormProps {
  avatarPreview: string;
  avatarStatus: AvatarUploadStatus;
  errors: RegisterFieldErrors;
  isSubmitting: boolean;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: <K extends keyof RegisterFields>(
    key: K,
    value: RegisterFields[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  values: RegisterFields;
}

export default function RegisterForm({
  avatarPreview,
  avatarStatus,
  errors,
  isSubmitting,
  onAvatarChange,
  onFieldChange,
  onSubmit,
  values,
}: RegisterFormProps) {
  const isUploadingAvatar = avatarStatus === "uploading";

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField
          label="Username"
          name="username"
          placeholder="e.g. alex_morgan"
          autoComplete="username"
          required
          value={values.username}
          error={errors.username}
          onChange={(event) => onFieldChange("username", event.target.value)}
          leading={<UserRound className="h-4 w-4" />}
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={values.email}
          error={errors.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          leading={<Mail className="h-4 w-4" />}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Password"
            name="password"
            placeholder="At least 8 characters"
            value={values.password}
            error={errors.password}
            onChange={(event) => onFieldChange("password", event.target.value)}
          />
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            placeholder="Type it again"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) =>
              onFieldChange("confirmPassword", event.target.value)
            }
          />
        </div>
        <AvatarUploadField
          error={errors.avatarFile}
          onChange={onAvatarChange}
          previewUrl={avatarPreview}
          status={avatarStatus}
          uploadedToken={values.imageToken}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="bio"
            className="block text-sm font-semibold text-slate-700"
          >
            A little about you{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={2}
            maxLength={160}
            placeholder="What should people know about you?"
            value={values.bio}
            onChange={(event) => onFieldChange("bio", event.target.value)}
            className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.bio ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}`}
          />
          <div className="flex justify-between">
            <span className="text-xs text-rose-600">{errors.bio}</span>
            <span className="text-xs text-slate-400">
              {values.bio.length}/160
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isUploadingAvatar}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploadingAvatar
            ? "Uploading profile picture…"
            : isSubmitting
              ? "Creating your account…"
              : "Create account"}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Log in
        </a>
      </p>
      <p className="mt-8 text-center text-xs leading-5 text-slate-400">
        By creating an account, you agree to our{" "}
        <a
          href="#terms"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="#privacy"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          Privacy Policy
        </a>
        .
      </p>
    </>
  );
}
