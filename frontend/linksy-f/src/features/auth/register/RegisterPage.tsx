import RegisterForm from "./RegisterForm";
import RegisterHero from "./RegisterHero";
import { useRegisterForm } from "./useRegisterForm";

export default function RegisterPage() {
  const {
    avatarPreview,
    avatarStatus,
    errors,
    handleAvatarChange,
    handleSubmit,
    isSubmitting,
    update,
    values,
  } = useRegisterForm();

  return (
    <main className="min-h-screen bg-[#f7f8fc] lg:grid lg:grid-cols-[minmax(360px,0.92fr)_1.08fr]">
      <RegisterHero />
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

          <RegisterForm
            avatarPreview={avatarPreview}
            avatarStatus={avatarStatus}
            errors={errors}
            isSubmitting={isSubmitting}
            onAvatarChange={handleAvatarChange}
            onFieldChange={update}
            onSubmit={handleSubmit}
            values={values}
          />
        </div>
      </section>
    </main>
  );
}
