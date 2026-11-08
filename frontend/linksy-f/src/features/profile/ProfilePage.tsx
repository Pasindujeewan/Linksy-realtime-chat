import { ArrowLeft, UserRound } from "lucide-react";
import { Link } from "react-router";
import { useUser } from "../../contexts/UserContext";

export default function ProfilePage() {
  const { user, isLoadingProfile } = useUser();

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">Your account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Your profile
          </h1>
        </div>

        {isLoadingProfile && (
          <p role="status" className="mb-4 text-sm text-slate-500">
            Loading your profile…
          </p>
        )}

        <section
          aria-label="Profile details"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.username}'s profile`}
                className="h-20 w-20 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <span
                role="img"
                aria-label={`${user.username}'s profile`}
                className="grid h-20 w-20 place-items-center rounded-full bg-indigo-50 text-indigo-500"
              >
                <UserRound aria-hidden="true" className="h-9 w-9" />
              </span>
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {user.username}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Linksy member</p>
            </div>
          </div>

          <dl className="divide-y divide-slate-100">
            <div className="py-5">
              <dt className="text-sm font-medium text-slate-500">Username</dt>
              <dd className="mt-1 text-sm text-slate-900">{user.username}</dd>
            </div>
            {user.email && (
              <div className="py-5">
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-900">{user.email}</dd>
              </div>
            )}
            {user.bio && (
              <div className="py-5">
                <dt className="text-sm font-medium text-slate-500">About</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-900">
                  {user.bio}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </main>
  );
}
