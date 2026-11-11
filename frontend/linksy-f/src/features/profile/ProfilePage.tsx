import { ArrowLeft, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { UpdateUserProfilePayload } from "../../types/auth";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../contexts/ToastContext";

export default function ProfilePage() {
  const { user, isLoadingProfile, updateUserProfile } = useUser();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<UpdateUserProfilePayload>({
    username: "",
    email: "",
    bio: "",
  });

  if (!user) return null;

  function handleEdit() {
    setDraft({
      username: user.username,
      email: user.email ?? "",
      bio: user.bio ?? "",
    });
    setIsEditing(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile(draft);
      setIsEditing(false);
      toast.success("Your profile has been updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't update your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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

          {isEditing ? (
            <form onSubmit={handleSubmit} className="pt-6">
              <div className="space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                  Username
                  <input
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                    autoComplete="username"
                    value={draft.username}
                    onChange={(event) =>
                      setDraft({ ...draft, username: event.target.value })
                    }
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    value={draft.email}
                    onChange={(event) =>
                      setDraft({ ...draft, email: event.target.value })
                    }
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  About
                  <textarea
                    maxLength={160}
                    rows={4}
                    value={draft.bio}
                    onChange={(event) =>
                      setDraft({ ...draft, bio: event.target.value })
                    }
                    className="mt-1.5 block w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Up to 160 characters.
                  </span>
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isLoadingProfile}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <dl aria-label="Profile details" className="divide-y divide-slate-100">
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
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={isLoadingProfile}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit profile
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
