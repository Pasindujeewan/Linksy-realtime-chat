import LoginForm from "./LoginForm";
import { useLoginForm } from "./useLoginForm";
import GoogleSignInOption from "../shared/GoogleSignInOption";
import AuthHero from "../shared/AuthHero";
import { useGoogleSignIn } from "../shared/useGoogleSignIn";

export default function LoginPage() {
  const { handleGoogleSignIn, isSigningIn } = useGoogleSignIn();
  const {
    errors,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    isSubmitting,
    values,
  } = useLoginForm();

  return (
    <main className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[minmax(360px,0.92fr)_1.08fr]">
      <AuthHero />
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-lg">
          <a
            href="/"
            className="mb-10 flex items-center gap-2.5 text-lg font-bold tracking-tight text-indigo-700 lg:hidden"
          >
            <img
              src="/linksy-logo.svg"
              alt=""
              aria-hidden="true"
              className="h-10 w-10 rounded-xl"
            />
            <span>Linksy</span>
          </a>
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Welcome back
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Log in to Linksy
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in to pick up where your conversations left off.
            </p>
          </div>
          <GoogleSignInOption
            disabled={isSubmitting}
            isSigningIn={isSigningIn}
            onClick={handleGoogleSignIn}
          />
          <LoginForm
            errors={errors}
            isSubmitting={isSubmitting || isSigningIn}
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
        </div>
      </section>
    </main>
  );
}
