import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import ChatUserList from "./ChatUserList";
import RecentChats from "./RecentChats";
import { useUser } from "../../contexts/UserContext";
import { useToast } from "../../contexts/ToastContext";
import "./DashboardPage.css";

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
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/dashboard" className="dashboard-brand">
            <img
              src="/linksy-logo.svg"
              alt=""
              aria-hidden="true"
              className="dashboard-brand-mark"
            />
            <span>Linksy</span>
          </Link>
          <div className="dashboard-header-actions">
            <div className="dashboard-header-identity">
              <span className="dashboard-header-name">{displayName}</span>
              <span className="dashboard-header-caption">Your account</span>
            </div>
            <Link
              to="/profile"
              aria-label="View your profile"
              title="View your profile"
              className="dashboard-avatar-link"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="dashboard-header-avatar"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="dashboard-header-avatar dashboard-avatar-fallback"
                >
                  <UserRound />
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="dashboard-logout"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-intro" aria-labelledby="dashboard-title">
          <p className="dashboard-eyebrow">YOUR LINKSY SPACE</p>
          <h1 id="dashboard-title">Good to see you, {displayName}.</h1>
          <p>
            Pick up a conversation or find someone new to chat with.
          </p>
        </section>

        {isLoadingProfile && (
          <p role="status" className="dashboard-loading">
            Loading your profile…
          </p>
        )}

        <div className="dashboard-layout">
          <div className="dashboard-main-content">
            <RecentChats />
            <ChatUserList />
          </div>
          <aside
            className="dashboard-profile-card"
            aria-labelledby="account-heading"
          >
            <p className="dashboard-card-kicker">YOUR ACCOUNT</p>
            <div className="dashboard-profile-summary">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="dashboard-profile-avatar"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="dashboard-profile-avatar dashboard-profile-avatar-fallback"
                >
                  <UserRound />
                </span>
              )}
              <div className="dashboard-profile-copy">
                <h2 id="account-heading">{displayName}</h2>
                <p>Linksy member</p>
              </div>
            </div>
            <Link to="/profile" className="dashboard-profile-link">
              Edit your profile
              <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
