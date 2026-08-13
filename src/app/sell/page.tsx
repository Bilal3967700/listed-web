import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateListingForm } from "@/components/listing/CreateListingForm";
import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/listing";

export default async function SellPage() {
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

      <CreateListingForm
        categories={(categories || []) as Category[]}
        userId={user.id}
      />
    </div>
  );
}