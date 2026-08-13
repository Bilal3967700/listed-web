import Image from "next/image";
import Link from "next/link";
import { ListingCard } from "@/components/listing/ListingCard";
import { getListingsBySellerId } from "@/lib/listings";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  MailCheck,
  MapPin,
  MoreHorizontal,
  Star
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function formatJoinedDate(dateString?: string) {
  if (!dateString) return "Recently joined";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date(dateString));
}

export default async function PublicProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const query = await searchParams;
  const activeTab = query.tab || "listings";

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const isOwnProfile = user?.id === profile.id;
  const displayName = profile.full_name || profile.username || "Listed user";
  const avatarUrl = profile.avatar_url || "";
  const sellerListings = await getListingsBySellerId(profile.id);
  const tabs = [
    { id: "listings", label: "Listings" },
    { id: "reviews", label: "Reviews" },
    { id: "about", label: "About" }
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-[73px] z-30 -mx-4 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 backdrop-blur md:top-[81px] md:-mx-6 md:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface)]"
          >
            <ArrowLeft size={22} />
          </Link>

          <p className="text-lg font-black">@{profile.username}</p>

          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--surface)]">
            <MoreHorizontal size={22} />
          </button>
        </div>

        <div className="grid grid-cols-3">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={`/u/${profile.username}?tab=${tab.id}`}
                className={[
                  "border-b-2 py-3 text-center text-sm font-bold",
                  active
                    ? "border-[var(--text)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)]"
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="h-36 bg-[var(--surface-soft)]" />

        <div className="px-5 pb-6">
          <div className="-mt-12 flex items-end justify-between gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--surface)] bg-[var(--surface-soft)] text-4xl font-black">
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

            {isOwnProfile && (
              <Link
                href="/account"
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold"
              >
                Edit profile
              </Link>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">
                {displayName}
              </h1>

              {profile.is_verified_seller && (
                <BadgeCheck size={22} className="text-[var(--success)]" />
              )}
            </div>

            <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
              @{profile.username}
            </p>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <MailCheck size={18} />
              <span>Email verified</span>
            </div>

            {profile.location_label && (
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{profile.location_label}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>Member since {formatJoinedDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </section>

    {activeTab === "listings" && (
        <section className="mt-6">
            {sellerListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                {sellerListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
            ) : (
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                <p className="text-lg font-black">No listings yet</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                When this seller lists items, they’ll appear here in a clean
                Depop-style grid.
                </p>

                {isOwnProfile && (
                <Link
                    href="/sell"
                    className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--text)] px-6 font-bold text-[var(--surface)]"
                >
                    List your first item
                </Link>
                )}
            </div>
            )}
        </section>
        )}

      {activeTab === "reviews" && (
        <section className="mt-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8">
            <div className="text-center">
              <p className="text-6xl font-black">0.0</p>

              <div className="mt-3 flex justify-center gap-1 text-[var(--text-muted)]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={22} />
                ))}
              </div>

              <p className="mt-3 text-sm text-[var(--text-muted)]">
                No reviews yet
              </p>
            </div>

            <div className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold">Member reviews</span>
                <span className="text-[var(--text-muted)]">0</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold">Automatic reviews</span>
                <span className="text-[var(--text-muted)]">0</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "about" && (
        <section className="mt-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-2xl font-black">About</h2>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Bio
                </p>
                <p className="mt-2 leading-7 text-[var(--text)]">
                  {profile.bio || "This seller hasn’t added a bio yet."}
                </p>
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Verified info
                </p>

                <div className="mt-3 flex items-center gap-2 text-[var(--text-muted)]">
                  <MailCheck size={18} />
                  <span>Email</span>
                </div>
              </div>

              {profile.location_label && (
                <div className="border-t border-[var(--border)] pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Location
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[var(--text-muted)]">
                    <MapPin size={18} />
                    <span>{profile.location_label}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}