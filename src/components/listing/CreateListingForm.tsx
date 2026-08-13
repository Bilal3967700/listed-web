"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types/listing";
import { CategoryPicker } from "@/components/listing/CategoryPicker";

const conditions = [
  "New with tags",
  "New without tags",
  "Excellent",
  "Very Good",
  "Good",
  "Fair"
];

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateListingForm({
  categories,
  userId
}: {
  categories: Category[];
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file)
      })),
    [files]
  );

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const imageFiles = Array.from(selectedFiles).filter((file) =>
      file.type.startsWith("image/")
    );

    const tooLarge = imageFiles.find((file) => file.size > 8 * 1024 * 1024);

    if (tooLarge) {
      setMessage(
        "One of your photos is too large. Please upload images under 8MB each."
      );
      return;
    }

    setFiles(imageFiles.slice(0, 8));
    setMessage(`${imageFiles.slice(0, 8).length} photo(s) selected`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isUploading) return;

    setMessage("");
    setUploadedCount(0);
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const categoryId = String(formData.get("categoryId") || "").trim();
    const brand = String(formData.get("brand") || "").trim();
    const condition = String(formData.get("condition") || "").trim();
    const size = String(formData.get("size") || "").trim();
    const priceLkr = Number(formData.get("priceLkr") || 0);

    if (!title || !description || !categoryId || !condition || !priceLkr) {
      setMessage("Please complete all required fields.");
      setIsUploading(false);
      return;
    }

    if (files.length < 1) {
      setMessage("Please upload at least one photo.");
      setIsUploading(false);
      return;
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        seller_id: userId,
        category_id: categoryId,
        title,
        brand: brand || null,
        description,
        price_lkr: priceLkr,
        condition,
        size: size || null,
        status: "active",
        published_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      setMessage(listingError?.message || "Could not create listing.");
      setIsUploading(false);
      return;
    }

    let successfulUploads = 0;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const safeName = slugifyFileName(file.name || `photo-${index}.jpg`);
      const fileName = `${Date.now()}-${index}-${safeName}`;
      const storagePath = `${userId}/${listing.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg"
        });

      if (uploadError) {
        setMessage(uploadError.message);
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
        is_cover: successfulUploads === 0
      });

      if (photoError) {
        setMessage(photoError.message);
        continue;
      }

      successfulUploads++;
      setUploadedCount(successfulUploads);
    }

    if (successfulUploads === 0) {
      await supabase.from("listings").delete().eq("id", listing.id);
      setMessage("Images could not be uploaded. Please try again.");
      setIsUploading(false);
      return;
    }

    setMessage("Listing uploaded successfully.");
    router.push(`/listing/${listing.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p className="rounded-2xl bg-[var(--surface)] p-4 text-sm font-bold">
          {message}
        </p>
      )}

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">Photos</h2>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div
                key={`${preview.name}-${index}`}
                className="relative overflow-hidden rounded-2xl bg-[var(--surface-soft)]"
              >
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="aspect-square w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-black">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <label className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
            <ImagePlus size={24} />
          </div>
          <p className="text-lg font-black">
            {files.length > 0 ? "Change photos" : "Upload photos"}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Add up to 8 photos. The first photo becomes the cover.
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              setUploadedCount(0);
              setMessage("");
            }}
            className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]"
          >
            <X size={16} />
            Remove selected photos
          </button>
        )}
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
              <CategoryPicker categories={categories} />
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

      {isUploading && (
        <p className="rounded-2xl bg-[var(--surface)] p-4 text-center text-sm font-bold">
          Uploading {uploadedCount} of {files.length} photo(s)...
        </p>
      )}

      <button
        disabled={isUploading}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text)] font-black text-[var(--surface)] disabled:opacity-60"
      >
        <Upload size={18} />
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      <p className="pb-4 text-center text-xs text-[var(--text-muted)]">
        By uploading, you confirm this item is allowed on Listed.lk.
      </p>
    </form>
  );
}