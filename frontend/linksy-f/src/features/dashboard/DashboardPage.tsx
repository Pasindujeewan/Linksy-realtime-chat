import { MessageCircle, UserRound } from "lucide-react";
import ChatUserList from "./ChatUserList";
import { useUser } from "../../contexts/UserContext";

export default function DashboardPage() {
  const { user, isLoadingProfile } = useUser();

  if (!user) return null;

  const displayName = user.username;
  const avatarUrl = user.avatarUrl;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-indigo-700"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
            </span>
            linksy
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">Your account</p>
            </div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName}'s profile`}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <span
                role="img"
                aria-label={`${displayName}'s profile`}
                className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-500"
              >
                <UserRound aria-hidden="true" className="h-5 w-5" />
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">Your dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {displayName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your space for staying close to the people who matter.
          </p>
        </div>

        {isLoadingProfile && (
          <p role="status" className="mb-4 text-sm text-slate-500">
            Loading your profile…
          </p>
        )}
        <ChatUserList />
      </div>
    </main>
  );
}
