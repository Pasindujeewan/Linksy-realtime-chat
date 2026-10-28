import LoginForm from "./LoginForm";
import { useLoginForm } from "./useLoginForm";

export default function LoginPage() {
  const {
    errors,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    isSubmitting,
    values,
  } = useLoginForm();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5 py-10 sm:px-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <a
          href="/"
          className="mb-9 inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-indigo-700"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            ↗
          </span>
          linksy
        </a>
        <div className="mb-7">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Welcome back
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Log in to Linksy
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to pick up where your conversations left off.
          </p>
        </div>
        <LoginForm
          errors={errors}
          isSubmitting={isSubmitting}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={handleSubmit}
          values={values}
        />
        <p className="mt-6 text-center text-sm text-slate-500">
          New to Linksy?{" "}
          <a
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Create an account
          </a>
        </p>
      </section>
    </main>
  );
}
