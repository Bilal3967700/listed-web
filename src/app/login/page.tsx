import Link from "next/link";
import { Apple } from "lucide-react";
import { login, loginWithApple, loginWithGoogle } from "@/actions/auth";

function GoogleIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-black">
      G
    </span>
  );
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Log in to Listed.lk
        </h1>

        <div className="mt-6 grid gap-3">
          <form action={loginWithGoogle}>
            <button className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] font-bold">
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <form action={loginWithApple}>
            <button className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] font-bold">
              <Apple size={20} />
              Continue with Apple
            </button>
          </form>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label className="text-sm font-bold">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-bold">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
              placeholder="Your password"
            />
          </div>

          {params.message && (
            <p className="rounded-2xl bg-[var(--surface-soft)] p-3 text-sm font-semibold text-[var(--danger)]">
              {params.message}
            </p>
          )}

          <button className="h-12 w-full rounded-2xl bg-[var(--text)] font-bold text-[var(--surface)]">
            Log in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
          New to Listed.lk?{" "}
          <Link href="/signup" className="font-bold text-[var(--text)]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}