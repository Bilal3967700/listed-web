"use client";

import {
  ImagePlus,
  Save,
  X
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import { useRouter } from "next/navigation";
import { CategoryPicker } from "@/components/listing/CategoryPicker";
import { createClient } from "@/lib/supabase/client";

import {
  Category,
  EditableListing,
  ListingPhoto
} from "@/types/listing";

const conditions = [
  "New with tags",
  "New without tags",
  "Excellent",
  "Very Good",
  "Good",
  "Fair"
];

type ExistingPhotoItem = {
  kind: "existing";
  key: string;
  photo: ListingPhoto;
};

type NewPhotoItem = {
  kind: "new";
  key: string;
  file: File;
  previewUrl: string;
};

type PhotoItem =
  | ExistingPhotoItem
  | NewPhotoItem;

function slugifyFileName(
  name: string
) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function EditListingForm({
  listing,
  categories,
  userId
}: {
  listing: EditableListing;
  categories: Category[];
  userId: string;
}) {
  const router = useRouter();

  const initialItems = useMemo<
    ExistingPhotoItem[]
  >(
    () =>
      listing.photos.map((photo) => ({
        kind: "existing",
        key: `existing-${photo.id}`,
        photo
      })),
    [listing.photos]
  );

  const [photoItems, setPhotoItems] =
    useState<PhotoItem[]>(
      initialItems
    );

  const [message, setMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    return () => {
      photoItems.forEach((item) => {
        if (item.kind === "new") {
          URL.revokeObjectURL(
            item.previewUrl
          );
        }
      });
    };
  }, [photoItems]);

  function addFiles(
    selectedFiles: FileList | null
  ) {
    if (!selectedFiles) return;

    const incomingFiles =
      Array.from(selectedFiles);

    const invalidFile =
      incomingFiles.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          )
      );

    if (invalidFile) {
      setMessage(
        "Only image files can be uploaded."
      );
      return;
    }

    const tooLarge =
      incomingFiles.find(
        (file) =>
          file.size >
          8 * 1024 * 1024
      );

    if (tooLarge) {
      setMessage(
        `${tooLarge.name} is larger than 8MB.`
      );
      return;
    }

    const available =
      8 - photoItems.length;

    if (available <= 0) {
      setMessage(
        "A listing can contain up to 8 photos."
      );
      return;
    }

    const additions =
      incomingFiles
        .slice(0, available)
        .map((file) => ({
          kind: "new" as const,
          key: `new-${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl:
            URL.createObjectURL(file)
        }));

    setPhotoItems((current) => [
      ...current,
      ...additions
    ]);

    setMessage(
      `${
        photoItems.length +
        additions.length
      } photo(s) selected.`
    );
  }

  function removePhoto(index: number) {
    setPhotoItems((current) => {
      const item = current[index];

      if (item?.kind === "new") {
        URL.revokeObjectURL(
          item.previewUrl
        );
      }

      return current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  }

  function makeCover(index: number) {
    setPhotoItems((current) => {
      const next = [...current];
      const [selected] = next.splice(
        index,
        1
      );

      next.unshift(selected);
      return next;
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) return;

    if (photoItems.length < 1) {
      setMessage(
        "A listing must contain at least one photo."
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    const formData = new FormData(
      event.currentTarget
    );

    const title = String(
      formData.get("title") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const categoryId = String(
      formData.get("categoryId") || ""
    ).trim();

    const brand = String(
      formData.get("brand") || ""
    ).trim();

    const condition = String(
      formData.get("condition") || ""
    ).trim();

    const size = String(
      formData.get("size") || ""
    ).trim();

    const priceLkr = Number(
      formData.get("priceLkr") || 0
    );

    if (
      !title ||
      !description ||
      !categoryId ||
      !condition ||
      !priceLkr
    ) {
      setMessage(
        "Please complete all required fields."
      );
      setIsSaving(false);
      return;
    }

    const supabase = createClient();

    const { error: listingError } =
      await supabase
        .from("listings")
        .update({
          title,
          description,
          category_id: categoryId,
          brand: brand || null,
          condition,
          size: size || null,
          price_lkr: priceLkr,
          updated_at:
            new Date().toISOString()
        })
        .eq("id", listing.id)
        .eq("seller_id", userId);

    if (listingError) {
      setMessage(listingError.message);
      setIsSaving(false);
      return;
    }

    const keptExistingIds =
      photoItems
        .filter(
          (
            item
          ): item is ExistingPhotoItem =>
            item.kind === "existing"
        )
        .map((item) => item.photo.id);

    const removedPhotos =
      listing.photos.filter(
        (photo) =>
          !keptExistingIds.includes(
            photo.id
          )
      );

    const resolvedPhotoIds =
      new Map<string, string>();

    photoItems.forEach((item) => {
      if (item.kind === "existing") {
        resolvedPhotoIds.set(
          item.key,
          item.photo.id
        );
      }
    });

    for (
      let index = 0;
      index < photoItems.length;
      index++
    ) {
      const item = photoItems[index];

      if (item.kind !== "new") {
        continue;
      }

      const safeName =
        slugifyFileName(
          item.file.name ||
            `photo-${index}.jpg`
        );

      const fileName =
        `${Date.now()}-${index}-${safeName}`;

      const storagePath =
        `${userId}/${listing.id}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("listing-images")
          .upload(
            storagePath,
            item.file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                item.file.type ||
                "image/jpeg"
            }
          );

      if (uploadError) {
        setMessage(
          uploadError.message
        );
        setIsSaving(false);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage
        .from("listing-images")
        .getPublicUrl(storagePath);

      const {
        data: insertedPhoto,
        error: photoError
      } = await supabase
        .from("listing_photos")
        .insert({
          listing_id: listing.id,
          image_url: publicUrl,
          storage_path: storagePath,
          sort_order: index,
          is_cover: false
        })
        .select("id")
        .single();

      if (
        photoError ||
        !insertedPhoto
      ) {
        await supabase.storage
          .from("listing-images")
          .remove([storagePath]);

        setMessage(
          photoError?.message ||
            "Could not save the new photo."
        );

        setIsSaving(false);
        return;
      }

      resolvedPhotoIds.set(
        item.key,
        insertedPhoto.id
      );
    }

    if (removedPhotos.length > 0) {
      const removedIds =
        removedPhotos.map(
          (photo) => photo.id
        );

      const { error: deletePhotoError } =
        await supabase
          .from("listing_photos")
          .delete()
          .in("id", removedIds);

      if (deletePhotoError) {
        setMessage(
          deletePhotoError.message
        );
        setIsSaving(false);
        return;
      }

      const removedPaths =
        removedPhotos
          .map(
            (photo) =>
              photo.storage_path
          )
          .filter(
            (
              path
            ): path is string =>
              Boolean(path)
          );

      if (removedPaths.length > 0) {
        const { error: storageError } =
          await supabase.storage
            .from("listing-images")
            .remove(removedPaths);

        if (storageError) {
          console.error(
            "Removed photo cleanup error:",
            storageError.message
          );
        }
      }
    }

    const { error: resetCoverError } =
      await supabase
        .from("listing_photos")
        .update({
          is_cover: false
        })
        .eq(
          "listing_id",
          listing.id
        );

    if (resetCoverError) {
      setMessage(
        resetCoverError.message
      );
      setIsSaving(false);
      return;
    }

    for (
      let index = 0;
      index < photoItems.length;
      index++
    ) {
      const item =
        photoItems[index];

      const photoId =
        resolvedPhotoIds.get(item.key);

      if (!photoId) continue;

      const { error: orderError } =
        await supabase
          .from("listing_photos")
          .update({
            sort_order: index,
            is_cover: index === 0
          })
          .eq("id", photoId);

      if (orderError) {
        setMessage(
          orderError.message
        );
        setIsSaving(false);
        return;
      }
    }

    router.push(
      `/listing/${listing.id}`
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {message && (
        <p className="rounded-2xl bg-[var(--surface)] p-4 text-sm font-bold">
          {message}
        </p>
      )}

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          Photos
        </h2>

        <p className="mt-1 text-sm text-[var(--text-muted)]">
          The first photo is the cover.
          Add up to eight photos.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photoItems.map(
            (item, index) => {
              const imageUrl =
                item.kind === "existing"
                  ? item.photo.image_url
                  : item.previewUrl;

              return (
                <div
                  key={item.key}
                  className="relative overflow-hidden rounded-2xl bg-[var(--surface-soft)]"
                >
                  <img
                    src={imageUrl}
                    alt={`Listing photo ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removePhoto(index)
                    }
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X size={15} />
                  </button>

                  {index === 0 ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] font-black">
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        makeCover(index)
                      }
                      className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black text-white"
                    >
                      Make cover
                    </button>
                  )}
                </div>
              );
            }
          )}
        </div>

        {photoItems.length < 8 && (
          <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center">
            <ImagePlus size={24} />

            <p className="mt-3 font-black">
              Add more photos
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              multiple
              onChange={(event) => {
                addFiles(
                  event.target.files
                );

                event.currentTarget.value =
                  "";
              }}
              className="hidden"
            />
          </label>
        )}
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          About your item
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-bold">
              Title
            </label>

            <input
              name="title"
              required
              maxLength={80}
              defaultValue={
                listing.title
              }
              className="mt-2 w-full border-b border-[var(--border)] bg-transparent py-3 text-lg outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold">
              Description
            </label>

            <textarea
              name="description"
              required
              rows={5}
              defaultValue={
                listing.description
              }
              className="mt-2 w-full resize-none border-b border-[var(--border)] bg-transparent py-3 text-lg outline-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          Item details
        </h2>

        <div className="mt-5 space-y-5">
          <CategoryPicker
            categories={categories}
            initialCategoryId={
              listing.categoryId ||
              undefined
            }
          />

          <div>
            <label className="text-sm font-bold">
              Brand
            </label>

            <input
              name="brand"
              defaultValue={
                listing.brand || ""
              }
              className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold">
              Condition
            </label>

            <select
              name="condition"
              required
              defaultValue={
                listing.condition
              }
              className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 font-bold"
            >
              {conditions.map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {condition}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold">
              Size
            </label>

            <input
              name="size"
              defaultValue={
                listing.size || ""
              }
              className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          Pricing
        </h2>

        <div className="mt-5 flex h-14 items-center rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4">
          <span className="mr-2 font-black">
            LKR
          </span>

          <input
            name="priceLkr"
            type="number"
            min="1"
            required
            defaultValue={
              listing.priceLkr
            }
            className="w-full bg-transparent text-lg font-bold outline-none"
          />
        </div>
      </section>

      <button
        disabled={isSaving}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text)] font-black text-[var(--surface)] disabled:opacity-60"
      >
        <Save size={18} />

        {isSaving
          ? "Saving..."
          : "Save changes"}
      </button>
    </form>
  );
}