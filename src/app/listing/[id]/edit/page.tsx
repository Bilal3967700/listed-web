import Link from "next/link";
import {
  notFound,
  redirect
} from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { EditListingForm } from "@/components/listing/EditListingForm";
import { getEditableListingById } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/listing";

export default async function EditListingPage({
  params
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Please log in to edit your listing."
      )}`
    );
  }

  const listing =
    await getEditableListingById(
      id,
      user.id
    );

  if (!listing) {
    notFound();
  }

  const { data: categories } =
    await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        parent_id,
        sort_order
      `)
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true
      });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/listing/${id}`}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--surface)]"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-black">
          Edit listing
        </h1>

        <div className="h-11 w-11" />
      </div>

      <EditListingForm
        listing={listing}
        categories={
          (categories || []) as Category[]
        }
        userId={user.id}
      />
    </div>
  );
}