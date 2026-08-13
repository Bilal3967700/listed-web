import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ImagePlus, Upload } from "lucide-react";
import { createListing } from "@/actions/listings";
import { CategoryPicker } from "@/components/listing/CategoryPicker";
import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/listing";

const conditions = [
  "New with tags",
  "New without tags",
  "Excellent",
  "Very Good",
  "Good",
  "Fair"
];

export default async function SellPage({
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
    redirect("/login?message=Please log in to create a listing");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile?.username) {
    redirect("/account?message=Please choose a username before creating a listing");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--surface)]"
        >
          <ArrowLeft size={23} />
        </Link>

        <h1 className="text-xl font-black">Sell an item</h1>

        <div className="h-11 w-11" />
      </div>

      {params.message && (
        <p className="mb-4 rounded-2xl bg-[var(--surface)] p-4 text-sm font-bold text-[var(--danger)]">
          {params.message}
        </p>
      )}

      <form action={createListing} className="space-y-4">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-2xl font-black">Photos</h2>

          <label className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <ImagePlus size={24} />
            </div>
            <p className="text-lg font-black">Upload photos</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Add at least one clear photo. The first photo becomes the cover.
            </p>
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              required
              className="hidden"
            />
          </label>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-2xl font-black">About your item</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-bold text-[var(--text-muted)]">
                Title
              </label>
              <input
                name="title"
                type="text"
                required
                maxLength={80}
                placeholder="Tell buyers what you're selling"
                className="mt-2 w-full border-b border-[var(--border)] bg-transparent py-3 text-lg outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--text-muted)]">
                Description
              </label>
              <textarea
                name="description"
                required
                rows={5}
                placeholder="Tell buyers more about it"
                className="mt-2 w-full resize-none border-b border-[var(--border)] bg-transparent py-3 text-lg outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-2xl font-black">Item details</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-bold text-[var(--text-muted)]">
                Category
              </label>
              <div className="mt-2">
                <CategoryPicker categories={(categories || []) as Category[]} />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--text-muted)]">
                Brand
              </label>
              <input
                name="brand"
                type="text"
                placeholder="Nike, Apple, Pokémon, Levi's..."
                className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--text-muted)]">
                Condition
              </label>

              <select
                name="condition"
                required
                className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 font-bold outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose condition
                </option>

                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--text-muted)]">
                Size
              </label>
              <input
                name="size"
                type="text"
                placeholder="M, UK 9, W32, One size..."
                className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-2xl font-black">Pricing</h2>

          <div className="mt-5">
            <label className="text-sm font-bold text-[var(--text-muted)]">
              Price
            </label>
            <div className="mt-2 flex h-14 items-center rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4">
              <span className="mr-2 font-black">LKR</span>
              <input
                name="priceLkr"
                type="number"
                min="1"
                required
                placeholder="0"
                className="w-full bg-transparent text-lg font-bold outline-none"
              />
            </div>
          </div>
        </section>

        <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text)] font-black text-[var(--surface)]">
          <Upload size={18} />
          Upload
        </button>

        <p className="pb-4 text-center text-xs text-[var(--text-muted)]">
          By uploading, you confirm this item is allowed on Listed.lk.
        </p>
      </form>
    </div>
  );
}