import { useState, type FormEvent } from "react";
import FormField from "../components/auth/FormField";
import { registerUser } from "../services/authService";
import type { RegisterPayload } from "../types/auth";

type RegisterFields = RegisterPayload & { confirmPassword: string };
type FieldErrors = Partial<Record<keyof RegisterFields, string>>;

const initialValues: RegisterFields = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  avatarUrl: "",
  bio: "",
};

function validate(values: RegisterFields): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(values.username.trim())) {
    errors.username = "Use 3–20 letters, numbers, or underscores.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.password.length < 8 || values.password.length > 128) {
    errors.password = "Password must be between 8 and 128 characters.";
  }
  if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Passwords don't match.";
  try {
    new URL(values.avatarUrl);
  } catch {
    errors.avatarUrl = "Enter a valid profile image URL.";
  }
  if (values.bio && values.bio.length > 160)
    errors.bio = "Keep your bio under 160 characters.";
  return errors;
}

export default function RegisterPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [successName, setSuccessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof RegisterFields>(
    key: K,
    value: RegisterFields[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessName("");
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // Keep this payload aligned with the backend registerSchema; confirmation stays client-side.
      const { confirmPassword: _confirmPassword, ...payload } = values;
      await registerUser({
        ...payload,
        username: payload.username.trim(),
        email: payload.email.trim(),
      });
      setSuccessName(values.username.trim());
      setValues(initialValues);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[minmax(360px,0.92fr)_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-indigo-700 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -bottom-44 -left-24 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl" />
        <a
          href="/"
          className="relative flex items-center gap-3 text-xl font-bold tracking-tight"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-xl">
            ↗
          </span>{" "}
          linksy
        </a>
        <div className="relative max-w-xl py-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-indigo-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300" /> A little
            closer, wherever you are
          </div>
          <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            Good conversations start here.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-indigo-100">
            Make space for the people who make your day. Connect, share, and
            stay in the loop.
          </p>
          <div className="mt-12 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex -space-x-3">
              {["#f4b6a6", "#b6d3ff", "#f2d185", "#c4b5fd"].map(
                (color, index) => (
                  <div
                    key={color}
                    className="grid h-10 w-10 place-items-center rounded-full border-2 border-indigo-700 text-xs font-bold text-indigo-900"
                    style={{ backgroundColor: color }}
                  >
                    {(["J", "M", "A", "S"] as const)[index]}
                  </div>
                ),
              )}
            </div>
            <p className="text-sm text-indigo-50">
              Your next favorite conversation is one hello away.
            </p>
          </div>
        </div>
        <p className="relative text-xs text-indigo-200">
          © 2026 Linksy · Made for meaningful connections
        </p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-lg">
          <a
            href="/"
            className="mb-10 flex items-center gap-2.5 text-lg font-bold tracking-tight text-indigo-700 lg:hidden"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              ↗
            </span>{" "}
            linksy
          </a>
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Create your account
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Join the conversation
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              A few details and you’ll be ready to connect with your people.
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {formError}
            </div>
          )}
          {successName && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              Welcome to Linksy, {successName}! Your account is ready.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField
              label="Username"
              name="username"
              placeholder="e.g. alex_morgan"
              autoComplete="username"
              required
              value={values.username}
              error={errors.username}
              onChange={(event) => update("username", event.target.value)}
              leading={<span>@</span>}
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
              onChange={(event) => update("email", event.target.value)}
              leading={<span>✉</span>}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                value={values.password}
                error={errors.password}
                onChange={(event) => update("password", event.target.value)}
                leading={<span>⌑</span>}
              />
              <FormField
                label="Confirm password"
                name="confirmPassword"
                type="password"
                placeholder="Type it again"
                autoComplete="new-password"
                required
                value={values.confirmPassword}
                error={errors.confirmPassword}
                onChange={(event) =>
                  update("confirmPassword", event.target.value)
                }
                leading={<span>⌑</span>}
              />
            </div>
            <FormField
              label="Profile image URL"
              name="avatarUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
              required
              value={values.avatarUrl}
              error={errors.avatarUrl}
              onChange={(event) => update("avatarUrl", event.target.value)}
              leading={<span>◉</span>}
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
                onChange={(event) => update("bio", event.target.value)}
                className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${errors.bio ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}`}
              />
              <div className="flex justify-between">
                <span className="text-xs text-rose-600">{errors.bio}</span>
                <span className="text-xs text-slate-400">
                  {values.bio?.length ?? 0}/160
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating your account…" : "Create account"}
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
        </div>
      </section>
    </main>
  );
}
