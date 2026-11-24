import { ArrowLeft, Mail, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import ConversationChat from "../chat/components/ConversationChat";
import { useUser } from "../../contexts/UserContext";
import { getOtherUserProfile } from "../../services/authService";
import type { PublicUserProfile } from "../../types/auth";
import "./OtherUserProfilePage.css";

export default function OtherUserProfilePage() {
  const { user } = useUser();
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
    <main className="other-profile-shell">
      <header className="other-profile-topbar">
        <div className="other-profile-topbar-inner">
          <Link to="/dashboard" className="other-profile-brand">
            <img src="/linksy-logo.svg" alt="" aria-hidden="true" />
            <span>Linksy</span>
          </Link>
          <Link to="/dashboard" className="other-profile-back">
            <ArrowLeft aria-hidden="true" />
            <span>Back to dashboard</span>
          </Link>
        </div>
      </header>

      <div className="other-profile-content">
        {isLoading && (
          <p role="status" className="other-profile-loading">
            Loading profile…
          </p>
        )}

        {error && !isLoading && (
          <section className="other-profile-error-card">
            <p role="alert">
              {error}
            </p>
            {userId && (
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="other-profile-retry"
              >
                Try again
              </button>
            )}
          </section>
        )}

        {profile && (
          <section
            aria-label={`Profile and chat with ${profile.username}`}
            className="other-profile-card"
          >
            <header className="other-profile-header">
              <div className="other-profile-identity">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.username}'s profile`}
                    className="other-profile-avatar"
                  />
                ) : (
                  <span
                    role="img"
                    aria-label={`${profile.username}'s profile`}
                    className="other-profile-avatar other-profile-avatar-fallback"
                  >
                    <UserRound aria-hidden="true" />
                  </span>
                )}
                <div className="other-profile-details">
                  <p className="other-profile-kicker">
                    Linksy member
                  </p>
                  <h1>
                    {profile.username}
                  </h1>
                  <p className="other-profile-email">
                    <Mail aria-hidden="true" />
                    <span>{profile.email}</span>
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="other-profile-bio">
                  {profile.bio}
                </p>
              )}
            </header>

            <section
              aria-label={`Chat with ${profile.username}`}
              className="other-chat-section"
            >
              <div className="other-chat-heading">
                <span className="other-chat-heading-icon">
                  <MessageCircle aria-hidden="true" />
                </span>
                <div>
                  <h2>Conversation</h2>
                  <p>Messages with {profile.username}</p>
                </div>
              </div>
              <ConversationChat
                recipientId={profile.id}
                currentUserId={user?.id ?? ""}
                recipientName={profile.username}
              />
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
