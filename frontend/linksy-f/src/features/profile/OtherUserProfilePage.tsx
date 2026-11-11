import { ArrowLeft, Mail, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getOtherUserProfile } from "../../services/authService";
import type { PublicUserProfile } from "../../types/auth";

export default function OtherUserProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setProfile(null);
    setError(null);
    setIsLoading(true);

    if (!userId) {
      setError("This profile could not be found.");
      setIsLoading(false);
      return () => {
        isCurrentRequest = false;
      };
    }

    getOtherUserProfile(userId)
      .then((result) => {
        if (isCurrentRequest) setProfile(result);
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "We couldn't load this profile.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount, userId]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {isLoading && (
          <p role="status" className="text-sm text-slate-500">
            Loading profile…
          </p>
        )}

        {error && !isLoading && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
            {userId && (
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Try again
              </button>
            )}
          </section>
        )}

        {profile && (
          <section
            aria-label={`Profile and chat with ${profile.username}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <header className="border-b border-slate-200 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.username}'s profile`}
                    className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <span
                    role="img"
                    aria-label={`${profile.username}'s profile`}
                    className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-500"
                  >
                    <UserRound aria-hidden="true" className="h-8 w-8" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    Linksy member
                  </p>
                  <h1 className="mt-1 truncate text-xl font-semibold text-slate-900">
                    {profile.username}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{profile.email}</span>
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                  {profile.bio}
                </p>
              )}
            </header>

            <section
              aria-label={`Chat with ${profile.username}`}
              className="flex min-h-[22rem] flex-col bg-slate-50/70"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
                <MessageCircle
                  aria-hidden="true"
                  className="h-5 w-5 text-indigo-600"
                />
                <h2 className="text-sm font-semibold text-slate-800">
                  Conversation
                </h2>
              </div>
              <div className="grid flex-1 place-items-center p-6 text-center">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                    <MessageCircle aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Your chat with {profile.username} will appear here.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Messaging isn’t available yet.
                  </p>
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
