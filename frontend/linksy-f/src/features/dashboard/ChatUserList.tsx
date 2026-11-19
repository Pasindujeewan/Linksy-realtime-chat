import { ArrowUpRight, Search, UserRound, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useChatSocket } from "../../contexts/ChatSocketContext";
import { useUser } from "../../contexts/UserContext";
import {
  getOtherUsers,
  searchUsers as searchUsersByUsername,
} from "../../services/authService";
import type { DirectoryUser, UserDirectoryPage } from "../../types/auth";

function excludeCurrentUser(
  users: DirectoryUser[],
  currentUserId: string | undefined,
): DirectoryUser[] {
  return currentUserId
    ? users.filter((user) => user.id !== currentUserId)
    : users;
}

export default function ChatUserList() {
  const { onlineUserIds } = useChatSocket();
  const { user: currentUser } = useUser();
  const currentUserId = currentUser?.id;
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
        if (isCurrentRequest) {
          setSearchedUsers(excludeCurrentUser(result, currentUserId));
        }
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
  }, [currentUserId, searchQuery]);

  useEffect(() => {
    let isCurrentRequest = true;
    setHasLoaded(false);
    setError(null);

    getOtherUsers(1)
      .then((result: UserDirectoryPage) => {
        if (!isCurrentRequest) return;
        setUsers(excludeCurrentUser(result.users, currentUserId));
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
  }, [currentUserId, retryCount]);

  async function handleLoadMore() {
    if (nextPage === null || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await getOtherUsers(nextPage);
      setUsers((currentUsers) => {
        const remainingUsers = excludeCurrentUser(
          currentUsers,
          currentUserId,
        );
        const existingIds = new Set(remainingUsers.map((user) => user.id));
        return [
          ...remainingUsers,
          ...excludeCurrentUser(result.users, currentUserId).filter(
            (user) => !existingIds.has(user.id),
          ),
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
  const displayedUsers = excludeCurrentUser(
    isSearchActive ? searchedUsers : users,
    currentUserId,
  );
  const displayedError = isSearchActive ? searchError : error;
  const isLoadingUsers = isSearchActive ? isSearching : !hasLoaded;

  return (
    <section aria-labelledby="people-heading" className="people-panel">
      <div className="people-panel-heading">
        <div>
          <p className="people-panel-kicker">THE COMMUNITY</p>
          <h2 id="people-heading">People</h2>
          <p>Find a profile and start a conversation.</p>
        </div>
        <span className="people-heading-icon">
          <UsersRound aria-hidden="true" />
        </span>
      </div>
      <label className="people-search">
        <Search aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          maxLength={20}
          placeholder="Search by username"
          aria-label="Search users by username"
        />
      </label>

      {isLoadingUsers && (
        <p role="status" className="people-message">
          {isSearchActive ? "Searching users…" : "Loading people…"}
        </p>
      )}

      {displayedError && (
        <div className="people-message">
          <p role="alert" className="people-error">
            {displayedError}
          </p>
          {!isSearchActive && users.length === 0 && (
            <button
              type="button"
              onClick={handleRetry}
              className="people-secondary-button"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!isLoadingUsers && displayedUsers.length === 0 && !displayedError && (
        <div className="people-empty-state">
          <UsersRound aria-hidden="true" />
          <h3>
            {isSearchActive ? "No users found" : "No other profiles yet"}
          </h3>
          <p>
            {isSearchActive
              ? "Try a different username."
              : "Other Linksy members will appear here when they join."}
          </p>
        </div>
      )}

      {displayedUsers.length > 0 && (
        <>
          <ul className="people-list">
            {displayedUsers.map((user) => (
              <li key={user.id} className="people-list-item">
                <Link
                  to={`/users/${encodeURIComponent(user.id)}`}
                  aria-label={`View ${user.username}'s profile`}
                  className="people-user-link"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="people-user-avatar"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="people-user-avatar people-user-avatar-fallback"
                    >
                      <UserRound />
                    </span>
                  )}
                  <span className="people-user-name">{user.username}</span>
                  {onlineUserIds.has(user.id) && (
                    <span className="people-online">
                      <span aria-hidden="true" className="people-online-dot" />
                      Online
                    </span>
                  )}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="people-user-arrow"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {!isSearchActive && nextPage !== null && (
            <div className="people-load-more">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="people-secondary-button"
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
