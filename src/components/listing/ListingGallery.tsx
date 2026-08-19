"use client";

import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import {
  useRef,
  useState
} from "react";

export function ListingGallery({
  images,
  title
}: {
  images: string[];
  title: string;
}) {
  const galleryRef =
    useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  function goTo(index: number) {
    const safeIndex = Math.max(
      0,
      Math.min(index, images.length - 1)
    );

    const gallery = galleryRef.current;

    if (gallery) {
      gallery.scrollTo({
        left:
          safeIndex *
          gallery.clientWidth,
        behavior: "smooth"
      });
    }

    setCurrentIndex(safeIndex);
  }

  function handleScroll() {
    const gallery = galleryRef.current;

    if (!gallery || !gallery.clientWidth) {
      return;
    }

    const nextIndex = Math.round(
      gallery.scrollLeft /
        gallery.clientWidth
    );

    setCurrentIndex(nextIndex);
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[0.85] rounded-[2rem] bg-[var(--surface-soft)]" />
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[2rem] bg-[var(--surface-soft)]">
        <div
          ref={galleryRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map(
            (imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="w-full shrink-0 snap-center"
              >
                <img
                  src={imageUrl}
                  alt={`${title} photo ${index + 1}`}
                  loading={
                    index === 0
                      ? "eager"
                      : "lazy"
                  }
                  className="aspect-[0.85] w-full object-cover"
                />
              </div>
            )
          )}
        </div>

        {images.length > 1 && (
          <>
            <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">
              {currentIndex + 1} /{" "}
              {images.length}
            </div>

            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() =>
                  goTo(
                    currentIndex - 1
                  )
                }
                className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--surface)]/90 shadow md:flex"
                aria-label="Previous photo"
              >
                <ChevronLeft
                  size={22}
                />
              </button>
            )}

            {currentIndex <
              images.length - 1 && (
              <button
                type="button"
                onClick={() =>
                  goTo(
                    currentIndex + 1
                  )
                }
                className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--surface)]/90 shadow md:flex"
                aria-label="Next photo"
              >
                <ChevronRight
                  size={22}
                />
              </button>
            )}
          </>
        )}
      </div>

      {images.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-2 md:hidden">
            {images.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() =>
                  goTo(index)
                }
                aria-label={`View photo ${index + 1}`}
                className={[
                  "h-2 rounded-full transition-all",
                  currentIndex === index
                    ? "w-6 bg-[var(--text)]"
                    : "w-2 bg-[var(--border)]"
                ].join(" ")}
              />
            ))}
          </div>

          <div className="mt-4 hidden grid-cols-5 gap-3 md:grid">
            {images.map(
              (imageUrl, index) => (
                <button
                  type="button"
                  key={`${imageUrl}-thumbnail`}
                  onClick={() =>
                    goTo(index)
                  }
                  className={[
                    "overflow-hidden rounded-2xl border-2",
                    currentIndex === index
                      ? "border-[var(--text)]"
                      : "border-transparent"
                  ].join(" ")}
                >
                  <img
                    src={imageUrl}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}