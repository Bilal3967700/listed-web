"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createListing(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please log in to create a listing");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("createListing profile error:", profileError.message);
  }

  if (!profile?.username) {
    redirect("/account?message=Please choose a username before creating a listing");
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const condition = String(formData.get("condition") || "").trim();
  const size = String(formData.get("size") || "").trim();
  const price = Number(formData.get("priceLkr") || 0);

  const photos = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (!title || !description || !categoryId || !condition || !price) {
    redirect("/sell?message=Please complete all required fields");
  }

  if (photos.length < 1) {
    redirect("/sell?message=Please upload at least one photo");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      category_id: categoryId,
      title,
      brand: brand || null,
      description,
      price_lkr: price,
      condition,
      size: size || null,
      status: "active",
      published_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (listingError || !listing) {
    console.error("createListing listing insert error:", listingError?.message);
    redirect(
      `/sell?message=${encodeURIComponent(
        listingError?.message || "Could not create listing"
      )}`
    );
  }

  let uploadedPhotoCount = 0;

  for (let index = 0; index < photos.length; index++) {
    const photo = photos[index];
    const fileExt = photo.name.split(".").pop() || "jpg";
    const safeName = slugifyFileName(photo.name || `photo.${fileExt}`);
    const fileName = `${Date.now()}-${index}-${safeName}`;
    const storagePath = `${user.id}/${listing.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(storagePath, photo, {
        cacheControl: "3600",
        upsert: false,
        contentType: photo.type || "image/jpeg"
      });

    if (uploadError) {
      console.error("createListing image upload error:", uploadError.message);
      continue;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("listing-images").getPublicUrl(storagePath);

    const { error: photoError } = await supabase.from("listing_photos").insert({
      listing_id: listing.id,
      image_url: publicUrl,
      storage_path: storagePath,
      sort_order: index,
      is_cover: uploadedPhotoCount === 0
    });

    if (photoError) {
      console.error("createListing photo insert error:", photoError.message);
      continue;
    }

    uploadedPhotoCount++;
  }

  if (uploadedPhotoCount === 0) {
    await supabase.from("listings").delete().eq("id", listing.id);
    redirect("/sell?message=Images could not be uploaded. Please try again.");
  }

  redirect(`/listing/${listing.id}`);
}