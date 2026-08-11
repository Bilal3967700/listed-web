import Image from "next/image";
import { redirect } from "next/navigation";
import { logout, updateProfile } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Listed user";

  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-soft)] text-2xl font-black">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Account
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
              {displayName}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {user.email}
            </p>
          </div>
        </div>

        {params.message && (
          <p className="mt-5 rounded-2xl bg-[var(--surface-soft)] p-3 text-sm font-semibold">
            {params.message}
          </p>
        )}

        <form action={updateProfile} className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold">Full name</label>
              <input
                name="fullName"
                type="text"
                defaultValue={profile?.full_name || displayName}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Username</label>
              <input
                name="username"
                type="text"
                defaultValue={profile?.username || ""}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
                placeholder="nethul.archive"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Phone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={profile?.phone || ""}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
                placeholder="+94..."
              />
            </div>

            <div>
              <label className="text-sm font-bold">Location label</label>
              <input
                name="locationLabel"
                type="text"
                defaultValue={profile?.location_label || ""}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
                placeholder="Colombo, Sri Lanka"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">Bio</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio || ""}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none"
              placeholder="Tell buyers a little about your style, shop or collection."
            />
          </div>

          <button className="h-12 rounded-2xl bg-[var(--text)] px-6 font-bold text-[var(--surface)]">
            Save profile
          </button>
        </form>

        <form action={logout} className="mt-8 border-t border-[var(--border)] pt-6">
          <button className="h-12 rounded-2xl border border-[var(--border)] px-6 font-bold">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}