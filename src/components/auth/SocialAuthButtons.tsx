import { loginWithApple, loginWithGoogle } from "@/actions/auth";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.2 3-7.1z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.6l-3.2-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.5C4.8 19.7 8.2 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.6H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.4l3.3-2.5z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 3 14.7 2 12 2 8.2 2 4.8 4.3 3.1 7.6l3.3 2.5C7.2 7.8 9.4 6 12 6z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 13.1c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 6.9 1.1 9.1.8 1.1 1.7 2.4 2.9 2.3 1.1 0 1.6-.7 2.9-.7 1.4 0 1.8.7 3 .7 1.2 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6 0-.1-2.8-1.1-2.8-3.5zM14.2 6.4c.6-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.7-1.3z"
      />
    </svg>
  );
}

export function SocialAuthButtons({ showApple = false }: { showApple?: boolean }) {
  return (
    <div className="grid gap-3">
      <form action={loginWithGoogle}>
        <button className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] font-bold">
          <GoogleLogo />
          Continue with Google
        </button>
      </form>

      {showApple ? (
        <form action={loginWithApple}>
          <button className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] font-bold">
            <AppleLogo />
            Continue with Apple
          </button>
        </form>
      ) : (
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] font-bold opacity-50"
        >
          <AppleLogo />
          Continue with Apple
        </button>
      )}
    </div>
  );
}