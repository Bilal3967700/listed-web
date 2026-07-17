import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight">
          You are logged in
        </h1>

        <div className="mt-6 rounded-3xl bg-[var(--surface-soft)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Email</p>
          <p className="mt-1 font-bold">{user.email}</p>
        </div>

        <form action={logout} className="mt-6">
          <button className="h-12 rounded-2xl border border-[var(--border)] px-6 font-bold">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}