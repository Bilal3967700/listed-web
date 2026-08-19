"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Upload,
  X
} from "lucide-react";

import { CategoryPicker } from "@/components/listing/CategoryPicker";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types/listing";

const conditions = [
  "New with tags",
  "New without tags",
  "Excellent",
  "Very Good",
  "Good",
  "Fair"
];

const maximumPhotos = 8;
const maximumFileSize = 8 * 1024 * 1024;

function slugifyFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
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
        key: getFileKey(file),
        name: file.name,
        url: URL.createObjectURL(file)
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);

  function handleFiles(
    selectedFiles: FileList | null
  ) {
    if (!selectedFiles) {
      return;
    }

    const incomingFiles =
      Array.from(selectedFiles);

    const nonImage =
      incomingFiles.find(
        (file) =>
          !file.type.startsWith("image/")
      );

    if (nonImage) {
      setMessage(
        `${nonImage.name} is not an image file.`
      );

      return;
    }

    const tooLarge =
      incomingFiles.find(
        (file) =>
          file.size > maximumFileSize
      );

    if (tooLarge) {
      setMessage(
        `${tooLarge.name} is larger than 8MB.`
      );

      return;
    }

    setFiles((currentFiles) => {
      const combined = [
        ...currentFiles,
        ...incomingFiles
      ];

      const uniqueFiles =
        combined.filter(
          (file, index, allFiles) =>
            index ===
            allFiles.findIndex(
              (candidate) =>
                getFileKey(candidate) ===
                getFileKey(file)
            )
        );

      const limitedFiles =
        uniqueFiles.slice(
          0,
          maximumPhotos
        );

      if (
        uniqueFiles.length >
        maximumPhotos
      ) {
        setMessage(
          `A listing can contain up to ${maximumPhotos} photos.`
        );
      } else if (
        limitedFiles.length ===
        currentFiles.length
      ) {
        setMessage(
          "Those photos have already been selected."
        );
      } else {
        setMessage(
          `${limitedFiles.length} photo(s) selected.`
        );
      }

      return limitedFiles;
    });
  }

  function removeFile(index: number) {
    setFiles((currentFiles) => {
      const remaining =
        currentFiles.filter(
          (_, fileIndex) =>
            fileIndex !== index
        );

      setMessage(
        remaining.length > 0
          ? `${remaining.length} photo(s) selected.`
          : ""
      );

      return remaining;
    });
  }

  function removeAllFiles() {
    setFiles([]);
    setUploadedCount(0);
    setMessage("");
  }

  function makeCover(index: number) {
    setFiles((currentFiles) => {
      if (
        index < 0 ||
        index >= currentFiles.length
      ) {
        return currentFiles;
      }

      const next = [...currentFiles];

      const [selected] = next.splice(
        index,
        1
      );

      next.unshift(selected);

      return next;
    });

    setMessage(
      "Cover photo updated."
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isUploading) {
      return;
    }

    setMessage("");
    setUploadedCount(0);

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

      return;
    }

    if (priceLkr < 1) {
      setMessage(
        "The listing price must be at least LKR 1."
      );

      return;
    }

    if (files.length < 1) {
      setMessage(
        "Please upload at least one photo."
      );

      return;
    }

    if (
      files.length > maximumPhotos
    ) {
      setMessage(
        `A listing can contain up to ${maximumPhotos} photos.`
      );

      return;
    }

    setIsUploading(true);

    const {
      data: listing,
      error: listingError
    } = await supabase
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
        published_at:
          new Date().toISOString()
      })
      .select("id")
      .single();

    if (
      listingError ||
      !listing
    ) {
      setMessage(
        listingError?.message ||
          "Could not create listing."
      );

      setIsUploading(false);
      return;
    }

    const uploadedStoragePaths:
      string[] = [];

    let successfulUploads = 0;
    let uploadFailure = "";

    for (
      let index = 0;
      index < files.length;
      index++
    ) {
      const file = files[index];

      const safeName =
        slugifyFileName(
          file.name ||
            `photo-${index}.jpg`
        );

      const uniquePart =
        typeof crypto !== "undefined" &&
        "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${index}`;

      const fileName =
        `${uniquePart}-${safeName}`;

      const storagePath =
        `${userId}/${listing.id}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("listing-images")
          .upload(
            storagePath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type ||
                "image/jpeg"
            }
          );

      if (uploadError) {
        uploadFailure =
          uploadError.message;

        break;
      }

      uploadedStoragePaths.push(
        storagePath
      );

      const {
        data: { publicUrl }
      } = supabase.storage
        .from("listing-images")
        .getPublicUrl(storagePath);

      const { error: photoError } =
        await supabase
          .from("listing_photos")
          .insert({
            listing_id: listing.id,
            image_url: publicUrl,
            storage_path: storagePath,
            sort_order: index,
            is_cover: index === 0
          });

      if (photoError) {
        uploadFailure =
          photoError.message;

        break;
      }

      successfulUploads++;

      setUploadedCount(
        successfulUploads
      );
    }

    if (
      uploadFailure ||
      successfulUploads !== files.length
    ) {
      /*
       * Remove the listing. The database
       * cascade removes any listing_photos
       * rows that were already created.
       */
      await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", userId);

      /*
       * Database cascades do not remove
       * Storage objects, so clean them up
       * separately.
       */
      if (
        uploadedStoragePaths.length > 0
      ) {
        const {
          error: cleanupError
        } = await supabase.storage
          .from("listing-images")
          .remove(
            uploadedStoragePaths
          );

        if (cleanupError) {
          console.error(
            "Listing image cleanup error:",
            cleanupError.message
          );
        }
      }

      setMessage(
        uploadFailure ||
          "One or more images could not be uploaded. Please try again."
      );

      setUploadedCount(0);
      setIsUploading(false);

      return;
    }

    setMessage(
      "Listing uploaded successfully."
    );

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              Photos
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Add up to eight photos.
              The first photo is the cover.
            </p>
          </div>

          {files.length > 0 && (
            <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-black">
              {files.length} /{" "}
              {maximumPhotos}
            </span>
          )}
        </div>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map(
              (preview, index) => (
                <div
                  key={preview.key}
                  className="relative overflow-hidden rounded-2xl bg-[var(--surface-soft)]"
                >
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="aspect-square w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeFile(index)
                    }
                    disabled={
                      isUploading
                    }
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-50"
                    aria-label={`Remove ${preview.name}`}
                  >
                    <X size={15} />
                  </button>

                  {index === 0 ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-[var(--surface)] px-3 py-1 text-[10px] font-black shadow">
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        makeCover(index)
                      }
                      disabled={
                        isUploading
                      }
                      className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black text-white disabled:opacity-50"
                    >
                      Make cover
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {files.length <
          maximumPhotos && (
          <label
            className={[
              "mt-4 flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center",
              isUploading
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            ].join(" ")}
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <ImagePlus size={24} />
            </div>

            <p className="text-lg font-black">
              {files.length > 0
                ? "Add more photos"
                : "Upload photos"}
            </p>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Select several images at once
              or add them over multiple
              selections.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              multiple
              disabled={isUploading}
              onChange={(event) => {
                handleFiles(
                  event.target.files
                );

                /*
                 * Reset the input so the
                 * same file can be selected
                 * again after removal.
                 */
                event.currentTarget.value =
                  "";
              }}
              className="hidden"
            />
          </label>
        )}

        {files.length ===
          maximumPhotos && (
          <p className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-3 text-center text-sm font-bold">
            Maximum of eight photos
            selected.
          </p>
        )}

        {files.length > 0 && (
          <button
            type="button"
            disabled={isUploading}
            onClick={removeAllFiles}
            className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] disabled:opacity-50"
          >
            <X size={16} />
            Remove all photos
          </button>
        )}
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          About your item
        </h2>

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
              disabled={isUploading}
              placeholder="Tell buyers what you're selling"
              className="mt-2 w-full border-b border-[var(--border)] bg-transparent py-3 text-lg outline-none placeholder:text-[var(--text-muted)] disabled:opacity-60"
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
              maxLength={2000}
              disabled={isUploading}
              placeholder="Tell buyers more about it"
              className="mt-2 w-full resize-none border-b border-[var(--border)] bg-transparent py-3 text-lg outline-none placeholder:text-[var(--text-muted)] disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          Item details
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)]">
              Category
            </label>

            <div className="mt-2">
              <CategoryPicker
                categories={categories}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-[var(--text-muted)]">
              Brand
            </label>

            <input
              name="brand"
              type="text"
              maxLength={80}
              disabled={isUploading}
              placeholder="Nike, Apple, Pokémon, Levi's..."
              className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-[var(--text-muted)]">
              Condition
            </label>

            <select
              name="condition"
              required
              disabled={isUploading}
              defaultValue=""
              className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 font-bold outline-none disabled:opacity-60"
            >
              <option
                value=""
                disabled
              >
                Choose condition
              </option>

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
            <label className="text-sm font-bold text-[var(--text-muted)]">
              Size
            </label>

            <input
              name="size"
              type="text"
              maxLength={50}
              disabled={isUploading}
              placeholder="M, UK 9, W32, One size..."
              className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-2xl font-black">
          Pricing
        </h2>

        <div className="mt-5">
          <label className="text-sm font-bold text-[var(--text-muted)]">
            Price
          </label>

          <div className="mt-2 flex h-14 items-center rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4">
            <span className="mr-2 font-black">
              LKR
            </span>

            <input
              name="priceLkr"
              type="number"
              min="1"
              step="1"
              required
              disabled={isUploading}
              placeholder="0"
              className="w-full bg-transparent text-lg font-bold outline-none disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {isUploading && (
        <p className="rounded-2xl bg-[var(--surface)] p-4 text-center text-sm font-bold">
          Uploading {uploadedCount} of{" "}
          {files.length} photo(s)...
        </p>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text)] font-black text-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload size={18} />

        {isUploading
          ? "Uploading..."
          : "Upload listing"}
      </button>

      <p className="pb-4 text-center text-xs text-[var(--text-muted)]">
        By uploading, you confirm this
        item is allowed on Listed.lk.
      </p>
    </form>
  );
}