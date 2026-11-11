import { Search, UserRound, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  getOtherUsers,
  searchUsers as searchUsersByUsername,
} from "../../services/authService";
import type { DirectoryUser, UserDirectoryPage } from "../../types/auth";

export default function ChatUserList() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<DirectoryUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    const username = searchQuery.trim();
    if (!username) {
      setSearchedUsers([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let isCurrentRequest = true;
    setSearchedUsers([]);
    setIsSearching(true);
    setSearchError(null);

    searchUsersByUsername(username)
      .then((result) => {
        if (isCurrentRequest) setSearchedUsers(result);
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setSearchError(
          requestError instanceof Error
            ? requestError.message
            : "We couldn't search for users.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsSearching(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [searchQuery]);

  useEffect(() => {
    let isCurrentRequest = true;
    setHasLoaded(false);
    setError(null);

    getOtherUsers(1)
      .then((result: UserDirectoryPage) => {
        if (!isCurrentRequest) return;
        setUsers(result.users);
        setNextPage(result.pagination.nextPage);
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "We couldn't load the people directory.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setHasLoaded(true);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  async function handleLoadMore() {
    if (nextPage === null || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await getOtherUsers(nextPage);
      setUsers((currentUsers) => {
        const existingIds = new Set(currentUsers.map((user) => user.id));
        return [
          ...currentUsers,
          ...result.users.filter((user) => !existingIds.has(user.id)),
        ];
      });
      setNextPage(result.pagination.nextPage);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't load more profiles.",
      );
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }

  function handleRetry() {
    setUsers([]);
    setNextPage(null);
    setHasLoaded(false);
    setError(null);
    setRetryCount((currentCount) => currentCount + 1);
  }

  const isSearchActive = searchQuery.trim().length > 0;
  const displayedUsers = isSearchActive ? searchedUsers : users;
  const displayedError = isSearchActive ? searchError : error;
  const isLoadingUsers = isSearchActive ? isSearching : !hasLoaded;

  return (
    <section
      aria-labelledby="people-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="people-heading"
            className="text-lg font-semibold text-slate-900"
          >
            People to chat with
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Find someone and start a conversation.
          </p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <UsersRound aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <label className="relative mt-6 block">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          maxLength={20}
          placeholder="Search by username"
          aria-label="Search users by username"
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </label>

      {isLoadingUsers && (
        <p role="status" className="mt-8 text-center text-sm text-slate-500">
          {isSearchActive ? "Searching users…" : "Loading people…"}
        </p>
      )}

      {displayedError && (
        <div className="mt-6 text-center">
          <p role="alert" className="text-sm text-rose-600">{displayedError}</p>
          {!isSearchActive && users.length === 0 && (
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!isLoadingUsers && displayedUsers.length === 0 && !displayedError && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <UsersRound
            aria-hidden="true"
            className="mx-auto h-8 w-8 text-slate-400"
          />
          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            {isSearchActive ? "No users found" : "No other profiles yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {isSearchActive
              ? "Try a different username."
              : "Other Linksy members will appear here when they join."}
          </p>
        </div>
      )}

      {displayedUsers.length > 0 && (
        <>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedUsers.map((user) => (
              <li
                key={user.id}
                className="rounded-xl border border-slate-200 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <Link
                  to={`/users/${encodeURIComponent(user.id)}`}
                  aria-label={`View ${user.username}'s profile`}
                  className="flex items-center gap-3 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-500"
                    >
                      <UserRound className="h-6 w-6" />
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {user.username}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {!isSearchActive && nextPage !== null && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMore ? "Loading…" : error ? "Try again" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
