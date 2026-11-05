import { LogOut, MessageCircle, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import ChatUserList from "./ChatUserList";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../contexts/ToastContext";

export default function DashboardPage() {
  const { user, isLoadingProfile, logout } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const displayName = user.username;
  const avatarUrl = user.avatarUrl;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("You’ve been logged out.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't log you out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

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
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
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
