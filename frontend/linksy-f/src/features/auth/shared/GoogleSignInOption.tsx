interface GoogleSignInOptionProps {
  disabled?: boolean;
  isSigningIn: boolean;
  onClick: () => void;
}

export default function GoogleSignInOption({
  disabled = false,
  isSigningIn,
  onClick,
}: GoogleSignInOptionProps) {
  return (
    <div className="mb-6">
      <button
        type="button"
        disabled={disabled || isSigningIn}
        onClick={onClick}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            fill="#4285F4"
            d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.4Z"
          />
          <path
            fill="#34A853"
            d="M24 44c5.4 0 10-1.8 13.3-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.6 1.9-5.1 0-9.4-3.4-11-8H6.1v5.3A20 20 0 0 0 24 44Z"
          />
          <path
            fill="#FBBC05"
            d="M13 27.8a12 12 0 0 1 0-7.6v-5.3H6.1a20 20 0 0 0 0 18.2l6.9-5.3Z"
          />
          <path
            fill="#EA4335"
            d="M24 12.2c2.9 0 5.4 1 7.4 3l5.9-5.9C33.9 6 29.4 4 24 4A20 20 0 0 0 6.1 14.9L13 20.2c1.6-4.6 5.9-8 11-8Z"
          />
        </svg>
        {isSigningIn ? "Connecting to Google…" : "Continue with Google"}
      </button>
      <div className="mt-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
